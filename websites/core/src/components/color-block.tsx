import { RGB, RGB255 } from "@lilbunnyrabbit/chromatics";
import React from "react";
import { Link, To } from "react-router";
import { round } from "../../../../src/utils";
import { cn } from "@/lib/utils";

const modelProps = new Map<unknown, (model: any) => ColorBlockProps>();

modelProps.set(RGB255, (model: RGB255) => ({
  model: "RGB (255)",
  color: model.toHex(),
  parameters: [
    [
      ["R", model.r],
      ["G", model.g],
      ["B", model.b],
      ["A", model.a],
    ],
  ],
  to: `/models/rgb255?value=${model.toHex()}`,
}));

modelProps.set(RGB, (model: RGB) => ({
  model: "RGB",
  color: model.toString(),
  parameters: [
    [
      ["R", round(model.r, 2)],
      ["G", round(model.g, 2)],
      ["B", round(model.b, 2)],
      ["A", round(model.a, 2)],
    ],
  ],
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
  parameters: [param: React.ReactNode, value: React.ReactNode][][];
  to?: To;
  label?: React.ReactNode;
}

export const ColorBlock: React.FC<ColorBlockProps> = ({ model, color, parameters, to, label }) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 grid-rows-[min-content,4rem,min-content,min-content] rounded-lg min-w-72 overflow-y-hidden",
        label && "grid-rows-[min-content,min-content,4rem,min-content,min-content]"
      )}
    >
      {label && <div className="text-sm text-white/80 bg-black/90 rounded-t-lg font-light px-3 pt-1 pb-0.5">{label}</div>}

      {to ? (
        <Link to={to} className="px-3 py-2 flex justify-between items-center bg-black">
          <div>{model}</div> <div className="text-sm text-white/80 font-light">{color}</div>
        </Link>
      ) : (
        <div className="px-3 py-2 flex justify-between items-center bg-black">
          <div>{model}</div> <div className="text-sm text-white/80 font-light">{color}</div>
        </div>
      )}

      <div className="w-full" style={{ backgroundColor: color }} />

      <div className="bg-black/90 flex flex-col px-3 py-2 text-sm font-normal rounded-b-lg">
        {parameters.map((row, i) => (
          <div key={`${i}`} className="flex justify-between text-center flex-wrap">
            {row.map(([param, value], j) => {
              return (
                <div key={`${i}-${j}`}>
                  <div className="text-xs font-light">{param}</div>
                  <div>{value}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
