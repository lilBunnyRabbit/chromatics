import { RGB255 } from "../..";
import { parserRegistrator__OLD } from "../../../lib";

// TODO: AI generated, needs check

export default parserRegistrator__OLD(RGB255, (register) => {
  // Hex Parser
  register({
    canParse(input: string) {
      return /^#([0-9A-Fa-f]{3,8})$/.test(input) || /^0x[0-9A-Fa-f]{6,8}$/.test(input);
    },

    parser(input: string) {
      let hex = input.replace(/^#|0x/i, ""); // Remove # or 0x

      if (hex.length === 3 || hex.length === 4) {
        hex = hex
          .split("")
          .map((c) => c + c)
          .join(""); // Expand #RGB[A] → #RRGGBB[AA]
      }

      if (hex.length === 6) {
        hex += "FF"; // Default alpha to FF if missing
      }

      if (hex.length !== 8) return null; // Ensure correct length

      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const a = parseInt(hex.slice(6, 8), 16);

      return new RGB255(r, g, b, a);
    },
  });

  // RGB(A) Function Parsers
  register({
    canParse(input: string) {
      return (
        /^rgba?\(\s*(\d{1,3})(,\s*\d{1,3}){2}(?:,\s*(\d{1,3}|\d{1,3}%))?\s*\)$/i.test(input) ||
        /^(\d{1,3}) (\d{1,3}) (\d{1,3})(?: (\d{1,3}))?$/.test(input)
      );
    },

    parser(input: string) {
      const match = input.match(/\d+%?/g);
      if (!match || match.length < 3) return null;

      const parseValue = (v: string) => (v.includes("%") ? Math.round(parseFloat(v) * 2.55) : parseInt(v, 10));

      const r = Math.min(255, parseValue(match[0]));
      const g = Math.min(255, parseValue(match[1]));
      const b = Math.min(255, parseValue(match[2]));
      const a = match[3] ? Math.min(255, parseValue(match[3])) : 255;

      return new RGB255(r, g, b, a);
    },
  });

  // Tailwind-Style Space-Separated Parsers
  register({
    canParse(input: string) {
      return /^(\d{1,3}) (\d{1,3}) (\d{1,3})(?: (\d{1,3}))?$/.test(input);
    },

    parser(input: string) {
      const match = input.match(/\d+/g);
      if (!match || match.length < 3) return null;

      const r = Math.min(255, parseInt(match[0], 10));
      const g = Math.min(255, parseInt(match[1], 10));
      const b = Math.min(255, parseInt(match[2], 10));
      const a = match[3] ? Math.min(255, parseInt(match[3], 10)) : 255;

      return new RGB255(r, g, b, a);
    },
  });

  // Numeric Notation Parsers
  register({
    canParse(input: string) {
      return /^\d+$/.test(input);
    },

    parser(input: string) {
      const num = parseInt(input, 10);
      if (num < 0 || num > 0xffffffff) return null; // Ensure valid range

      const r = (num >> 24) & 255;
      const g = (num >> 16) & 255;
      const b = (num >> 8) & 255;
      const a = num & 255;

      return new RGB255(r, g, b, a);
    },
  });
});
