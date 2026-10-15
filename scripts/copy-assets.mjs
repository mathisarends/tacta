import { copyFile, readFile } from "node:fs/promises";

await copyFile("packages/core/src/tokens.css", "packages/core/dist/tokens.css");
const { workspaces } = JSON.parse(await readFile("package.json", "utf8"));
for (const path of workspaces) {
  const name = path.split("/")[1];
  await copyFile("LICENSE", `packages/${name}/LICENSE`);
}

await copyFile("packages/core/THIRD_PARTY_NOTICES.md", "packages/core/dist/THIRD_PARTY_NOTICES.md");
