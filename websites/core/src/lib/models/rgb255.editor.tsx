import { RGB255 } from "@lilbunnyrabbit/chromatics";
import React from "react";

interface Rgb255EditorProps {
  value: RGB255;
}

export const Rgb255Editor: React.FC<Rgb255EditorProps> = ({ value }) => {
  const [rgb, setRgb] = React.useState(() => value);

  return (
    <div className="flex flex-col gap-2 bg-white w-[450px] p-4 text-black">
      <div
        className="w-full h-16 flex items-center justify-center font-mono"
        style={{
          backgroundColor: rgb.toString(),
        }}
      >
        {rgb.toHex()}
      </div>

      <div className="mt-2">
        <div className="text-sm font-mono">Red ({rgb.r})</div>
        <svg
          viewBox="0 0 256 1"
          className="w-full h-6"
          preserveAspectRatio="none"
          shapeRendering="optimizespeed"
          xmlns="http://www.w3.org/2000/svg"
        >
          {Array.from({ length: 256 }).map((_, i) => {
            const clone = rgb.clone();
            clone.r = i;

            const isSelected = i == rgb.r;

            return (
              <React.Fragment key={`r-${i}`}>
                <rect
                  x={i}
                  y={0}
                  width="1"
                  height="1"
                  fill={clone.toString()}
                  onClick={() => {
                    setRgb(clone);
                  }}
                />

                {isSelected && (
                  <rect
                    x={i}
                    y={0}
                    width="1"
                    height="1"
                    fill="white"
                    shapeRendering="crispEdges"
                    className="pointer-events-none"
                  />
                )}
              </React.Fragment>
            );
          })}
        </svg>
      </div>

      <div>
        <div className="text-sm font-mono">Green ({rgb.g})</div>
        <svg
          viewBox="0 0 256 1"
          className="w-full h-6"
          preserveAspectRatio="none"
          shapeRendering="optimizespeed"
          xmlns="http://www.w3.org/2000/svg"
        >
          {Array.from({ length: 256 }).map((_, i) => {
            const clone = rgb.clone();
            clone.g = i;

            return (
              <rect
                key={`g-${i}`}
                x={i}
                y={0}
                width="1"
                height="1"
                fill={clone.toString()}
                onClick={() => {
                  setRgb(clone);
                }}
              />
            );
          })}
        </svg>
      </div>

      <div>
        <div className="text-sm font-mono">Blue ({rgb.b})</div>
        <svg
          viewBox="0 0 256 1"
          className="w-full h-6"
          preserveAspectRatio="none"
          shapeRendering="optimizespeed"
          xmlns="http://www.w3.org/2000/svg"
        >
          {Array.from({ length: 256 }).map((_, i) => {
            const clone = rgb.clone();
            clone.b = i;

            return (
              <rect
                key={`b-${i}`}
                x={i}
                y={0}
                width="1"
                height="1"
                fill={clone.toString()}
                onClick={() => {
                  setRgb(clone);
                }}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};
