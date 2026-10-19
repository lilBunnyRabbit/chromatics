import { byte } from "../../core/channel.js";
import { Color } from "../../core/color.js";
import { invalid } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import type { Edge } from "../../core/model.js";
import { Srgb } from "../srgb/srgb.js";
import { NAMED } from "./named.js";

const HEX = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

function hex2(v: number): string {
  return v.toString(16).padStart(2, "0");
}

/**
 * 8-bit sRGB: integer channels and alpha, 0–255. The model of hex codes and CSS named colors.
 *
 * Every write rounds and clamps to 0–255 (`new Srgb8(127.6, 300, -4)` is 128, 255, 0), so this is
 * lossy by design: conversions go to or from it but never route through it. Use {@link Srgb} for
 * float sRGB.
 *
 * @example
 * ```ts
 * Srgb8.parse('#ff8000');
 * Srgb8.parse('rebeccapurple').toHex(); // '#663399'
 * c.to(Srgb8).toHex();
 * ```
 */
export class Srgb8 extends Color {
  static readonly id = "srgb8";
  static readonly channels = {
    r: { range: [0, 255] },
    g: { range: [0, 255] },
    b: { range: [0, 255] },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Srgb,
      (c: Srgb8) => new Srgb(c.r / 255, c.g / 255, c.b / 255, c.alpha / 255),
      // CSS Color 4 #rgb-functions: a component that can't be kept "should be rounded towards
      // +∞", which is what Math.round does at .5.
      (c) => new Srgb8(c.r * 255, c.g * 255, c.b * 255, c.alpha * 255)
    ),
  ];
  static readonly terminal = true;

  private _r: number;
  private _g: number;
  private _b: number;

  /**
   * Channels and alpha are 0–255 and are rounded and clamped. Alpha defaults to 255.
   *
   * @throws {TypeError} on `NaN` / `Infinity`.
   */
  constructor(r: number, g: number, b: number, alpha = 255) {
    super(alpha);
    this._r = byte(r, "srgb8", "r");
    this._g = byte(g, "srgb8", "g");
    this._b = byte(b, "srgb8", "b");
  }

  get model(): "srgb8" {
    return "srgb8";
  }

  protected override alphaOf(value: number): number {
    return byte(value, "srgb8", "alpha");
  }

  /** Red, integer 0–255; writes round and clamp. */
  get r(): number {
    return this._r;
  }
  set r(value: number) {
    this._r = byte(value, "srgb8", "r");
  }

  /** Green, integer 0–255; writes round and clamp. */
  get g(): number {
    return this._g;
  }
  set g(value: number) {
    this._g = byte(value, "srgb8", "g");
  }

  /** Blue, integer 0–255; writes round and clamp. */
  get b(): number {
    return this._b;
  }
  set b(value: number) {
    this._b = byte(value, "srgb8", "b");
  }

  /** Opacity, integer 0–255 (not 0–1); writes round and clamp. */
  override get alpha(): number {
    return super.alpha;
  }
  override set alpha(value: number) {
    super.alpha = value;
  }

  get coords(): readonly [r: number, g: number, b: number] {
    return [this._r, this._g, this._b];
  }

  /**
   * Parses hex (`#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`), a CSS named color, or `transparent`, all
   * case-insensitive.
   *
   * @throws {SyntaxError} on anything else, including `currentcolor` (it has no value on its own).
   */
  static parse(input: string): Srgb8 {
    const text = input.trim().toLowerCase();
    if (text === "transparent") return new Srgb8(0, 0, 0, 0);
    if (Object.hasOwn(NAMED, text)) {
      const v = NAMED[text]!;
      return new Srgb8(v >> 16, (v >> 8) & 0xff, v & 0xff);
    }
    const match = HEX.exec(text);
    if (!match) throw invalid(input, "expected hex or a named color");
    let digits = match[1]!;
    if (digits.length <= 4) digits = [...digits].map((d) => d + d).join("");
    const [r, g, b, a = 255] = (digits.match(/../g) ?? []).map((pair) => parseInt(pair, 16));
    return new Srgb8(r!, g!, b!, a);
  }

  /** `#rrggbb`, or `#rrggbbaa` when alpha isn't 255. Lowercase. */
  toHex(): string {
    const out = `#${hex2(this._r)}${hex2(this._g)}${hex2(this._b)}`;
    return this.alpha === 255 ? out : out + hex2(this.alpha);
  }

  /** Same as {@link toHex}: hex is lossless for 8-bit values. */
  override toString(): string {
    return this.toHex();
  }

  /** Same as {@link toHex}: valid CSS. */
  toCss(): string {
    return this.toHex();
  }
}
