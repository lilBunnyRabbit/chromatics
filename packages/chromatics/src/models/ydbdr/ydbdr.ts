import { multiply } from "../../core/linear.js";
import { YDBDR_TO_RGB, RGB_TO_YDBDR } from "../../core/matrices.js";
import { finite } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import type { Edge } from "../../core/model.js";
import { Srgb } from "../srgb/srgb.js";

// Reference ranges: BT.470's factors times the largest B′ − Y′ (0.886) and R′ − Y′ (0.701).
const DB = 1.505 * 0.886;
const DR = 1.902 * 0.701;

/**
 * Y′DbDr, the SECAM encoding (ITU-R BT.470-6 Table 2 item 2.5): D′B = 1.505·(B′ − Y′), D′R = −1.902·(R′ − Y′).
 * A matrix over encoded sRGB. Not CSS.
 */
export class Ydbdr extends RectangularColor {
  static readonly id = "ydbdr";
  static readonly channels = {
    y: { range: [0, 1] },
    db: { range: [-DB, DB] },
    dr: { range: [-DR, DR] },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Srgb,
      (c: Ydbdr) => new Srgb(...multiply(YDBDR_TO_RGB, c.y, c.db, c.dr), c.alpha),
      (c) => new Ydbdr(...multiply(RGB_TO_YDBDR, c.r, c.g, c.b), c.alpha)
    ),
  ];
  static readonly terminal = false;

  private _y: number;
  private _db: number;
  private _dr: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(y: number, db: number, dr: number, alpha = 1) {
    super(alpha);
    this._y = finite(y, "ydbdr", "y");
    this._db = finite(db, "ydbdr", "db");
    this._dr = finite(dr, "ydbdr", "dr");
  }

  get model(): "ydbdr" {
    return "ydbdr";
  }

  /** Luma Y′ (BT.601 weights), 0–1. */
  get y(): number {
    return this._y;
  }
  set y(value: number) {
    this._y = finite(value, "ydbdr", "y");
  }

  /** D′B = 1.505·(B′ − Y′), ±1.333. */
  get db(): number {
    return this._db;
  }
  set db(value: number) {
    this._db = finite(value, "ydbdr", "db");
  }

  /** D′R = −1.902·(R′ − Y′), ±1.333. */
  get dr(): number {
    return this._dr;
  }
  set dr(value: number) {
    this._dr = finite(value, "ydbdr", "dr");
  }

  get coords(): readonly [y: number, db: number, dr: number] {
    return [this._y, this._db, this._dr];
  }

  /**
   * Parses `ydbdr(y db dr [/ alpha])`, numbers only. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Ydbdr {
    const { coords, alpha } = readFunction(input, ["ydbdr"], Ydbdr.channels);
    const [y = 0, db = 0, dr = 0] = coords;
    return new Ydbdr(y, db, dr, alpha);
  }

  /** `ydbdr(y db dr)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("ydbdr", Ydbdr.channels, this.coords, this.alpha, "exact");
  }
}
