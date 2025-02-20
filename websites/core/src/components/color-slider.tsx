import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

import { cn } from "@/lib/utils";
import { ColorModel } from "@lilbunnyrabbit/chromatics";

const ColorSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & SliderBackgroundProps
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
          backgroundColor: model.toString(),
        }}
      />
    </SliderPrimitive.Root>
  );
});
ColorSlider.displayName = SliderPrimitive.Root.displayName;

export { ColorSlider };

interface SliderBackgroundProps {
  model: ColorModel;
  indexChange: (model: ColorModel, index: number) => void;
}

const SliderBackground = ({ model, indexChange }: SliderBackgroundProps) => {
  const clone = model.clone();

  console.log("SliderBackground", clone);

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
        return <rect key={`r-${i}`} x={i} y={0} width="1" height="1" fill={clone.toString()} />;
      })}
    </svg>
  );
};

interface SliderBackgroundCheckProps<T extends ColorModel> {
  model: T;
  slices: number;
  getIndexColor: (model: T, index: number) => string;
}

export const SliderBackgroundCheck = <T extends ColorModel>({
  model,
  slices,
  getIndexColor,
}: SliderBackgroundCheckProps<T>) => {
  return (
    <svg
      viewBox={`0 0 ${slices} 1`}
      className="w-full h-4"
      preserveAspectRatio="none"
      shapeRendering="optimizespeed"
      xmlns="http://www.w3.org/2000/svg"
    >
      {Array.from({ length: slices }).map((_, i) => {
        const color = getIndexColor(model, i);
        return <rect key={`r-${i}`} x={i} y={0} width="1" height="1" fill={color} />;
      })}
    </svg>
  );
};
