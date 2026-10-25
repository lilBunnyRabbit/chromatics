import { environment, type ViewingConditions } from "../../core/cam.js";
import { edge } from "../../core/edge.js";
import { CAM_CHANNELS, camFromXyz, camToXyz, CamColor } from "../../core/families/cam.js";
import type { Edge } from "../../core/model.js";
import { Xyz65 } from "../xyz65/xyz65.js";

/**
 * CAM16 (Li et al. 2017), as lightness `J`, colorfulness `M` and hue `h`. `C`, `Q`, `s` and the hue
 * quadrature `H` are read-only. Under Material's viewing conditions, the ones HCT uses: D65, L_A ≈ 11.72
 * cd/m², Y_b ≈ 18.42, average surround, no discounting. Other conditions: {@link Cam16.viewedIn}.
 *
 * D65 white isn't neutral under these conditions (D < 1): it has M ≈ 2.27. Not CSS: there is no
 * `toCss()`. Computed with this package's exact D65 and matrices, so it differs from Material's rounded
 * constants by up to about 0.05 in M or h.
 *
 * @example
 * ```ts
 * const c = new Srgb(1, 0, 0).to(Cam16);
 * c.J; c.M; c.h; c.C; c.H;
 * ```
 */
export class Cam16 extends CamColor {
  static readonly id: string = "cam16";
  static readonly channels = CAM_CHANNELS;
  static readonly env = environment("cam16");
  static readonly edges: readonly Edge[] = [
    edge(
      Xyz65,
      (c: Cam16) => new Xyz65(...camToXyz(c), c.alpha),
      (c: Xyz65) => camFromXyz(Cam16, c.x, c.y, c.z, c.alpha)
    ),
  ];
  static readonly terminal = false;

  /**
   * A Cam16 class for other viewing conditions. It converts both ways under them, so values round-trip
   * (ADR-012). Create it once and reuse it: each call makes a new class. Its strings use `id`.
   *
   * @example
   * ```ts
   * const Dim = Cam16.viewedIn({ adaptingLuminance: 4.07, backgroundLuminance: 20, surround: "dim" }, "cam16-dim");
   * new Srgb(1, 0, 0).to(Dim).M;
   * ```
   */
  static viewedIn(conditions: ViewingConditions, id = "cam16-custom"): typeof Cam16 {
    const env = environment("cam16", conditions);
    class Viewed extends Cam16 {
      static override readonly id: string = id;
      static override readonly env = env;
      static override parse(input: string): Viewed {
        return CamColor.read(Viewed, input);
      }
      static override readonly edges: readonly Edge[] = [
        edge(
          Xyz65,
          (c: Cam16) => new Xyz65(...camToXyz(c), c.alpha),
          (c: Xyz65) => camFromXyz(Viewed, c.x, c.y, c.z, c.alpha)
        ),
      ];
    }
    return Viewed;
  }

  /**
   * Parses `cam16(J M h [/ alpha])` (on a `viewedIn` class, its own id): numbers, hue also in angle units.
   * Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Cam16 {
    return CamColor.read(Cam16, input);
  }
}
