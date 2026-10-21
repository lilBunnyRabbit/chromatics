// ADR-007: the exports map is generated from the model folders, one subpath per model, plus `/cvd`
// (ADR-005, grill 79: a free function on its own subpath for bundle size).
import { readdirSync } from "node:fs";

const root = new URL("../", import.meta.url);

export function modelFolders(): string[] {
  return readdirSync(new URL("src/models/", root), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

export function exportsMap(): Record<string, unknown> {
  const map: Record<string, unknown> = {
    ".": { types: "./dist/index.d.ts", default: "./dist/index.js" },
    "./all": { types: "./dist/all.d.ts", default: "./dist/all.js" },
    "./cvd": { types: "./dist/cvd.d.ts", default: "./dist/cvd.js" },
  };
  for (const name of modelFolders()) {
    map[`./${name}`] = { types: `./dist/models/${name}/${name}.d.ts`, default: `./dist/models/${name}/${name}.js` };
  }
  map["./package.json"] = "./package.json";
  return map;
}

if (import.meta.main) {
  const file = new URL("package.json", root);
  const pkg = await Bun.file(file).json();
  pkg.exports = exportsMap();
  await Bun.write(file, JSON.stringify(pkg, null, 2) + "\n");
  console.log(`exports: ${Object.keys(pkg.exports).length} entries`);
}
