import { ParserHelper } from "../../../parsing";
import { RGB255 } from "./rgb255.model";

// TODO: AI generated, needs check, capture groups? optimize?

export default ParserHelper.registrator(RGB255, (register) => {
  // Hex Parser
  register({
    canParse(input: string): boolean {
      return /^(\#|0x)[0-9a-fA-F]{3,4}$/.test(input) || /^(\#|0x)[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(input);
    },
    parser(input: string) {
      // Remove the '#' or '0x' prefix
      let hex = input.replace(/^(\#|0x)/, "");
      // Expand short notation if necessary
      if (hex.length === 3 || hex.length === 4) {
        hex = hex
          .split("")
          .map((ch) => ch + ch)
          .join("");
      }

      let r,
        g,
        b,
        a = 255;
      if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
      } else if (hex.length === 8) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
        a = parseInt(hex.slice(6, 8), 16);
      } else {
        return null;
      }
      return new RGB255(r, g, b, a);
    },
  });

  // RGB(A) Parser
  register({
    canParse(input: string): boolean {
      // This regex allows tokens like "51", "221", "68", and also "0.53" (with optional decimals or percentage)
      return (
        /^(rgba?)\(/i.test(input) ||
        /^(?:\d+(?:\.\d+)?%?[\s,\/]+){2}\d+(?:\.\d+)?%?(?:[\s,\/]+\d+(?:\.\d+)?%?)?$/.test(input.trim())
      );
    },
    parser(input: string) {
      input = input.trim();
      // Remove any "rgb(" or "rgba(" prefix and trailing ")"
      input = input.replace(/^(rgba?)\(/i, "").replace(/\)$/, "");
      // Replace slash separators with a comma for consistency
      input = input.replace(/\//g, ",");
      // Split on commas or whitespace
      const parts = input.split(/[\s,]+/).filter((p) => p.length > 0);
      if (parts.length < 3) {
        return null;
      }
      // Helper function to parse a channel value, converting percentages and decimals appropriately.
      const parseChannel = (val: string, isAlpha: boolean = false): number => {
        val = val.trim();
        if (val.endsWith("%")) {
          // Convert a percentage (e.g., "53%") to a value on the 0–255 scale.
          const percent = parseFloat(val.slice(0, -1));
          return Math.round(255 * (percent / 100));
        } else {
          const num = parseFloat(val);
          // For alpha, if it's 0–1, convert to 0–255.
          if (isAlpha && num <= 1) {
            return Math.round(255 * num);
          }
          return Math.round(num);
        }
      };

      const r = parseChannel(parts[0]);
      const g = parseChannel(parts[1]);
      const b = parseChannel(parts[2]);
      const a = parts.length >= 4 ? parseChannel(parts[3], true) : 255;
      return new RGB255(r, g, b, a);
    },
  });

  // Numeric Notation Parser
  register({
    canParse(input: string): boolean {
      return /^\d+$/.test(input.trim());
    },
    parser(input: string) {
      const num = parseInt(input.trim(), 10);
      const r = (num >> 16) & 0xff;
      const g = (num >> 8) & 0xff;
      const b = num & 0xff;
      return new RGB255(r, g, b, 255);
    },
  });

  // // Hex Parser
  // register({
  //   canParse(input: string) {
  //     return /^#([0-9A-Fa-f]{3,8})$/.test(input) || /^0x[0-9A-Fa-f]{6,8}$/.test(input);
  //   },

  //   parser(input: string) {
  //     let hex = input.replace(/^#|0x/i, ""); // Remove # or 0x

  //     if (hex.length === 3 || hex.length === 4) {
  //       hex = hex
  //         .split("")
  //         .map((c) => c + c)
  //         .join(""); // Expand #RGB[A] → #RRGGBB[AA]
  //     }

  //     if (hex.length === 6) {
  //       hex += "FF"; // Default alpha to FF if missing
  //     }

  //     if (hex.length !== 8) return null; // Ensure correct length

  //     const r = parseInt(hex.slice(0, 2), 16);
  //     const g = parseInt(hex.slice(2, 4), 16);
  //     const b = parseInt(hex.slice(4, 6), 16);
  //     const a = parseInt(hex.slice(6, 8), 16);

  //     return new RGB255(r, g, b, a);
  //   },
  // });

  // // RGB(A) Function Parsers
  // register({
  //   canParse(input: string) {
  //     return (
  //       /^rgba?\(\s*(\d{1,3})(,\s*\d{1,3}){2}(?:,\s*(\d{1,3}|\d{1,3}%))?\s*\)$/i.test(input) ||
  //       /^(\d{1,3}) (\d{1,3}) (\d{1,3})(?: (\d{1,3}))?$/.test(input)
  //     );
  //   },

  //   parser(input: string) {
  //     const match = input.match(/\d+%?/g);
  //     if (!match || match.length < 3) return null;

  //     const parseValue = (v: string) => (v.includes("%") ? Math.round(parseFloat(v) * 2.55) : parseInt(v, 10));

  //     const r = Math.min(255, parseValue(match[0]));
  //     const g = Math.min(255, parseValue(match[1]));
  //     const b = Math.min(255, parseValue(match[2]));
  //     const a = match[3] ? Math.min(255, parseValue(match[3])) : 255;

  //     return new RGB255(r, g, b, a);
  //   },
  // });

  // // Tailwind-Style Space-Separated Parsers
  // register({
  //   canParse(input: string) {
  //     return /^(\d{1,3}) (\d{1,3}) (\d{1,3})(?: (\d{1,3}))?$/.test(input);
  //   },

  //   parser(input: string) {
  //     const match = input.match(/\d+/g);
  //     if (!match || match.length < 3) return null;

  //     const r = Math.min(255, parseInt(match[0], 10));
  //     const g = Math.min(255, parseInt(match[1], 10));
  //     const b = Math.min(255, parseInt(match[2], 10));
  //     const a = match[3] ? Math.min(255, parseInt(match[3], 10)) : 255;

  //     return new RGB255(r, g, b, a);
  //   },
  // });

  // // Numeric Notation Parsers
  // register({
  //   canParse(input: string) {
  //     return /^\d+$/.test(input);
  //   },

  //   parser(input: string) {
  //     const num = parseInt(input, 10);
  //     if (num < 0 || num > 0xffffffff) return null; // Ensure valid range

  //     const r = (num >> 24) & 255;
  //     const g = (num >> 16) & 255;
  //     const b = (num >> 8) & 255;
  //     const a = num & 255;

  //     return new RGB255(r, g, b, a);
  //   },
  // });
});

/*
[
  // Hex formats
  { input: "#33dd44", expected: { r: 51, g: 221, b: 68, a: 255 } },
  { input: "#3d4", expected: { r: 51, g: 221, b: 68, a: 255 } },
  { input: "#33dd4488", expected: { r: 51, g: 221, b: 68, a: 136 } },
  { input: "#3d48", expected: { r: 51, g: 221, b: 68, a: 136 } },
  { input: "0x33dd44", expected: { r: 51, g: 221, b: 68, a: 255 } },
  { input: "0x33dd4488", expected: { r: 51, g: 221, b: 68, a: 136 } },

  // RGB/A with prefix (rgb(...))
  { input: "rgb(51, 221, 68)", expected: { r: 51, g: 221, b: 68, a: 255 } },
  { input: "rgb(51 221 68)", expected: { r: 51, g: 221, b: 68, a: 255 } },
  { input: "rgb( 51,221,68 )", expected: { r: 51, g: 221, b: 68, a: 255 } },
  { input: "rgb(51, 221, 68, 0.53)", expected: { r: 51, g: 221, b: 68, a: 135 } },
  { input: "rgb(51,221,68,0.53)", expected: { r: 51, g: 221, b: 68, a: 135 } },
  { input: "rgb(51 221 68 0.53)", expected: { r: 51, g: 221, b: 68, a: 135 } },
  { input: "rgb(51 221 68 / 0.53)", expected: { r: 51, g: 221, b: 68, a: 135 } },
  { input: "rgb(51, 221, 68, 53%)", expected: { r: 51, g: 221, b: 68, a: 135 } },
  { input: "rgb(51 221 68 53%)", expected: { r: 51, g: 221, b: 68, a: 135 } },
  { input: "rgb(51 221 68 / 53%)", expected: { r: 51, g: 221, b: 68, a: 135 } },
  { input: "rgb(51,221,68,136)", expected: { r: 51, g: 221, b: 68, a: 136 } },
  { input: "rgb(51 221 68 136)", expected: { r: 51, g: 221, b: 68, a: 136 } },
  { input: "rgb(51 221 68 / 136)", expected: { r: 51, g: 221, b: 68, a: 136 } },

  // RGB/A with prefix (rgba(...))
  { input: "rgba(51, 221, 68)", expected: { r: 51, g: 221, b: 68, a: 255 } },
  { input: "rgba(51 221 68)", expected: { r: 51, g: 221, b: 68, a: 255 } },
  { input: "rgba(51,221,68,0.53)", expected: { r: 51, g: 221, b: 68, a: 135 } },
  { input: "rgba(51 221 68 0.53)", expected: { r: 51, g: 221, b: 68, a: 135 } },
  { input: "rgba(51 221 68 / 0.53)", expected: { r: 51, g: 221, b: 68, a: 135 } },
  { input: "rgba(51, 221, 68, 53%)", expected: { r: 51, g: 221, b: 68, a: 135 } },
  { input: "rgba(51 221 68 53%)", expected: { r: 51, g: 221, b: 68, a: 135 } },
  { input: "rgba(51 221 68 / 53%)", expected: { r: 51, g: 221, b: 68, a: 135 } },
  { input: "rgba(51,221,68,136)", expected: { r: 51, g: 221, b: 68, a: 136 } },
  { input: "rgba(51 221 68 136)", expected: { r: 51, g: 221, b: 68, a: 136 } },
  { input: "rgba(51 221 68 / 136)", expected: { r: 51, g: 221, b: 68, a: 136 } },

  // Naked values (without prefix)
  { input: "51, 221, 68", expected: { r: 51, g: 221, b: 68, a: 255 } },
  { input: "51 221 68", expected: { r: 51, g: 221, b: 68, a: 255 } },
  { input: "51,221,68", expected: { r: 51, g: 221, b: 68, a: 255 } },
  { input: "51, 221, 68, 0.53", expected: { r: 51, g: 221, b: 68, a: 135 } },
  { input: "51,221,68,0.53", expected: { r: 51, g: 221, b: 68, a: 135 } },
  { input: "51 221 68 0.53", expected: { r: 51, g: 221, b: 68, a: 135 } },
  { input: "51 221 68 / 0.53", expected: { r: 51, g: 221, b: 68, a: 135 } },
  { input: "51, 221, 68, 53%", expected: { r: 51, g: 221, b: 68, a: 135 } },
  { input: "51 221 68 53%", expected: { r: 51, g: 221, b: 68, a: 135 } },
  { input: "51 221 68 / 53%", expected: { r: 51, g: 221, b: 68, a: 135 } },
  { input: "51,221,68,136", expected: { r: 51, g: 221, b: 68, a: 136 } },
  { input: "51 221 68 136", expected: { r: 51, g: 221, b: 68, a: 136 } },
  { input: "51 221 68 / 136", expected: { r: 51, g: 221, b: 68, a: 136 } },

  // Numeric notation (24-bit integer)
  { input: "3398980", expected: { r: 51, g: 221, b: 68, a: 255 } },

  // Variants with extra spaces and decimals with spaces
  { input: " rgb(  51 , 221 , 68 ,  0.53 ) ", expected: { r: 51, g: 221, b: 68, a: 135 } },
  { input: "51   221   68   /  0.53", expected: { r: 51, g: 221, b: 68, a: 135 } }
]

*/

/*
[
  // Hex
  { input: "#33dd44" },
  { input: "#3d4" },
  { input: "#33dd4488" },
  { input: "#3d48" },
  { input: "0x33dd44" },
  { input: "0x33dd4488" },
  // RGB
  { input: "rgb(51, 221, 68)" },
  { input: "rgb(51 221 68)" },
  { input: "rgb(51, 221, 68, 0.53)" },
  { input: "rgb(51 221 68 0.53)" },
  { input: "rgb(51 221 68 / 0.53)" },
  { input: "rgb(51, 221, 68, 53%)" },
  { input: "rgb(51 221 68 53%)" },
  { input: "rgb(51 221 68 / 53%)" },
  { input: "rgb(51, 221, 68, 136)" },
  { input: "rgb(51 221 68 136)" },
  { input: "rgb(51 221 68 / 136)" },
  // RGBA
  { input: "rgba(51, 221, 68)" },
  { input: "rgba(51 221 68)" },
  { input: "rgba(51, 221, 68, 0.53)" },
  { input: "rgba(51 221 68 0.53)" },
  { input: "rgba(51 221 68 / 0.53)" },
  { input: "rgba(51, 221, 68, 53%)" },
  { input: "rgba(51 221 68 53%)" },
  { input: "rgba(51 221 68 / 53%)" },
  { input: "rgba(51, 221, 68, 136)" },
  { input: "rgba(51 221 68 136)" },
  { input: "rgba(51 221 68 / 136)" },
  // RGB
  { input: "rgb(20%, 87%, 27%)" },
  { input: "rgb(20% 87% 27%)" },
  { input: "rgb(20%, 87%, 27%, 0.53)" },
  { input: "rgb(20% 87% 27% 0.53)" },
  { input: "rgb(20% 87% 27% / 0.53)" },
  { input: "rgb(20%, 87%, 27%, 53%)" },
  { input: "rgb(20% 87% 27% 53%)" },
  { input: "rgb(20% 87% 27% / 53%)" },
  { input: "rgb(20%, 87%, 27%, 136)" },
  { input: "rgb(20% 87% 27% 136)" },
  { input: "rgb(20% 87% 27% / 136)" },
  // RGBA
  { input: "rgba(20%, 87%, 27%)" },
  { input: "rgba(20% 87% 27%)" },
  { input: "rgba(20%, 87%, 27%, 0.53)" },
  { input: "rgba(20% 87% 27% 0.53)" },
  { input: "rgba(20% 87% 27% / 0.53)" },
  { input: "rgba(20%, 87%, 27%, 53%)" },
  { input: "rgba(20% 87% 27% 53%)" },
  { input: "rgba(20% 87% 27% / 53%)" },
  { input: "rgba(20%, 87%, 27%, 136)" },
  { input: "rgba(20% 87% 27% 136)" },
  { input: "rgba(20% 87% 27% / 136)" },
  // Empty
  { input: "51, 221, 68" },
  { input: "51 221 68" },
  { input: "51, 221, 68, 0.53" },
  { input: "51 221 68 0.53" },
  { input: "51 221 68 / 0.53" },
  { input: "51, 221, 68, 53%" },
  { input: "51 221 68 53%" },
  { input: "51 221 68 / 53%" },
  { input: "51, 221, 68, 136" },
  { input: "51 221 68 136" },
  { input: "51 221 68 / 136" },
  // Numeric
  { input: "3398980" },
  // Invalid
  { input: "#c" },
  { input: "#33dd4" },
  { input: "0x33_dd_44" },
  { input: "rgb(51, 221)" },
  { input: "rgb(0.2, 0.87, 0.27)" },
  { input: "255 87" },
  { input: "0b10101010" },
];
*/
