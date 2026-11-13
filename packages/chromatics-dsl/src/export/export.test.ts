import { test, expect, describe } from "vitest";
import type { Color } from "@lilbunnyrabbit/chromatics";
import { evaluate } from "../evaluator.js";
import { schemeFromEvalResult } from "../scheme/adapter.js";
import { deriveScheme } from "../scheme/derive.js";
import {
  toCssVars,
  toPaletteVars,
  toTokens,
  toTailwind,
  toMarkdown,
  serializeColor,
  isCssColor,
  kebab,
  type ColorFormat,
} from "./index.js";

const SRC = `bg = Oklch(0.2, 0.02, 250)
brand = parse("#6c5ce7")
bg_dark = bg.to(Oklch).darken(0.05)`;
const scheme = schemeFromEvalResult(evaluate(SRC), SRC);

describe("exporters", () => {
  test("palette vars: every color variable", () => {
    const css = toPaletteVars(scheme);
    expect(css).toContain(":root {");
    expect(css).toContain("--bg:");
    expect(css).toContain("--bg-dark:");
    expect(css).toContain("oklch(");
  });

  test("DTCG tokens are valid JSON with $type color", () => {
    const json = JSON.parse(toTokens(scheme));
    expect(json.bg.$type).toBe("color");
    expect(json.brand.$value).toBe("#6c5ce7");
    expect(json.bg.$extensions["com.chromatics"].oklch).toContain("oklch(");
  });

  test("tailwind @theme + legacy colors", () => {
    const tw = toTailwind(scheme);
    expect(tw).toContain("@theme {");
    expect(tw).toContain("--color-bg:");
    expect(tw).toContain("'brand': '#6c5ce7'");
  });

  test("markdown table is aligned (uniform row width)", () => {
    const md = toMarkdown(scheme);
    const lines = md.split("\n");
    expect(lines[0]).toContain("| name");
    expect(lines[1]).toMatch(/^\| -+ \| -+ \| -+ \| -+ \|$/);
    expect(new Set(lines.map((l) => l.length)).size).toBe(1);
  });

  test("kebab", () => {
    expect(kebab("bg_dark")).toBe("bg-dark");
    expect(kebab("primaryFg")).toBe("primary-fg");
  });
});

describe("color representation", () => {
  test("isCssColor accepts CSS forms, rejects color(--custom) / color(cmyk)", () => {
    expect(isCssColor("#6c5ce7")).toBe(true);
    expect(isCssColor("oklch(0.6 0.1 250)")).toBe(true);
    expect(isCssColor("hsl(250 60% 50%)")).toBe(true);
    expect(isCssColor("color(display-p3 0.4 0.3 0.9)")).toBe(true);
    expect(isCssColor("color(xyz-d65 0.2 0.1 0.7)")).toBe(true);
    expect(isCssColor("color(--hsv 250 0.6 0.9)")).toBe(false);
    expect(isCssColor("color(cmyk 0.5 0.6 0 0.1)")).toBe(false);
  });

  test("as-defined keeps the authoring model (oklch stays oklch, hex stays hex)", () => {
    const fmt: ColorFormat = { mode: "as-defined", model: "hex" };
    const bg = scheme.byName.get("bg")!;
    const brand = scheme.byName.get("brand")!;
    expect(serializeColor(bg.color, fmt).startsWith("oklch(")).toBe(true);
    expect(serializeColor(brand.color, fmt)).toBe("#6c5ce7");
  });

  test("derived colors track their own model (not the fallback)", () => {
    const SRC2 = `brand = parse("#6c5ce7")
primary = brand.to(Srgb).gamutMap().to(Oklch)
accent = primary.clone().rotateHue(-150)
copy = brand`;
    const s = schemeFromEvalResult(evaluate(SRC2), SRC2);
    // method-chain derivations are instances of the class they ended up in
    expect(s.byName.get("primary")!.color.model).toBe("oklch");
    expect(s.byName.get("accent")!.color.model).toBe("oklch");
    // an alias is the same Srgb8 instance parse() returned
    expect(s.byName.get("copy")!.color.model).toBe("srgb8");
    const fmt: ColorFormat = { mode: "as-defined", model: "hex" };
    // as-defined now keeps the derived oklch colors as oklch(), not hex fallback
    expect(serializeColor(s.byName.get("primary")!.color, fmt).startsWith("oklch(")).toBe(true);
    expect(serializeColor(s.byName.get("accent")!.color, fmt).startsWith("oklch(")).toBe(true);
    // hex literal + sRGB alias still serialize as hex
    expect(serializeColor(s.byName.get("brand")!.color, fmt)).toBe("#6c5ce7");
    expect(serializeColor(s.byName.get("copy")!.color, fmt)).toBe("#6c5ce7");
  });

  test("single model normalises every color to one model", () => {
    const css = toPaletteVars(scheme, { mode: "single", model: "hex" });
    // every value is a hex literal
    for (const line of css.split("\n").filter((l) => l.includes("--"))) {
      expect(line.trim()).toMatch(/: #[0-9a-f]{6};$/i);
    }
    const oklchCss = toPaletteVars(scheme, { mode: "single", model: "Oklch" });
    for (const line of oklchCss.split("\n").filter((l) => l.includes("--"))) {
      expect(line).toContain("oklch(");
    }
  });

  test("as-defined falls back when the authoring model is not valid CSS", () => {
    const SRC2 = `vivid = Hsv(280, 0.8, 0.9)`;
    const s2 = schemeFromEvalResult(evaluate(SRC2), SRC2);
    const e = s2.byName.get("vivid")!;
    expect(e.color.model).toBe("hsv");
    // Hsv has no CSS form (no toCss) → fallback to hex
    expect(serializeColor(e.color, { mode: "as-defined", model: "hex" })).toMatch(/^#[0-9a-f]{6}$/i);
    // a different fallback is honoured
    expect(serializeColor(e.color, { mode: "as-defined", model: "Oklch" }).startsWith("oklch(")).toBe(true);
  });

  test("serialized colors round long floats (clean output)", () => {
    const css = toPaletteVars(scheme, { mode: "single", model: "Oklch" });
    expect(css).toContain("oklch(");
    // no value should carry 6+ decimal places
    expect(css.match(/\d+\.\d{6,}/g)).toBeNull();
  });
});

describe("toCssVars: one mode, the declared roles only", () => {
  const SRC3 = `background = Oklch(0.2, 0.02, 250)
background_dark = Oklch(0.15, 0.02, 250)
foreground = Oklch(0.95, 0.01, 250)
helper = Oklch(0.5, 0.1, 30)
roles {
  foreground = foreground
  dark {
    background = background_dark
  }
}`;
  const derived = deriveScheme(SRC3, { roles: ["background", "foreground", "cottontail"], pairs: [] });

  test("emits exactly the bound roles, in declared order, kebab-named", () => {
    const css = toCssVars(derived.modes.dark, { mode: "single", model: "hex" });
    const names = [...css.matchAll(/--([\w-]+):/g)].map((m) => m[1]);
    expect(names).toEqual(["background", "foreground"]);
    expect(css).not.toContain("helper");
    expect(css).not.toContain("cottontail");
  });

  test("each mode carries its own binding", () => {
    const hexOf = (name: string) =>
      serializeColor(derived.variables.get(name)!.value as Color, { mode: "single", model: "hex" });
    expect(toCssVars(derived.modes.light, { mode: "single", model: "hex" })).toContain(
      `--background: ${hexOf("background")};`
    );
    expect(toCssVars(derived.modes.dark, { mode: "single", model: "hex" })).toContain(
      `--background: ${hexOf("background_dark")};`
    );
  });

  test("snake_case roles become kebab custom properties", () => {
    const d = deriveScheme("background_dark = Oklch(0.15, 0.02, 250)", { roles: ["background_dark"], pairs: [] });
    expect(toCssVars(d.modes.light)).toMatch(/^:root \{\n  --background-dark: oklch\(/);
  });

  test("an empty mode is an empty block", () => {
    expect(toCssVars({})).toBe(":root {\n}");
  });
});
