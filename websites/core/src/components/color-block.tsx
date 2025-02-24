import { HSI, RGB, RGB255 } from "@lilbunnyrabbit/chromatics";
import { ChevronRightIcon } from "lucide-react";
import React from "react";
import { Link, To } from "react-router";
import { round } from "../../../../src/utils";

const modelProps = new Map<unknown, (model: any) => ColorBlockProps>();

modelProps.set(RGB255, (model: RGB255) => ({
  model: "RGB (255)",
  color: model.toCSS(),
  columns: 4,
  parameters: [
    ["R", model.r],
    ["G", model.g],
    ["B", model.b],
    ["A", model.a],
  ],
  to: `/models/rgb255?value=${model.toHex()}`,
  state: { model: model.toArray() },
}));

modelProps.set(RGB, (model: RGB) => ({
  model: "RGB",
  color: model.toCSS(),
  columns: 4,
  parameters: [
    ["R", round(model.r, 2)],
    ["G", round(model.g, 2)],
    ["B", round(model.b, 2)],
    ["A", round(model.a, 2)],
  ],
  to: `/models/rgb?value=${model.toString()}`,
  state: { model: model.toArray() },
}));


modelProps.set(HSI, (model: HSI) => ({
  model: "HSI",
  color: model.toCSS(),
  columns: 4,
  parameters: [
    ["H", round(model.h, 2)],
    ["S", round(model.s, 2)],
    ["I", round(model.i, 2)],
    ["A", round(model.a, 2)],
  ],
  state: { model: model.toArray() },
}));

interface AutoColorBlockProps {
  model: any;
  label?: React.ReactNode;
}

export const AutoColorBlock: React.FC<AutoColorBlockProps> = ({ model, label }) => {
  const props = React.useMemo(() => {
    return modelProps.get(model.constructor)?.(model);
  }, [model]);

  if (!props) {
    return `Model Not Supported: ${model}`;
  }

  return <ColorBlock label={label} {...props} />;
};

interface ColorBlockProps {
  model: string;
  color: string;
  parameters: [param: React.ReactNode, value: React.ReactNode][];
  to?: To;
  state?: any;
  label?: React.ReactNode;
  columns?: number;
}

export const ColorBlock: React.FC<ColorBlockProps> = ({ model, color, parameters, to, label, columns = 3, state }) => {
  return (
    <div className="min-w-80 rounded-xl overflow-hidden shadow-[8px_8px_8px_0px_rgba(0,0,0,0.27)]">
      <div className="bg-black">
        <div className="flex flex-col gap-2 p-2" style={{ backgroundColor: color }}>
          <div className="px-4 py-2 bg-black text-sm rounded-lg flex items-center justify-between">
            {model}
            {to && (
              <Link to={to} state={state}>
                <ChevronRightIcon className="size-5" />
              </Link>
            )}
          </div>

          <div className="px-4 py-2 bg-black text-xs rounded-lg text-white">{color}</div>

          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
            }}
          >
            {parameters.map(([param, value], i) => {
              return (
                <div key={i} className="px-1 py-2 bg-black text-sm rounded-lg truncate text-center">
                  <div className="text-xs font-light">{param}</div>
                  <div className="truncate">{value}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
