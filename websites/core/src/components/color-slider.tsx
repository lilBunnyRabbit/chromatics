import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

import { cn } from "@/lib/utils";
import { ColorModel } from "@lilbunnyrabbit/chromatics";
import { round2 } from "../../../../src/utils";

const ColorSlider__OLD = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & ModelBackgroundProps
>(({ className, model, indexChange, ...props }, ref) => {
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full">
        <SliderBackground model={model} indexChange={indexChange} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className="block h-6 w-3 rounded-lg border border-white bg-black shadow focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
        style={{
          backgroundColor: model.toCSS(),
        }}
      />
    </SliderPrimitive.Root>
  );
});
ColorSlider__OLD.displayName = SliderPrimitive.Root.displayName;

export { ColorSlider__OLD };

interface ModelBackgroundProps {
  model: ColorModel;
  indexChange: (model: ColorModel, index: number) => void;
}

const SliderBackground = ({ model, indexChange }: ModelBackgroundProps) => {
  const clone = model.clone();

  // console.log("SliderBackground", clone);

  return (
    <svg
      viewBox="0 0 64 1"
      className="w-full h-4"
      preserveAspectRatio="none"
      shapeRendering="optimizespeed"
      xmlns="http://www.w3.org/2000/svg"
    >
      {Array.from({ length: 64 }).map((_, i) => {
        indexChange(clone, i);
        return <rect key={`r-${i}`} x={i} y={0} width="1" height="1" fill={clone.toCSS()} />;
      })}
    </svg>
  );
};

const ColorSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & { model: ColorModel; label?: React.ReactNode }
>(({ className, model, children, label, ...props }, ref) => {
  return (
    <>
      {label && <div className="bg-black px-2 py-1 rounded-lg font-mono text-sm text-center">{label}</div>}

      <SliderPrimitive.Root
        ref={ref}
        className={cn("relative flex w-full touch-none select-none items-center", className)}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full">
          {children}
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="block h-6 w-3 rounded-lg border border-white bg-black shadow focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
          style={{
            backgroundColor: model.toCSS(),
          }}
        />
      </SliderPrimitive.Root>

      {typeof props.value?.[0] === "number" && (
        <div className="bg-black px-2 py-1 rounded-lg font-mono text-sm text-center min-w-[66.42px]">
          {round2(props.value[0])}
        </div>
      )}
    </>
  );
});
ColorSlider.displayName = SliderPrimitive.Root.displayName;

export { ColorSlider };

export function ModelBackground<const T extends number, TModel extends ColorModel>({
  model,
  modify,
  steps,
  className,
}: {
  model: TModel;
  steps: T;
  modify(model: TModel, index: number, steps: T): void;
  className?: string;
}) {
  const clone = model.clone() as TModel;

  // console.log("SliderBackground", clone);

  return (
    <svg
      viewBox={`0 0 ${steps} 1`}
      className={cn("w-full h-4", className)}
      preserveAspectRatio="none"
      shapeRendering="optimizespeed"
      xmlns="http://www.w3.org/2000/svg"
    >
      {Array.from({ length: steps }).map((_, i) => {
        modify(clone, i, steps);
        return <rect key={`step-${i}`} x={i} y={0} width="1" height="1" fill={clone.toCSS()} />;
      })}
    </svg>
  );
}
