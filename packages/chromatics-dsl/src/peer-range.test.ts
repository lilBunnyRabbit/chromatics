import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// ADR-018 82u: every color-package minor ships with a DSL changeset that widens the peer range by hand
// (`^0.2.0 || ^0.3.0`). The version checked is the one the next release publishes: the workspace version
// with the pending changesets for the color package applied, so the check holds before and after the
// Version PR. Only caret ranges joined by `||` are accepted; anything else fails.

const COLOR = "@lilbunnyrabbit/chromatics";
const root = new URL("../../../", import.meta.url);
const readJson = (path: string) => JSON.parse(readFileSync(new URL(path, root), "utf8")) as Record<string, unknown>;

type Version = [major: number, minor: number, patch: number];

function parseVersion(text: string): Version {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(text.trim());
  if (!m) throw new Error(`not a plain x.y.z version: "${text}"`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

const compare = (a: Version, b: Version) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

// npm semver caret: ^1.2.3 := >=1.2.3 <2.0.0, ^0.2.3 := >=0.2.3 <0.3.0, ^0.0.3 := >=0.0.3 <0.0.4.
function caretUpper([major, minor, patch]: Version): Version {
  if (major > 0) return [major + 1, 0, 0];
  if (minor > 0) return [0, minor + 1, 0];
  return [0, 0, patch + 1];
}

function satisfies(range: string, version: Version): boolean {
  return range.split("||").some((part) => {
    const m = /^\s*\^(\d+\.\d+\.\d+)\s*$/.exec(part);
    if (!m?.[1]) throw new Error(`peer range part "${part.trim()}" is not a caret range (^x.y.z)`);
    const low = parseVersion(m[1]);
    return compare(version, low) >= 0 && compare(version, caretUpper(low)) < 0;
  });
}

const BUMPS = ["patch", "minor", "major"] as const;

function pendingBump(name: string): (typeof BUMPS)[number] | null {
  let best = -1;
  const dir = new URL(".changeset/", root);
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".md") && f !== "README.md")) {
    const front = /^---\n([\s\S]*?)\n---/.exec(readFileSync(new URL(file, dir), "utf8"))?.[1] ?? "";
    for (const line of front.split("\n")) {
      const m = /^\s*["']?([^"':]+)["']?\s*:\s*(patch|minor|major)\s*$/.exec(line);
      if (m?.[1] === name) best = Math.max(best, BUMPS.indexOf(m[2] as (typeof BUMPS)[number]));
    }
  }
  return best < 0 ? null : BUMPS[best]!;
}

function bumped([major, minor, patch]: Version, bump: (typeof BUMPS)[number] | null): Version {
  if (bump === "major") return [major + 1, 0, 0];
  if (bump === "minor") return [major, minor + 1, 0];
  if (bump === "patch") return [major, minor, patch + 1];
  return [major, minor, patch];
}

describe("peer range (ADR-018 82u)", () => {
  it("includes the color package version the next release publishes", () => {
    const dsl = readJson("packages/chromatics-dsl/package.json");
    const color = readJson("packages/chromatics/package.json");
    const range = (dsl.peerDependencies as Record<string, string> | undefined)?.[COLOR];
    expect(range, "peerDependencies has the color package").toBeTypeOf("string");
    const version = bumped(parseVersion(String(color.version)), pendingBump(COLOR));
    expect(satisfies(range!, version), `${range} includes ${version.join(".")}`).toBe(true);
  });

  it("parses carets as npm does, and rejects other range syntax", () => {
    expect(satisfies("^0.2.0", [0, 2, 5])).toBe(true);
    expect(satisfies("^0.2.0", [0, 3, 0])).toBe(false);
    expect(satisfies("^0.2.0 || ^0.3.0", [0, 3, 0])).toBe(true);
    expect(satisfies("^1.2.0", [1, 9, 0])).toBe(true);
    expect(satisfies("^1.2.0", [2, 0, 0])).toBe(false);
    expect(satisfies("^0.0.3", [0, 0, 4])).toBe(false);
    for (const bad of [">=0.2.0", "~0.2.0", "0.2.0", "^0.2", "*", "^0.2.0 - ^0.3.0"]) {
      expect(() => satisfies(bad, [0, 2, 0]), bad).toThrow();
    }
  });
});
