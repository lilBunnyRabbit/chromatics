import { ParserHelper } from "../../../parsing";
import { clamp01 } from "../../../utils";
import { RGB } from "./rgb.model";

// TODO: AI generated, needs check, capture groups? optimize?

export default ParserHelper.registrator(RGB, (register) => {
  register({
    canParse(input: string): boolean {
      // Accepts input starting with "rgb(" or "rgba(",
      // or a naked string of 3–4 tokens (numbers or percentages)
      return /^(?:rgba?)\(/i.test(input) || /^\s*[\d.]+%?(?:[\s,]+[\d.]+%?){2,3}\s*$/.test(input);
    },
    parser(input: string) {
      input = input.trim();
      let regex: RegExp;
      if (/^(?:rgba?)\(/i.test(input)) {
        // Matches formats like:
        // rgb(10%, 3%, 6%)
        // rgb(10% 3% 6% / 80%)
        regex =
          /^(?:rgba?)\(\s*(?<r>[\d.]+%?)\s*(?:[, ]\s*)+(?<g>[\d.]+%?)\s*(?:[, ]\s*)+(?<b>[\d.]+%?)(?:\s*(?:,|\/)\s*(?<a>[\d.]+%?))?\s*\)$/i;
      } else {
        // Matches naked formats like:
        // "10%, 3%, 6%" or "10% 3% 6% / 80%"
        regex =
          /^\s*(?<r>[\d.]+%?)\s*(?:[, ]\s*)+(?<g>[\d.]+%?)\s*(?:[, ]\s*)+(?<b>[\d.]+%?)(?:\s*(?:,|\/)\s*(?<a>[\d.]+%?))?\s*$/;
      }
      const match = input.match(regex);
      if (!match || !match.groups) {
        return null;
      }
      // Helper: if the token ends with "%" then convert by dividing by 100;
      // otherwise, parse it as a floating-point number.
      // For normalized RGB, any floating value must be ≤ 1.
      const parseChannel = (val: string): number | null => {
        if (val.endsWith("%")) {
          return clamp01(parseFloat(val.slice(0, -1)) / 100);
        }
        const num = parseFloat(val);
        if (num > 1) {
          return null; // invalid for normalized RGB
        }
        return clamp01(num);
      };
      const r = parseChannel(match.groups.r);
      const g = parseChannel(match.groups.g);
      const b = parseChannel(match.groups.b);
      if (r === null || g === null || b === null) return null;
      let a = 1;
      if (match.groups.a) {
        const parsedAlpha = parseChannel(match.groups.a);
        if (parsedAlpha === null) return null;
        a = parsedAlpha;
      }
      return new RGB(r, g, b, a);
    },
  });
});
