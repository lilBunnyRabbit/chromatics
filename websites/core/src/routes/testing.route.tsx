import { Rgb255Editor } from "@/lib/models/rgb255.editor";
import { conversionRegistry, HSL, parserRegistry, RGB255 } from "@lilbunnyrabbit/chromatics";
import React from "react";

const conversions = conversionRegistry.getRegistry().get(RGB255);

export function TestingRoute2() {
  const [rgb, setRgb] = React.useState<RGB255>(new RGB255(16, 150, 150));

  const conversionEntries = React.useMemo(() => [...conversions!.entries()], []);

  return (
    <div className="p-8 h-screen w-screen">
      <div
        className="w-full h-full rounded-3xl p-6"
        style={{
          backgroundColor: rgb.toString(),
        }}
      >
        <h3 className="text-black bg-white w-fit">RGB</h3>
        <div className="text-black grid grid-cols-3 bg-white mt-4">
          <div>{rgb.toString()}</div>
          <div>{rgb.toHex()}</div>
          <div>{rgb.toNumeric()}</div>
        </div>
        <div className="text-black mt-4">Slect R G B</div>
        <svg viewBox="0 0 1024 64" className="w-full object-contain" xmlns="http://www.w3.org/2000/svg">
          {Array.from({ length: 256 }).map((_, i) => {
            const cloneR = rgb.clone();
            cloneR.r = i;

            const cloneG = rgb.clone();
            cloneG.g = i;

            const cloneB = rgb.clone();
            cloneB.b = i;

            return (
              <React.Fragment key={`r-${i}`}>
                <rect
                  x={i * 4}
                  y={0}
                  width="4"
                  height="16"
                  fill={cloneR.toString()}
                  strokeWidth={1}
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  paintOrder="fill"
                  className="hover:!stroke-black"
                  onClick={() => {
                    setRgb(cloneR);
                  }}
                />
                <rect
                  x={i * 4}
                  y={24}
                  width="4"
                  height="16"
                  fill={cloneG.toString()}
                  strokeWidth={1}
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  paintOrder="fill"
                  className="hover:!stroke-black"
                  onClick={() => {
                    setRgb(cloneG);
                  }}
                />
                <rect
                  x={i * 4}
                  y={48}
                  width="4"
                  height="16"
                  fill={cloneB.toString()}
                  strokeWidth={1}
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  paintOrder="fill"
                  className="hover:!stroke-black"
                  onClick={() => {
                    setRgb(cloneB);
                  }}
                />
              </React.Fragment>
            );
          })}
        </svg>
        <div className="text-black mt-4">Conversions</div>
        {conversionEntries.map(([fn, convert], i) => {
          const model = convert(rgb);
          // console.log({ model });

          return (
            <div key={i} className="text-black">
              <div>
                {fn.name} = {model.toString()}
              </div>
            </div>
          );
        })}

        <div className="mt-8 w-fit">
          <Rgb255Editor value={rgb} />
        </div>

        <ParseTest />
      </div>
    </div>
  );
}

const ParseTest: React.FC = () => {
  const [value, setValue] = React.useState("");

  return (
    <div className="mt-16">
      <input value={value} onChange={(e) => setValue(e.target.value)}></input>
      <button
        onClick={() => {
          if (!value) return;

          const parsed = parserRegistry.parseAll(value);
          console.log("Parse All", parsed);
          console.log(
            parsed
              .filter((p) => p.result)
              .map((p) => `${p.result}${"toHex" in p.result ? ` ${p.result.toHex()}` : ""}`)
              .join("\n")
          );
        }}
      >
        Click
      </button>
    </div>
  );
};

function parseFloat(value: string): number {
  if (!value) return 0;

  if (value.endsWith("%")) {
    const sliced = value.slice(0, -1);
    return Number.parseFloat(sliced) / 100;
  }

  return Number.parseFloat(value);
}

export default function TestingRoute() {
  const [input, setInput] = React.useState("");

  const color = React.useMemo(() => {
    const { h, s, l, a } =
      input.match(/^\s*(?<h>\d*\.?\d*)\s*,?\s*(?<s>\d*\.?\d*%?)\s*,?\s*(?<l>\d*\.?\d*%?)\s*,?\s*(?<a>\d*\.?\d*%?)\s*/)
        ?.groups ?? {};

    if (h && s && l) {
      const hsl = new HSL(parseFloat(h), parseFloat(s), parseFloat(l), parseFloat(a || "1"));
      const rgb = hsl.to.RGB().to.RGB255();
      return { hsl, rgb };
    }
  }, [input]);

  return (
    <div className="w-full h-full min-h-dvh flex items-center justify-center flex-col gap-8">
      <input
        className="max-w-4xl w-full bg-white text-black px-4 py-2 outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></input>

      {color && (
        <div className="grid grid-cols-2 grid-rows-2 gap-x-8">
          <div className="text-4xl">{color.hsl.toCSS()}</div>
          <div
            className="uppercase min-h-20"
            style={{
              background: color.hsl.toCSS(),
            }}
          ></div>

          <div className="select-all text-4xl uppercase">{color.rgb.toHex().toUpperCase()}</div>
          <div
            className="uppercase min-h-20"
            style={{
              background: color.rgb.toHex(),
            }}
          ></div>
        </div>
      )}
    </div>
  );
}
