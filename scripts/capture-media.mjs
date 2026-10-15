import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright";
import { createServer } from "vite";

// Internal fixtures mount the actual library components. Captures contain no showcase page.
const output = resolve("docs/media");
const recordings = resolve(".cache/recordings");
await mkdir(output, { recursive: true });
await mkdir(recordings, { recursive: true });
const server = await createServer({
  configFile: false,
  root: process.cwd(),
  server: { host: "127.0.0.1", port: 4175, strictPort: true },
  optimizeDeps: { entries: ["test/fixtures/components.ts"] },
});
await server.listen();
const browser = await chromium.launch({ headless: true });
const errors = [];
const report = { screenshots: [], videos: [], checks: [] };
const contexts = [];
async function open(name, video = false) {
  const context = await browser.newContext({
    viewport: { width: 900, height: 680 },
    deviceScaleFactor: 1,
    recordVideo: video ? { dir: recordings, size: { width: 900, height: 680 } } : undefined,
  });
  contexts.push(context);
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`http://127.0.0.1:4175/test/fixtures/components.html?component=${name}`, {
    waitUntil: "networkidle",
  });
  await page.locator("html[data-ready=true]").waitFor();
  await page.locator("#component").waitFor({ state: "visible" });
  return { context, page, component: page.locator("#component") };
}
async function shot(locator, name) {
  await locator.screenshot({ path: resolve(output, `${name}.png`), animations: "disabled" });
  report.screenshots.push(`${name}.png`);
  console.log(`Cropped component: ${name}`);
}
async function finish(session, name, bounds) {
  const video = session.page.video();
  await session.context.close();
  const source = await video.path();
  const crop = {
    x: Math.floor(bounds.x),
    y: Math.floor(bounds.y),
    width: Math.floor(bounds.width / 2) * 2,
    height: Math.floor(bounds.height / 2) * 2,
  };
  const result = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      source,
      "-vf",
      `crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}`,
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "25",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      resolve(output, `${name}.mp4`),
    ],
    { encoding: "utf8", windowsHide: true },
  );
  if (result.error || result.status !== 0) {
    throw new Error(result.error?.message ?? result.stderr.slice(-1000));
  }
  const gif = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      resolve(output, `${name}.mp4`),
      "-vf",
      "fps=8,scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer",
      "-loop",
      "0",
      resolve(output, `${name}.gif`),
    ],
    { encoding: "utf8", windowsHide: true },
  );
  if (gif.status !== 0) {
    throw new Error(gif.stderr.slice(-1000));
  }
  report.videos.push({ file: `${name}.mp4`, crop });
  console.log(`Component video: ${name}`);
}
try {
  for (const name of [
    "question",
    "composer",
    "chat",
    "approval",
    "workspace",
    "files",
    "editor",
    "diff",
    "explorer",
    "settings",
    "search",
    "sidebar",
    "notifications",
  ]) {
    const session = await open(name);
    if (name === "files") {
      await session.page.locator("tacta-spreadsheet-preview table").waitFor();
    }
    if (name === "editor") {
      await session.page.locator(".cm-content").waitFor();
    }
    await shot(session.component, name);
    if (name === "question") {
      await session.page.evaluate(() => {
        document.documentElement.dataset.tactaTheme = "light";
      });
      await shot(session.component, "question-light");
    }
    if (name === "composer") {
      await session.page.locator("tacta-composer-input textarea").fill("/");
      await shot(session.page.locator("tacta-composer-command-menu"), "commands");
    }
    await session.context.close();
  }
  const question = await open("question", true);
  const questionBounds = await question.component.boundingBox();
  await question.component.getByRole("radio", { name: /A detailed explanation/ }).check();
  await question.component.getByRole("button", { name: "Send", exact: true }).click();
  await question.page.waitForFunction(() => window.fixtureEvents?.length === 1);
  await question.component.getByRole("textbox").fill("Include a migration example.");
  await question.component.getByRole("textbox").press("Enter");
  await question.page.waitForFunction(() => window.fixtureEvents?.length === 2);
  report.checks.push("Question choice and free-text response");
  await finish(question, "question-workflow", questionBounds);

  const terminal = await open("terminal", true);
  await terminal.page.locator(".xterm-screen").waitFor();
  await shot(terminal.component, "terminal");
  const terminalBounds = await terminal.component.boundingBox();
  const input = terminal.page.locator("tacta-remote-terminal textarea");
  await input.focus();
  await input.pressSequentially("help", { delay: 120 });
  await input.press("Enter");
  await input.press("Control+Shift+f");
  const find = terminal.page.locator("tacta-terminal-search input");
  await find.fill("workspace");
  await shot(terminal.component, "terminal-search");
  await find.press("Escape");
  report.checks.push("Terminal input and search");
  await finish(terminal, "terminal-workflow", terminalBounds);

  const remote = await open("browser", true);
  await remote.page.waitForFunction(
    () =>
      document
        .querySelector("tacta-browser-panel")
        ?.shadowRoot?.querySelector("tacta-remote-browser")
        ?.shadowRoot?.querySelector("video")?.videoWidth > 0,
  );
  const toolbar = remote.page.locator("tacta-browser-panel .browser-toolbar");
  await shot(toolbar, "browser");
  const toolbarBounds = await toolbar.boundingBox();
  const address = remote.page.locator("tacta-browser-address-bar input");
  await address.fill("example.com/docs");
  await address.press("Enter");
  await remote.page.getByRole("button", { name: "Back", exact: true }).click();
  await remote.page.getByRole("button", { name: "Toggle viewport fit", exact: true }).click();
  report.checks.push("Browser stream, address, back and fit");
  await finish(remote, "browser-workflow", toolbarBounds);

  const image = await open("image", true);
  const canvas = image.page.locator("tacta-image-canvas canvas");
  await canvas.waitFor();
  const bounds = await canvas.boundingBox();
  const componentBounds = await image.component.boundingBox();
  const x = bounds.x + bounds.width * 0.35;
  const y = bounds.y + bounds.height * 0.45;
  await image.page.mouse.move(x, y);
  await image.page.mouse.down();
  await image.page.mouse.move(x + 60, y - 20, { steps: 10 });
  await image.page.mouse.move(x + 120, y + 10, { steps: 10 });
  await image.page.mouse.up();
  await image.page.getByRole("button", { name: "Add text", exact: true }).click();
  await canvas.click({ position: { x: bounds.width * 0.5, y: bounds.height * 0.25 } });
  const text = image.page.getByRole("textbox", { name: "Enter text", exact: true });
  await text.fill("Review this peak");
  await text.press("Enter");
  await shot(image.component, "image-editor");
  await image.page.getByRole("button", { name: "Undo", exact: true }).click();
  await image.page.getByRole("button", { name: "Redo", exact: true }).click();
  const download = image.page.waitForEvent("download");
  await image.page.getByRole("button", { name: "Download PNG", exact: true }).click();
  if (!(await download).suggestedFilename().endsWith(".png")) {
    throw new Error("Expected PNG export");
  }
  report.checks.push("Image draw, text, undo/redo and PNG export");
  await finish(image, "image-annotations", componentBounds);
  if (errors.length) {
    throw new Error(errors.join("\n"));
  }
  await writeFile(resolve(output, "manifest.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    `Verified ${report.screenshots.length} component crops and ${report.videos.length} component videos.`,
  );
} finally {
  for (const context of contexts) {
    await context.close().catch(() => {});
  }
  await browser.close();
  await server.close();
}
