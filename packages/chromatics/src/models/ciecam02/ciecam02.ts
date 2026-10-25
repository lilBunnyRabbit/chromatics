import { environment, type ViewingConditions } from "../../core/cam.js";
import { edge } from "../../core/edge.js";
import { CAM_CHANNELS, camFromXyz, camToXyz, CamColor } from "../../core/families/cam.js";
import type { Edge } from "../../core/model.js";
import { Xyz65 } from "../xyz65/xyz65.js";

/**
 * CIECAM02 (CIE 159:2004), as lightness `J`, colorfulness `M` and hue `h`; `C`, `Q`, `s`, `H` read-only.
 * Superseded by {@link Cam16} (CIE 248:2022); kept because older work uses it. Same default viewing
 * conditions as Cam16 (Material's); other conditions: {@link Ciecam02.viewedIn}. Not CSS.
 *
 * @example
 * ```ts
 * new Srgb(1, 0, 0).to(Ciecam02).H;
 * ```
 */
export class Ciecam02 extends CamColor {
  static readonly id: string = "ciecam02";
  static readonly channels = CAM_CHANNELS;
  static readonly env = environment("ciecam02");
  static readonly edges: readonly Edge[] = [
    edge(
      Xyz65,
      (c: Ciecam02) => new Xyz65(...camToXyz(c), c.alpha),
      (c: Xyz65) => camFromXyz(Ciecam02, c.x, c.y, c.z, c.alpha)
    ),
  ];
  static readonly terminal = false;

  /**
   * A Ciecam02 class for other viewing conditions. It converts both ways under them, so values round-trip
   * (ADR-012). Create it once and reuse it: each call makes a new class. Its strings use `id`.
   *
   * @example
   * ```ts
   * const Dim = Ciecam02.viewedIn({ adaptingLuminance: 4.07, backgroundLuminance: 20, surround: "dim" }, "ciecam02-dim");
   * new Srgb(1, 0, 0).to(Dim).M;
   * ```
   */
  static viewedIn(conditions: ViewingConditions, id = "ciecam02-custom"): typeof Ciecam02 {
    const env = environment("ciecam02", conditions);
    class Viewed extends Ciecam02 {
      static override readonly id: string = id;
      static override readonly env = env;
      static override parse(input: string): Viewed {
        return CamColor.read(Viewed, input);
      }
      static override readonly edges: readonly Edge[] = [
        edge(
          Xyz65,
          (c: Ciecam02) => new Xyz65(...camToXyz(c), c.alpha),
          (c: Xyz65) => camFromXyz(Viewed, c.x, c.y, c.z, c.alpha)
        ),
      ];
    }
    return Viewed;
  }

  /**
   * Parses `ciecam02(J M h [/ alpha])` (on a `viewedIn` class, its own id): numbers, hue also in angle units.
   * Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Ciecam02 {
    return CamColor.read(Ciecam02, input);
  }
}
