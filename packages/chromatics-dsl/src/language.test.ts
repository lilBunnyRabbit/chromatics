// ADR-016 78f/h/i: the DSL is the package's API, with JS semantics inside a program and frozen
// colours once it returns.
import { describe, expect, it, test } from "vitest";
import { Hsl, Oklch, Srgb, Srgb8 } from "@lilbunnyrabbit/chromatics";
import { models } from "@lilbunnyrabbit/chromatics/all";
import { evaluate } from "./evaluator.js";
import { createEnvironment } from "./environment.js";
import { MODEL_CLASSES, modelName } from "./values.js";

const run = (src: string) => evaluate(src);
const value = (src: string, name: string) => run(src).variables.get(name)?.value;

describe("classes", () => {
  test("callable with or without new", () => {
    const a = value("a = Oklch(0.5, 0.1, 30)", "a");
    const b = value("b = new Oklch(0.5, 0.1, 30)", "b");
    expect(a).toBeInstanceOf(Oklch);
    expect((a as Oklch).equals(b as Oklch)).toBe(true);
  });

  test("statics and parse", () => {
    expect(value('a = Oklch.parse("oklch(50% 0.1 30)")', "a")).toBeInstanceOf(Oklch);
    expect(value("a = Hsl.from(Oklch(0.5, 0.1, 30))", "a")).toBeInstanceOf(Hsl);
    expect(value('a = parse("#ff8000")', "a")).toBeInstanceOf(Srgb8);
  });

  test("new on something that is not a model is an error", () => {
    expect(run('a = new parse("#fff")').errors[0]!.message).toContain("color model");
  });
});

describe("members", () => {
  test("channels, conversions and methods are the instance’s own", () => {
    expect(value("a = Oklch(0.5, 0.1, 30)\nl = a.l", "l")).toBe(0.5);
    expect(value("a = Oklch(0.5, 0.1, 30)\nh = a.to(Hsl).h", "h")).toBeTypeOf("number");
    expect((value("a = Oklch(0.5, 0.1, 30)\nb = a.clone().lighten(0.1)", "b") as Oklch).l).toBeCloseTo(0.6, 12);
  });

  test("no flat keys, no views", () => {
    expect(run("a = Oklch(0.5, 0.1, 30)\nb = a.ok_l").errors[0]!.message).toContain("no property: ok_l");
    expect(run("a = Oklch(0.5, 0.1, 30)\nb = a.oklch").errors[0]!.message).toContain("no property: oklch");
  });

  test("package internals stay hidden", () => {
    for (const name of ["_l", "assign", "write", "alphaOf", "constructor", "__proto__"]) {
      expect(run(`a = Oklch(0.5, 0.1, 30)\nb = a.${name}`).errors[0]!.message).toContain("no property");
    }
    expect(run("e = Oklch.edges").errors[0]!.message).toContain("no property");
  });

  test("channel assignment, plain and compound", () => {
    const src = "a = Oklch(0.5, 0.1, 30)\na.l = 0.7\na.h += 340";
    const a = value(src, "a") as Oklch;
    expect(a.l).toBe(0.7);
    expect(a.h).toBe(10);
    expect(run("a = Oklch(0.5, 0.1, 30)\na.nope = 1").errors[0]!.message).toContain("no property");
  });
});

describe("mutation semantics", () => {
  test("a method mutates its receiver, like JS", () => {
    const r = run("brand = Oklch(0.5, 0.1, 30)\nbg = brand.lighten(0.3)");
    expect(r.variables.get("bg")?.value).toBe(r.variables.get("brand")?.value);
    expect((r.variables.get("brand")?.value as Oklch).l).toBeCloseTo(0.8, 12);
  });

  test("clone() and to() keep the original", () => {
    const r = run("brand = Oklch(0.5, 0.1, 30)\nbg = brand.clone().lighten(0.3)\nh = brand.to(Hsl)");
    expect((r.variables.get("brand")?.value as Oklch).l).toBe(0.5);
  });

  test("colours are frozen once the program returns", () => {
    const a = value("a = Oklch(0.5, 0.1, 30)\nlist = [a, Oklch(0.2, 0, 0)]", "a") as Oklch;
    expect(Object.isFrozen(a)).toBe(true);
    expect(() => a.lighten(0.1)).toThrow(TypeError);
    expect(a.clone().lighten(0.1).l).toBeCloseTo(0.6, 12);
    const list = value("a = Oklch(0.5, 0.1, 30)\nlist = [a, Oklch(0.2, 0, 0)]", "list") as Oklch[];
    expect(list.every((c) => Object.isFrozen(c))).toBe(true);
  });
});

describe("simulateCvd", () => {
  test("is the package function: mutates and returns its Srgb", () => {
    const r = run(
      'a = Srgb(0.9, 0.2, 0.2)\nb = simulateCvd(a, "deutan")\nc = simulateCvd(Srgb(0.9, 0.2, 0.2), "deutan", 0)'
    );
    expect(r.errors).toEqual([]);
    expect(r.variables.get("b")?.value).toBe(r.variables.get("a")?.value);
    expect((r.variables.get("c")?.value as Srgb).coords).toEqual([0.9, 0.2, 0.2]);
  });

  test("needs an Srgb and a known deficiency", () => {
    expect(run('b = simulateCvd(Oklch(0.5, 0.1, 30), "deutan")').errors[0]!.message).toContain("Srgb");
    expect(run('b = simulateCvd(Srgb(1, 0, 0), "deuteranopia")').errors[0]!.message).toContain('"deutan"');
    expect(run('b = simulateCvd(Srgb(1, 0, 0), "deutan", 2)').errors[0]!.message).toMatch(/severity|range/i);
  });
});

describe("removed names are errors", () => {
  test.each([
    ['hex("#fff")', "hex"],
    ["OKLCH(0.5, 0.1, 30)", "OKLCH"],
    ["mix(Oklch(0.5, 0.1, 30), Oklch(0.5, 0.1, 90))", "mix"],
    ["scale.text(16)", "scale"],
  ])("%s", (expr, name) => {
    expect(run(`a = ${expr}`).errors[0]!.message).toContain(`Undefined variable: ${name}`);
  });
});

describe("spans (ADR-018: source offsets, no AST)", () => {
  it("a variable spans its right-hand side in the original source", () => {
    const src = "a = Oklch(0.5, 0.1, 30)\npreview {\n  r = ramp(a)\n}\nb   =   a.clone()";
    const r = evaluate(src);
    const slice = (name: string) => {
      const { span } = r.variables.get(name)!;
      return src.slice(span.start, span.end);
    };
    expect(slice("a")).toBe("Oklch(0.5, 0.1, 30)");
    expect(slice("r")).toBe("ramp(a)");
    expect(slice("b")).toBe("a.clone()");
  });

  it("a mapping block's variable spans the block", () => {
    const src = "a = Oklch(0.5, 0.1, 30)\nroles {\n  primary = a\n}";
    const { span } = evaluate(src).variables.get("roles")!;
    expect(src.slice(span.start, span.end)).toBe("roles {\n  primary = a\n}");
  });

  it("an evaluation error spans its statement; a parse error points at its position", () => {
    const src = "a = Oklch(0.5, 0.1, 30)\nb = nope.x";
    const [err] = evaluate(src).errors;
    expect(err).toMatchObject({ line: 2, message: "Undefined variable: nope" });
    expect(src.slice(err!.span!.start, err!.span!.end)).toBe("b = nope.x");
    const parse = evaluate("a = (1 +").errors;
    expect(parse).toHaveLength(1);
    expect(parse[0]!.span!.start).toBeGreaterThan(0);
  });

  it("a variable carries no AST node", () => {
    expect(Object.keys(evaluate("a = 1").variables.get("a")!).sort()).toEqual([
      "deps",
      "line",
      "name",
      "span",
      "value",
    ]);
  });
});

describe("the environment is the color package's, read at load (ADR-018)", () => {
  it("every model in /all is callable by its export name", () => {
    expect(MODEL_CLASSES.map(([, m]) => m)).toEqual(models);
    for (const [name] of MODEL_CLASSES) {
      const r = evaluate(`x = ${name}`);
      expect(r.errors).toEqual([]);
    }
  });

  it("a model class the root barrel doesn't export is named by its id, not an error", () => {
    class Unlisted extends Srgb {}
    expect(modelName(Unlisted)).toBe("srgb");
  });

  it("createEnvironment returns a fresh map each time", () => {
    const a = createEnvironment();
    a.delete("parse");
    expect(createEnvironment().has("parse")).toBe(true);
  });
});
