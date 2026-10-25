import { describe, expect, it } from "vitest";
import { Oklch, Srgb } from "@lilbunnyrabbit/chromatics";
import { deriveScheme } from "./derive.js";
import { audit } from "./audit.js";

// WebOS's 17 theme tokens (ADR-018 context): snake_case, one mode per theme.
const WEBOS = [
  "background",
  "background_lightest",
  "background_lighter",
  "background_light",
  "background_dark",
  "background_darker",
  "background_darkest",
  "foreground",
  "primary",
  "secondary",
  "tertiary",
  "accent",
  "cottontail",
  "success",
  "warning",
  "error",
  "info",
] as const;

const PALETTE = `ink = Oklch(0.2, 0.02, 250)
paper = Oklch(0.97, 0.01, 250)
brand = Oklch(0.62, 0.17, 30)
`;

const color = (r: ReturnType<typeof deriveScheme>, name: string) => r.variables.get(name)?.value;

describe("deriveScheme: host-declared roles", () => {
  it("binds a role to the color variable of the same name when there is no auto", () => {
    const r = deriveScheme(`${PALETTE}background = paper\nprimary = brand`, { roles: WEBOS, pairs: [] });
    expect(r.errors).toEqual([]);
    expect(Object.keys(r.modes.light)).toEqual(["background", "primary"]);
    expect(r.modes.light.background).toBe(color(r, "background"));
    expect(r.modes.light.cottontail).toBeUndefined();
  });

  it("a roles {} line beats the same-name variable", () => {
    const r = deriveScheme(`${PALETTE}background = paper\nroles {\n  background = ink\n}`, {
      roles: WEBOS,
      pairs: [],
    });
    expect(r.modes.light.background).toBe(color(r, "ink"));
  });

  it("an unknown role key is an error with its line and span, and binds nothing", () => {
    const src = `${PALETTE}roles {\n  background = paper\n  bg = ink\n}`;
    const r = deriveScheme(src, { roles: WEBOS, pairs: [] });
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0]!.message).toContain("Unknown role 'bg'");
    expect(r.errors[0]!.line).toBe(6);
    const span = r.errors[0]!.span!;
    expect(src.slice(span.start, span.end)).toBe("bg");
    expect(r.modes.light.background).toBe(color(r, "paper"));
  });

  it("checks dark {} and theme() keys too", () => {
    const r = deriveScheme(`${PALETTE}roles {\n  dark {\n    surface = ink\n  }\n}\nt = theme({ fg: "ink" })`, {
      roles: WEBOS,
      pairs: [],
    });
    expect(r.errors.map((e) => [e.message.split(".")[0], e.line])).toEqual([
      ["Unknown role 'surface'", 6],
      ["Unknown role 'fg'", 9],
    ]);
  });

  it("evaluate's own errors come first and are kept", () => {
    const r = deriveScheme(`${PALETTE}x = nope\nroles {\n  nonsense = ink\n}`, { roles: WEBOS, pairs: [] });
    expect(r.errors.map((e) => e.line)).toEqual([4, 6]);
  });

  it("auto guesses unbound roles and replaces the same-name rule", () => {
    const r = deriveScheme(`${PALETTE}background = paper\nroles {\n  primary = brand\n}`, {
      roles: ["background", "foreground", "primary"],
      pairs: [],
      auto: (entries) => ({ foreground: entries.find((e) => e.name === "ink")?.name ?? "", primary: "paper" }),
    });
    expect(r.modes.light.foreground).toBe(color(r, "ink"));
    expect(r.modes.light.primary).toBe(color(r, "brand"));
    expect(r.modes.light.background).toBeUndefined();
  });

  it("a line naming a missing color falls through to the next rule", () => {
    const r = deriveScheme(`${PALETTE}background = paper\nroles {\n  background = missing\n}`, {
      roles: ["background"],
      pairs: [],
    });
    expect(r.errors).toEqual([]);
    expect(r.modes.light.background).toBe(color(r, "background"));
  });
});

describe("deriveScheme: modes", () => {
  const SRC = `${PALETTE}roles {
  background = paper
  foreground = ink
  primary = brand
  dark {
    background = ink
    foreground = paper
  }
}`;
  const r = deriveScheme(SRC, { roles: WEBOS, pairs: [] });

  it("dark re-points declared roles and inherits the rest from light", () => {
    expect(r.modes.dark.background).toBe(color(r, "ink"));
    expect(r.modes.dark.foreground).toBe(color(r, "paper"));
    expect(r.modes.dark.primary).toBe(r.modes.light.primary);
  });

  it("without dark lines, dark equals light", () => {
    const flat = deriveScheme(`${PALETTE}primary = brand`, { roles: WEBOS, pairs: [] });
    expect(flat.modes.dark).toEqual(flat.modes.light);
  });

  it("is data: frozen records of frozen colors", () => {
    expect(Object.isFrozen(r.modes)).toBe(true);
    expect(Object.isFrozen(r.modes.light)).toBe(true);
    expect(Object.isFrozen(r.modes.dark.background)).toBe(true);
    expect(r.modes.light.background).toBeInstanceOf(Oklch);
  });

  it("takes top-level light {} / dark {} blocks and theme.dark()", () => {
    const top = deriveScheme(`${PALETTE}light {\n  background = paper\n}\nd = theme.dark({ background: "ink" })`, {
      roles: WEBOS,
      pairs: [],
    });
    expect(top.errors).toEqual([]);
    expect(top.modes.light.background).toBe(color(top, "paper"));
    expect(top.modes.dark.background).toBe(color(top, "ink"));
  });
});

describe("deriveScheme: audit", () => {
  const SRC = `${PALETTE}roles {
  background = paper
  foreground = ink
  dark {
    background = ink
    foreground = paper
  }
}`;

  it("measures the host's pairs per mode with WCAG 2 contrast", () => {
    const r = deriveScheme(SRC, {
      roles: WEBOS,
      pairs: [{ label: "Text", fg: "foreground", bg: "background" }],
    });
    const expected = (fg: string, bg: string) =>
      (color(r, fg) as Oklch).to(Srgb).contrast((color(r, bg) as Oklch).to(Srgb));
    expect(r.audit.light).toEqual([
      { label: "Text", fg: "foreground", bg: "background", ratio: expected("ink", "paper") },
    ]);
    expect(r.audit.dark[0]!.ratio).toBe(expected("paper", "ink"));
  });

  it("leaves out pairs with an unbound role", () => {
    const r = deriveScheme(SRC, {
      roles: WEBOS,
      pairs: [
        { label: "Text", fg: "foreground", bg: "background" },
        { label: "Info", fg: "info", bg: "background" },
      ],
    });
    expect(r.audit.light.map((p) => p.label)).toEqual(["Text"]);
  });

  it("an alpha foreground is composited before measuring, so it contrasts less", () => {
    const fg = new Oklch(0.2, 0.02, 250);
    const bg = new Oklch(0.97, 0.01, 250);
    const [solid, faded] = audit({ fg, bg }, [
      { label: "solid", fg: "fg", bg: "bg" },
      { label: "faded", fg: "fg", bg: "bg", alpha: 0.5, large: true },
    ]);
    expect(faded!.ratio).toBeLessThan(solid!.ratio);
    expect(faded!.ratio).toBeGreaterThan(1);
    expect(faded).toMatchObject({ alpha: 0.5, large: true });
  });

  it("alpha 0 composites to the background itself: ratio 1 (WCAG 2.2 #dfn-contrast-ratio)", () => {
    const [row] = audit({ fg: new Oklch(0.2, 0.02, 250), bg: new Srgb(1, 1, 1) }, [
      { label: "invisible", fg: "fg", bg: "bg", alpha: 0 },
    ]);
    expect(row!.ratio).toBeCloseTo(1, 12);
  });
});
