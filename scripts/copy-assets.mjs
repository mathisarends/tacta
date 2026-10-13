import { copyFile } from "node:fs/promises";

await copyFile("packages/core/src/tokens.css", "packages/core/dist/tokens.css");
for (const name of ["core", "workspace", "chat"]) {
  await copyFile("LICENSE", `packages/${name}/LICENSE`);
}
