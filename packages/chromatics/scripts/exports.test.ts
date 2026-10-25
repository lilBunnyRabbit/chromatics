import { describe, expect, it } from "vitest";
import pkg from "../package.json" with { type: "json" };
import { exportsMap, modelFolders } from "./exports.js";

describe("package exports (ADR-007)", () => {
  it("package.json exports are up to date: run `bun run exports`", () => {
    expect(pkg.exports).toEqual(exportsMap());
  });

  it("every model folder has a subpath and a same-named entry file", () => {
    for (const name of modelFolders()) expect(Object.keys(pkg.exports)).toContain(`./${name}`);
  });
});
