import { AutoColorBlock } from "@/components/color-block";
import { ColorButton } from "@/components/color-button";
import { ColorSlider, SliderBackgroundCheck } from "@/components/color-slider";
import { Button } from "@/components/ui/button";
import { conversionRegistry, parserRegistry, RGB255 } from "@lilbunnyrabbit/chromatics";
import React from "react";

const conversions = [...conversionRegistry.getRegistry().get(RGB255)!.entries()];

export default function RGB255Route() {
  const [rgb, setRgb] = React.useState(() => RGB255.random());

  const color = React.useMemo(() => rgb.toString(), [rgb]);

  React.useEffect(() => console.log("rgb255", rgb), [rgb]);

  return (
    <div
      className="max-h-screen h-screen w-full p-8 grid grid-cols-[1fr,min-content] gap-x-8"
      style={{
        backgroundColor: color,
      }}
    >
      <div className="bg-black w-full h-full rounded-3xl p-8">
        <h2 className="flex items-center justify-between">
          RGB 255 <Button onClick={() => setRgb(RGB255.random())}>Random</Button>
        </h2>

        <div className="mt-8 grid grid-cols-[min-content,1fr] grid-rows-[repeat(4,3rem)] whitespace-nowrap gap-x-4 items-center">
          <div className="text-sm font-mono mb-2">Red</div>
          <div
            className="rounded-t-lg px-4 h-full flex items-center"
            style={
              rgb.a === 255
                ? {
                    backgroundColor: color,
                  }
                : {}
            }
          >
            <ColorSlider
              model={rgb}
              min={0}
              max={255}
              value={[rgb.r]}
              indexChange={(model, index: number) => ((model as RGB255).r = index * 4)}
              onValueChange={(value) =>
                setRgb((rgb) => {
                  const clone = rgb.clone();
                  clone.r = value[0];
                  return clone;
                })
              }
            />
          </div>
          <div className="text-sm font-mono mb-2">Green</div>
          <div
            className="px-4 h-full flex items-center"
            style={
              rgb.a === 255
                ? {
                    backgroundColor: color,
                  }
                : {}
            }
          >
            <ColorSlider
              model={rgb}
              min={0}
              max={255}
              value={[rgb.g]}
              indexChange={(model, index: number) => ((model as RGB255).g = index * 4)}
              onValueChange={(value) =>
                setRgb((rgb) => {
                  const clone = rgb.clone();
                  clone.g = value[0];
                  return clone;
                })
              }
            />
          </div>
          <div className="text-sm font-mono mb-2">Blue</div>{" "}
          <div
            className="rounded-b-lg px-4 h-full flex items-center"
            style={
              rgb.a === 255
                ? {
                    backgroundColor: color,
                  }
                : {}
            }
          >
            <ColorSlider
              model={rgb}
              min={0}
              max={255}
              value={[rgb.b]}
              indexChange={(model, index: number) => ((model as RGB255).b = index * 4)}
              onValueChange={(value) =>
                setRgb((rgb) => {
                  const clone = rgb.clone();
                  clone.b = value[0];
                  return clone;
                })
              }
            />
          </div>
          <div className="text-sm font-mono mb-2">Alpha</div>{" "}
          <div className="px-4 h-full flex items-center">
            <ColorSlider
              model={rgb}
              min={0}
              max={255}
              value={[rgb.a]}
              indexChange={(model, index: number) => ((model as RGB255).a = index * 4)}
              onValueChange={(value) =>
                setRgb((rgb) => {
                  const clone = rgb.clone();
                  clone.a = value[0];
                  return clone;
                })
              }
            />
          </div>
        </div>

        <h4 className="mt-8 mb-2">Actions</h4>
        <div className="flex flex-wrap gap-4">
          <ColorButton model={rgb.invert()} onClick={setRgb}>
            Invert
          </ColorButton>

          <ColorButton model={rgb.grayscale()} onClick={setRgb}>
            Grayscale
          </ColorButton>

          <ColorButton model={rgb.brighten(8)} onClick={setRgb}>
            Brighten (+8)
          </ColorButton>

          <ColorButton model={rgb.brighten(-8)} onClick={setRgb}>
            Darken (-8)
          </ColorButton>
        </div>

        <h4 className="mt-8 mb-2">Color Values</h4>
        <div className="grid grid-cols-2 gap-x-4 w-fit gap-y-4">
          <div className="flex items-center gap-x-8 justify-between border border-white/60 px-2">
            <div>String</div>
            <div>{rgb.toString()}</div>
          </div>

          <div className="flex items-center gap-x-8 justify-between border border-white/60 px-2">
            <div>Hex</div>
            <div>{rgb.toHex()}</div>
          </div>

          <div className="flex items-center gap-x-8 justify-between border border-white/60 px-2">
            <div>Numeric</div>
            <div>{rgb.toNumeric()}</div>
          </div>

          <div className="flex items-center gap-x-8 justify-between border border-white/60 px-2">
            <div>Array</div>
            <div>[{rgb.toArray().join(", ")}]</div>
          </div>
        </div>

        <h4 className="mt-8 mb-2">Parse</h4>
        <ParserInput onSubmit={(model) => setRgb(model)} />
      </div>

      <div className="flex flex-col gap-y-4 max-h-full overflow-y-auto">
        <h4 className="bg-black rounded-3xl text-center py-1">Conversions</h4>
        {conversions.map(([_, convert], i) => {
          const model = convert(rgb);
          return <AutoColorBlock key={i} model={model} />;
        })}
      </div>
    </div>
  );
}

interface ParserInputProps {
  onSubmit: (model: RGB255) => void;
}

const ParserInput: React.FC<ParserInputProps> = ({ onSubmit }) => {
  const [value, setValue] = React.useState("");

  const onSend = () => {
    if (!value) return;

    const parsed = parserRegistry.parseFor(RGB255, value);

    if (parsed) {
      onSubmit(parsed);
      setValue("");
    }
  };

  return (
    <div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.code === "Enter") {
            onSend();
          }
        }}
      />
      <Button type="button" disabled={!value} onClick={onSend}>
        Parse
      </Button>
    </div>
  );
};
