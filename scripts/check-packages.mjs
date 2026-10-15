import { access, readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import ts from "typescript";

const root = JSON.parse(await readFile("package.json", "utf8"));
let modules = 0;
for (const workspace of root.workspaces) {
  const manifest = JSON.parse(await readFile(`${workspace}/package.json`, "utf8"));
  const dependencies = { ...manifest.dependencies, ...manifest.peerDependencies };
  if (manifest.name === "@tacta/core" && Object.keys(dependencies).join() !== "lit") {
    throw new Error("Core must have Lit as its only runtime dependency.");
  }
  for (const [subpath, target] of Object.entries(manifest.exports)) {
    const paths = typeof target === "string" ? [target] : [target.types, target.default];
    for (const path of paths) {
      if (!path) {
        throw new Error(`${manifest.name}${subpath} has an incomplete export`);
      }
      await access(resolve(workspace, path)).catch(() => {
        throw new Error(`Missing built export: ${workspace}/${path}`);
      });
    }
  }
  async function visitDirectory(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = `${directory}/${entry.name}`;
      if (entry.isDirectory()) {
        await visitDirectory(file);
        continue;
      }
      if (!file.endsWith(".ts")) {
        continue;
      }
      ++modules;
      const source = ts.createSourceFile(
        file,
        await readFile(file, "utf8"),
        ts.ScriptTarget.Latest,
        true,
      );
      function check(specifier) {
        if (specifier.startsWith(".") || specifier.startsWith("node:")) {
          return;
        }
        const pieces = specifier.split("/");
        const name = specifier.startsWith("@") ? pieces.slice(0, 2).join("/") : pieces[0];
        if (name !== manifest.name && !dependencies[name]) {
          throw new Error(`${file} imports undeclared dependency ${name} (${specifier})`);
        }
      }
      function visit(node) {
        if (
          (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
          node.moduleSpecifier &&
          ts.isStringLiteral(node.moduleSpecifier)
        ) {
          check(node.moduleSpecifier.text);
        }
        if (
          ts.isCallExpression(node) &&
          node.expression.kind === ts.SyntaxKind.ImportKeyword &&
          ts.isStringLiteral(node.arguments[0])
        ) {
          check(node.arguments[0].text);
        }
        ts.forEachChild(node, visit);
      }
      visit(source);
    }
  }
  await visitDirectory(`${workspace}/src`);
}
console.log(
  `Verified ${root.workspaces.length} package export maps and ${modules} modules; direct dependencies are declared and core only depends on Lit.`,
);
