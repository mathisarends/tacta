import { mkdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

// Pack snapshots instead of using machine-specific file paths or symlinks in Maximus.
const frontend = resolve(process.argv[2] ?? "../maximus-trading/frontend");
const manifest = JSON.parse(await readFile(resolve(frontend, "package.json"), "utf8"));
if (manifest.name !== "maximus-trading-frontend") {
  throw new Error(`Expected the Maximus frontend at ${frontend}`);
}
const npm = process.env.npm_execpath;
if (!npm) {
  throw new Error("Run this script through npm run sync:maximus -- <frontend-path>");
}
function run(args, cwd = process.cwd()) {
  const result = spawnSync(process.execPath, [npm, ...args], { cwd, stdio: "inherit" });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
run(["run", "build"]);
const vendor = resolve(frontend, "vendor");
await mkdir(vendor, { recursive: true });
const archives = [];
for (const name of ["core", "workspace", "chat"]) {
  const pkg = JSON.parse(await readFile(`packages/${name}/package.json`, "utf8"));
  run(["pack", "--workspace", `@tacta/${name}`, "--pack-destination", vendor]);
  archives.push(`./vendor/tacta-${name}-${pkg.version}.tgz`);
}
run(["install", "--save-exact", ...archives], frontend);
