import { AutoColorBlock } from "@/components/color-block";
import { parserRegistry } from "@lilbunnyrabbit/chromatics";
import { isNullable } from "@lilbunnyrabbit/utils";

console.log({ parserRegistry });

const rgb255Examples = [
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
  { input: "51   221   68   /  0.53", expected: { r: 51, g: 221, b: 68, a: 135 } },
];

const rgbExamples = [
  // Prefixed percentage examples:
  { input: "rgb(20%, 86.67%, 26.67%)", expected: { r: 0.2, g: 0.87, b: 0.27, a: 1 } },
  { input: "rgb(20% 86.67% 26.67% / 80%)", expected: { r: 0.2, g: 0.87, b: 0.27, a: 0.8 } },
  { input: "rgba(20%,86.67%,26.67%,80%)", expected: { r: 0.2, g: 0.87, b: 0.27, a: 0.8 } },

  // Prefixed floating examples:
  { input: "rgb(0.2, 0.87, 0.27)", expected: { r: 0.2, g: 0.87, b: 0.27, a: 1 } },
  { input: "rgb(0.2 0.87 0.27 / 0.8)", expected: { r: 0.2, g: 0.87, b: 0.27, a: 0.8 } },
  { input: "rgba(0.2,0.87,0.27,0.8)", expected: { r: 0.2, g: 0.87, b: 0.27, a: 0.8 } },

  // Naked percentage examples:
  { input: "20%, 86.67%, 26.67%", expected: { r: 0.2, g: 0.87, b: 0.27, a: 1 } },
  { input: "20% 86.67% 26.67%", expected: { r: 0.2, g: 0.87, b: 0.27, a: 1 } },
  { input: "20%,86.67%,26.67%,80%", expected: { r: 0.2, g: 0.87, b: 0.27, a: 0.8 } },
  { input: "20% 86.67% 26.67% / 80%", expected: { r: 0.2, g: 0.87, b: 0.27, a: 0.8 } },

  // Naked floating examples:
  { input: "0.2, 0.87, 0.27", expected: { r: 0.2, g: 0.87, b: 0.27, a: 1 } },
  { input: "0.2 0.87 0.27", expected: { r: 0.2, g: 0.87, b: 0.27, a: 1 } },
  { input: "0.2,0.87,0.27,0.8", expected: { r: 0.2, g: 0.87, b: 0.27, a: 0.8 } },
  { input: "0.2 0.87 0.27 / 0.8", expected: { r: 0.2, g: 0.87, b: 0.27, a: 0.8 } },

  // Variants with extra spaces:
  { input: " rgb(  20% ,  86.67% , 26.67% ,  80%  ) ", expected: { r: 0.2, g: 0.87, b: 0.27, a: 0.8 } },
  { input: "   0.2    0.87    0.27   /   0.8   ", expected: { r: 0.2, g: 0.87, b: 0.27, a: 0.8 } },
];
export default function ParsingRoute() {
  return (
    <div className="p-8 grid grid-cols-5 w-fit whitespace-nowrap gap-x-8 gap-y-8">
      {rgb255Examples.map((example, i) => {
        const parsed = parserRegistry.parseAll(example.input);
        return (
          <div key={`rgb255-${i}`}>
            <div className="border-b border-b-white/40 mb-2">{example.input}</div>
            {/* <div>
              {example.rgb && (
                <>
                  <div>R: {example.rgb.r}</div>
                  <div>G: {example.rgb.g}</div>
                  <div>B: {example.rgb.b}</div>
                </>
              )}
              <br />
              {example.hex}
            </div> */}

            <div className="flex flex-col gap-2 max-w-full overflow-y-auto">
              {parsed
                .filter((p) => !isNullable(p.result))
                .map((p, j) => {
                  if (!p.result) return "No";

                  return <AutoColorBlock key={`example-${i}-${j}`} model={p.result} />;
                })}
            </div>
          </div>
        );
      })}

      {rgbExamples.map((example, i) => {
        const parsed = parserRegistry.parseAll(example.input);
        return (
          <div key={`rgb-${i}`}>
            <div className="border-b border-b-white/40 mb-2">{example.input}</div>
            {/* <div>
              {example.rgb && (
                <>
                  <div>R: {example.rgb.r}</div>
                  <div>G: {example.rgb.g}</div>
                  <div>B: {example.rgb.b}</div>
                </>
              )}
              <br />
              {example.hex}
            </div> */}

            <div className="flex flex-col gap-2 max-w-full overflow-y-auto">
              {parsed
                .filter((p) => !isNullable(p.result))
                .map((p, j) => {
                  if (!p.result) return "No";

                  return <AutoColorBlock key={`example-${i}-${j}`} model={p.result} />;
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
