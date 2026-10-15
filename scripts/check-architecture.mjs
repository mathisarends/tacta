import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import ts from "typescript";

const files = [];
async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      await collect(file);
    } else if (file.endsWith(".ts")) {
      files.push(file);
    }
  }
}
const manifest = JSON.parse(await readFile("package.json", "utf8"));
const names = manifest.workspaces.map((path) => path.split("/")[1]);
for (const name of names) {
  await collect(`packages/${name}/src`);
}
const graph = new Map(files.map((file) => [file, []]));
const packages = new Map(names.map((name) => [name, new Set()]));

function resolveModule(file, specifier) {
  if (specifier.startsWith(".")) {
    const base = resolve(dirname(file), specifier.replace(/\.js$/, ".ts"));
    return graph.has(base) ? base : undefined;
  }
  const match = /^@tacta\/([a-z-]+)(?:\/(.*))?$/.exec(specifier);
  if (!match) {
    return undefined;
  }
  const subpath = match[2] ?? "index";
  const base = resolve(`packages/${match[1]}/src/${subpath}.ts`);
  if (graph.has(base)) {
    return base;
  }
  const index = resolve(`packages/${match[1]}/src/${subpath}/index.ts`);
  return graph.has(index) ? index : undefined;
}

for (const file of files) {
  const code = await readFile(file, "utf8");
  const source = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true);
  function add(specifier) {
    if (/^@(api|app|features|shared|i18n|chat)(?:\/|$)/.test(specifier)) {
      throw new Error(`Application import ${specifier} in ${file}`);
    }
    const dependency = resolveModule(file, specifier);
    if (dependency) {
      graph.get(file).push(dependency);
    }
    const match = /^@tacta\/([a-z-]+)/.exec(specifier);
    const owner = file.replaceAll("\\", "/").match(/\/packages\/([^/]+)\//)?.[1];
    if (owner === "core" && match && match[1] !== "core") {
      throw new Error("Core must not depend on extensions");
    }
    if (match && owner !== match[1]) {
      packages.get(owner).add(match[1]);
    }
  }
  function visit(node) {
    if (ts.isImportDeclaration(node)) {
      const clause = node.importClause;
      const typeOnly =
        clause?.isTypeOnly ||
        (!clause?.name &&
          clause?.namedBindings &&
          ts.isNamedImports(clause.namedBindings) &&
          clause.namedBindings.elements.every((item) => item.isTypeOnly));
      if (!typeOnly) {
        add(node.moduleSpecifier.text);
      }
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && !node.isTypeOnly) {
      if (
        !node.exportClause ||
        !ts.isNamedExports(node.exportClause) ||
        node.exportClause.elements.some((item) => !item.isTypeOnly)
      ) {
        add(node.moduleSpecifier.text);
      }
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      add(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}

function assertAcyclic(edges, label) {
  const complete = new Set();
  const active = new Set();
  function visit(node, stack = []) {
    if (active.has(node)) {
      throw new Error(`${label} cycle: ${[...stack, node].join(" → ")}`);
    }
    if (complete.has(node)) {
      return;
    }
    active.add(node);
    for (const dependency of edges.get(node) ?? []) {
      visit(dependency, [...stack, node]);
    }
    active.delete(node);
    complete.add(node);
  }
  for (const node of edges.keys()) {
    visit(node);
  }
}
assertAcyclic(graph, "Runtime module");
assertAcyclic(packages, "Package");
console.log(
  `Checked ${files.length} TypeScript modules: no application imports or runtime cycles.`,
);
