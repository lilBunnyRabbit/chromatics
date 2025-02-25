import { AutoColorBlock } from "@/components/color-block";
import { ColorButton } from "@/components/color-button";
import { ColorSlider__OLD } from "@/components/color-slider";
import { Button } from "@/components/ui/button";
import { conversionRegistry, RGB, RGB255 } from "@lilbunnyrabbit/chromatics";
import React from "react";
import { useLocation } from "react-router";

const conversions = [...conversionRegistry.getRegistry().get(RGB)!.entries()];

export default function RGBRoute() {
  const { state } = useLocation();
  const [rgb, setRgb] = React.useState(() => {
    if (state && "model" in state) {
      if (Array.isArray(state.model)) {
        return new RGB(...(state.model as [number, number, number, number]));
      }
    }

    return RGB.random();
  });

  const color = React.useMemo(() => rgb.toString(), [rgb]);

  // React.useEffect(() => console.log("rgb", rgb), [rgb]);

  return (
    <div
      className="max-h-screen h-screen w-full grid grid-cols-[1fr,min-content]"
      style={{
        backgroundColor: color,
      }}
    >
      <div className="py-8 pl-8">
        <div className="bg-black w-full h-full rounded-3xl p-8">
          <h2 className="flex items-center justify-between">
            RGB <Button onClick={() => setRgb(RGB.random())}>Random</Button>
          </h2>

          <div className="mt-8 grid grid-cols-[min-content,1fr] grid-rows-[repeat(4,3rem)] whitespace-nowrap gap-x-4 items-center">
            <div className="text-sm font-mono mb-2">Red</div>
            <div
              className="rounded-t-lg px-4 h-full flex items-center"
              style={
                rgb.a === 1
                  ? {
                      backgroundColor: color,
                    }
                  : {}
              }
            >
              <ColorSlider__OLD
                model={rgb}
                min={0}
                max={1}
                step={0.01}
                value={[rgb.r]}
                indexChange={(model, index: number) => ((model as RGB255).r = index / 64)}
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
                rgb.a === 1
                  ? {
                      backgroundColor: color,
                    }
                  : {}
              }
            >
              <ColorSlider__OLD
                model={rgb}
                min={0}
                max={1}
                step={0.01}
                value={[rgb.g]}
                indexChange={(model, index: number) => ((model as RGB255).g = index / 64)}
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
                rgb.a === 1
                  ? {
                      backgroundColor: color,
                    }
                  : {}
              }
            >
              <ColorSlider__OLD
                model={rgb}
                min={0}
                max={1}
                step={0.01}
                value={[rgb.b]}
                indexChange={(model, index: number) => ((model as RGB255).b = index / 64)}
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
              <ColorSlider__OLD
                model={rgb}
                min={0}
                max={1}
                step={0.01}
                value={[rgb.a]}
                indexChange={(model, index: number) => ((model as RGB255).a = index / 64)}
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
          </div>

          <h4 className="mt-8 mb-2">Color Values</h4>
          <div className="grid grid-cols-2 gap-x-4 w-fit gap-y-4">
            <div className="flex items-center gap-x-8 justify-between border border-white/60 px-2">
              <div>String</div>
              <div>{rgb.toString()}</div>
            </div>

            <div className="flex items-center gap-x-8 justify-between border border-white/60 px-2">
              <div>Array</div>
              <div>[{rgb.toArray().join(", ")}]</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-4 max-h-full overflow-y-auto p-8">
        <h4 className="bg-black rounded-3xl text-center py-1">Conversions</h4>
        {conversions.map(([_, convert], i) => {
          const model = convert(rgb);
          return <AutoColorBlock key={i} model={model} />;
        })}
      </div>
    </div>
  );
}
