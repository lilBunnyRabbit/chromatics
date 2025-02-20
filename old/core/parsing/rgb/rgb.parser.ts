import { RGB } from "../..";
import { parserRegistrator__OLD } from "../../../lib";

// TODO: AI generated, needs check

export default parserRegistrator__OLD(RGB, (register) => {
  // RGB(A) Function Parsers
  register({
    canParse(input: string) {
      return (
        /^rgba?\(\s*(\d{1,3}%|0?\.\d+|1)(,\s*(\d{1,3}%|0?\.\d+|1)){2}(?:,\s*(\d{1,3}%|0?\.\d+|1))?\s*\)$/i.test(
          input
        ) || /^(\d{1,3}%|0?\.\d+) (\d{1,3}%|0?\.\d+) (\d{1,3}%|0?\.\d+)(?: (\d{1,3}%|0?\.\d+))?$/.test(input)
      );
    },

    parser(input: string) {
      const match = input.match(/(\d{1,3}%|0?\.\d+|1)/g);
      if (!match || match.length < 3) return null;

      const parseValue = (v: string) => (v.includes("%") ? parseFloat(v) / 100 : parseFloat(v));

      const r = parseValue(match[0]);
      const g = parseValue(match[1]);
      const b = parseValue(match[2]);
      const a = match[3] ? parseValue(match[3]) : 1;

      return new RGB(r, g, b, a);
    },
  });

  // Tailwind-Style Space-Separated Parsers
  register({
    canParse(input: string) {
      return /^(\d{1,3}%|0?\.\d+) (\d{1,3}%|0?\.\d+) (\d{1,3}%|0?\.\d+)(?: (\d{1,3}%|0?\.\d+))?$/.test(input);
    },

    parser(input: string) {
      const match = input.match(/(\d{1,3}%|0?\.\d+)/g);
      if (!match || match.length < 3) return null;

      const parseValue = (v: string) => (v.includes("%") ? parseFloat(v) / 100 : parseFloat(v));

      const r = parseValue(match[0]);
      const g = parseValue(match[1]);
      const b = parseValue(match[2]);
      const a = match[3] ? parseValue(match[3]) : 1;

      return new RGB(r, g, b, a);
    },
  });
});
