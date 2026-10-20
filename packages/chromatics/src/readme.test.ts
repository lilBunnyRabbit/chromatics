import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { models } from "./all.js";

describe("README", () => {
  it("lists every model class", () => {
    const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
    for (const m of models) expect(readme, m.name).toContain(`\`${m.name}\``);
  });
});
