/**
 * The `scale.*` generators and the `token()` builtin — the DSL surface for
 * non-color design tokens. Because the evaluator is expression-only (no loops),
 * each generator loops INTERNALLY and returns a finished TokenGroup, exactly the
 * `preview.ts` pattern. The scale math lives in `../scheme/tokens.ts`.
 */
import { textScale, spaceScale, radiusScale, shadowScale } from "../scheme/tokens.js";
import { Srgb, Srgb8 } from "@lilbunnyrabbit/chromatics";
import { num, str, color, type DSLValue, type DSLFunction, type PlainObject } from "../values.js";

const optNum = (v: DSLValue | undefined, d: number) => (v === undefined ? d : num(v));

/** The scale generators: `text(base?, ratio?)`, `space(base?)`, `radius(base?)`, `shadow(tint?)`. */
export const scale = {
  text: (...a: DSLValue[]) => ({
    __token: "text",
    __unit: "",
    map: textScale(optNum(a[0], 16), optNum(a[1], 1.25)),
  }),
  space: (...a: DSLValue[]) => ({ __token: "space", __unit: "", map: spaceScale(optNum(a[0], 4)) }),
  radius: (...a: DSLValue[]) => ({
    __token: "radius",
    __unit: "",
    map: radiusScale(optNum(a[0], 8)),
  }),
  shadow: (...a: DSLValue[]) => ({
    __token: "shadow",
    __unit: "",
    map: shadowScale(a[0] === undefined ? "#000" : color(a[0]).to(Srgb).gamutMap().to(Srgb8).toHex()),
  }),
} as unknown as Record<string, DSLFunction>;

/** `token(family, { step: value, … }, unit?)` — an arbitrary token group. */
export const tokenFn: DSLFunction = (...a) => {
  const family = str(a[0]);
  const src = a[1];
  const unit = a[2] === undefined ? "" : str(a[2]);
  const map: Record<string, string | number> = {};
  if (src && typeof src === "object" && !Array.isArray(src)) {
    for (const [k, v] of Object.entries(src as PlainObject)) {
      map[k] = typeof v === "number" ? v : String(v);
    }
  }
  return { __token: family, __unit: unit, map } as unknown as DSLValue;
};

/** The `tokens` namespace: the scale generators plus `token(…)` for arbitrary groups. */
export const tokens = { ...scale, token: tokenFn } as unknown as Record<string, DSLFunction>;
