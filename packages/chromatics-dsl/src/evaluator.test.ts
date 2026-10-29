import { test, expect, describe } from "vitest";
import { Oklch, Srgb8 } from "@lilbunnyrabbit/chromatics";
import { evaluate } from "./evaluator.js";

function run(src: string) {
  return evaluate(src);
}

function oklchOf(src: string, name: string): Oklch {
  const r = run(src);
  const v = r.variables.get(name);
  if (!v) throw new Error(`no var ${name}; errors: ${JSON.stringify(r.errors)}`);
  if (!(v.value instanceof Oklch)) throw new Error(`${name} is not an Oklch color`);
  return v.value;
}

describe("package classes as constructors (ADR-016 78h)", () => {
  test("a model class is callable with and without `new`", () => {
    const r = run("a = Oklch(0.5, 0.1, 200)\nb = new Oklch(0.5, 0.1, 200)");
    expect(r.errors).toEqual([]);
    const a = r.variables.get("a")!.value as Oklch;
    const b = r.variables.get("b")!.value as Oklch;
    expect(a).toBeInstanceOf(Oklch);
    expect(b).toBeInstanceOf(Oklch);
    expect(a.coords).toEqual(b.coords);
  });

  test('parse("#…") returns an Srgb8', () => {
    const r = run('a = parse("#6c5ce7")');
    expect(r.errors).toEqual([]);
    const a = r.variables.get("a")!.value as Srgb8;
    expect(a).toBeInstanceOf(Srgb8);
    expect(a.toHex()).toBe("#6c5ce7");
  });

  test("`new` on a non-model is an error", () => {
    const r = run('a = new parse("#fff")');
    expect(r.errors).toHaveLength(1);
  });
});

describe("object literals feed set / shift", () => {
  test("shift({ l }) adds to Oklch lightness", () => {
    const b = oklchOf("a = Oklch(0.5, 0.1, 200)\nb = a.clone().shift({ l: 0.1 })", "b");
    expect(b.l).toBeCloseTo(0.6, 6);
    expect(b.c).toBeCloseTo(0.1, 6);
    expect(b.h).toBeCloseTo(200, 4);
  });

  test("shift with multiple keys updates each channel", () => {
    const b = oklchOf("a = Oklch(0.5, 0.1, 100)\nb = a.clone().shift({ l: 0.1, c: 0.05, h: 20 })", "b");
    expect(b.l).toBeCloseTo(0.6, 6);
    expect(b.c).toBeCloseTo(0.15, 6);
    expect(b.h).toBeCloseTo(120, 4);
  });

  test("set({ l }) replaces Oklch lightness, leaves c/h", () => {
    const b = oklchOf("a = Oklch(0.5, 0.1, 200)\nb = a.clone().set({ l: 0.2 })", "b");
    expect(b.l).toBeCloseTo(0.2, 6);
    expect(b.c).toBeCloseTo(0.1, 6);
    expect(b.h).toBeCloseTo(200, 4);
  });

  test("string and computed object keys", () => {
    const b = oklchOf('k = "l"\na = Oklch(0.5, 0.1, 200)\nb = a.clone().shift({ "c": 0.05, [k]: 0.1 })', "b");
    expect(b.l).toBeCloseTo(0.6, 6);
    expect(b.c).toBeCloseTo(0.15, 6);
  });
});

describe("JS mutation semantics inside a program (ADR-016 78i)", () => {
  test("a method that edits mutates its receiver; clone() keeps it", () => {
    const r = run("a = Oklch(0.5, 0.1, 200)\nb = a.lighten(0.1)\nc = Oklch(0.5, 0.1, 200)\nd = c.clone().lighten(0.1)");
    expect(r.errors).toEqual([]);
    const v = (n: string) => r.variables.get(n)!.value as Oklch;
    expect(v("b")).toBe(v("a"));
    expect(v("a").l).toBeCloseTo(0.6, 6);
    expect(v("c").l).toBeCloseTo(0.5, 6);
    expect(v("d").l).toBeCloseTo(0.6, 6);
  });

  test("channel assignment and compound assignment write the channel", () => {
    const a = oklchOf("a = Oklch(0.5, 0.1, 200)\na.l = 0.3\na.c += 0.05\na.h -= 20", "a");
    expect(a.l).toBeCloseTo(0.3, 6);
    expect(a.c).toBeCloseTo(0.15, 6);
    expect(a.h).toBeCloseTo(180, 4);
  });

  test("assigning a non-channel is an error", () => {
    const r = run("a = Oklch(0.5, 0.1, 200)\na.nope = 1");
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0]!.line).toBe(2);
  });

  test("to(Model) converts to a new instance and exposes its channels", () => {
    const r = run('a = parse("#ffffff")\nl = a.to(Oklch).l');
    expect(r.errors).toEqual([]);
    // CSS Color 4 §9: white is OKLab L = 1.
    expect(r.variables.get("l")!.value as number).toBeCloseTo(1, 6);
  });

  test("colours are frozen once the program finishes (ADR-016 78e)", () => {
    const a = oklchOf("a = Oklch(0.5, 0.1, 200)", "a");
    expect(Object.isFrozen(a)).toBe(true);
    expect(() => a.lighten(0.1)).toThrow(TypeError);
  });
});

describe("array literals + indexing", () => {
  test("color array literal and positive index", () => {
    const pick = oklchOf("a = Oklch(0.4, 0.1, 10)\nb = Oklch(0.7, 0.1, 10)\npick = [a, b][1]", "pick");
    expect(pick.l).toBeCloseTo(0.7, 6);
  });

  test("numeric array, .length, positive and negative index", () => {
    const r = run("nums = [10, 20, 30]\nn = nums.length\nfirst = nums[0]\nlast = nums[-1]");
    expect(r.errors).toEqual([]);
    expect(r.variables.get("n")!.value).toBe(3);
    expect(r.variables.get("first")!.value).toBe(10);
    expect(r.variables.get("last")!.value).toBe(30);
  });

  test("out-of-bounds index errors per-statement without killing the run", () => {
    const r = run("a = Oklch(0.5, 0.1, 200)\nb = [a][5]\nc = 1");
    expect(r.errors.length).toBe(1);
    expect(r.errors[0]!.line).toBe(2);
    expect(r.variables.get("c")!.value).toBe(1);
  });
});

describe("dependency capture", () => {
  test("method call captures the receiver as a dep", () => {
    const r = run("a = Oklch(0.5, 0.1, 200)\nb = a.clone().lighten(0.1)");
    expect(r.errors).toEqual([]);
    expect(r.variables.get("b")!.deps).toEqual(["a"]);
  });

  test("deps flow through object and array literals + indexing", () => {
    const r = run("a = Oklch(0.5, 0.1, 200)\nd = 0.1\nb = a.clone().shift({ l: d })\narr = [a, b]\nc = arr[0]");
    expect(r.errors).toEqual([]);
    expect(r.variables.get("b")!.deps.sort()).toEqual(["a", "d"]);
    expect(r.variables.get("arr")!.deps.sort()).toEqual(["a", "b"]);
    expect(r.variables.get("c")!.deps).toEqual(["arr"]);
  });
});

describe("the old names are gone (ADR-016 78f, 78k)", () => {
  const failsOnLine2 = (line: string) => {
    const r = run(`a = Oklch(0.5, 0.1, 200)\n${line}`);
    expect(r.errors, line).toHaveLength(1);
    expect(r.errors[0]!.line).toBe(2);
  };

  test("old constructors and free functions are undefined", () => {
    for (const line of [
      "b = OKLCH(0.5, 0.1, 200)",
      'b = hex("#fff")',
      "b = mix(a, a, 0.5)",
      "b = contrast(a, a)",
      "b = deltaE(a, a)",
    ]) {
      failsOnLine2(line);
    }
  });

  test("flat channel keys and model views are not members", () => {
    for (const line of ["b = a.ok_l", "b = a.oklch", "b = a.oklch.lighten(0.1)"]) failsOnLine2(line);
  });

  test("the package internals stay hidden", () => {
    for (const line of ["b = a._l", "b = a.constructor", "b = a.assign"]) failsOnLine2(line);
  });
});

describe("error model", () => {
  test("parse error is terminal and single (no variables produced)", () => {
    const r = run("a = Oklch(0.5, 0.1, 200\nb = 3");
    expect(r.errors.length).toBe(1);
    expect(r.variables.size).toBe(0);
  });

  test("runtime error is per-statement with a line; other lines still evaluate", () => {
    const r = run("a = Oklch(0.5, 0.1, 200)\nbad = nope.foo\nc = Oklch(0.7, 0.1, 200)");
    expect(r.errors.length).toBe(1);
    expect(r.errors[0]!.line).toBe(2);
    expect(r.variables.get("a")).toBeDefined();
    expect(r.variables.get("c")).toBeDefined();
    expect(r.variables.get("bad")).toBeUndefined();
  });
});
