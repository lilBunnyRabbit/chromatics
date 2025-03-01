import { Collapsable } from "@/components/collapsable";
import { Button } from "@/components/ui/button";
import { EditorProvider, useEditor } from "@/lib/editors/editor-provider";
import HueEditors from "@/lib/editors/hue-editors";
import OtherEditors from "@/lib/editors/other-editors";
import PerceptualEditors from "@/lib/editors/perceptual-editors";
import PrintEditors from "@/lib/editors/print-editors";
import RGBEditors from "@/lib/editors/rgb-editors";
import VideoEditors from "@/lib/editors/video-editors";
import { RGB, RGB255 } from "@lilbunnyrabbit/chromatics";
import React from "react";

export default function PlaygroundRoute() {
  return (
    <EditorProvider>
      <PlaygroundRouteContent />
    </EditorProvider>
  );
}

function test() {
  const min = {
    x: Number.MAX_VALUE,
    y: Number.MAX_VALUE,
    z: Number.MAX_VALUE,
  };

  const max = {
    x: Number.MIN_VALUE,
    y: Number.MIN_VALUE,
    z: Number.MIN_VALUE,
  };

  for (let r = 0; r < 255; r++) {
    for (let g = 0; g < 255; g++) {
      for (let b = 0; b < 255; b++) {
        const rgb = new RGB255(r, g, b);
        const [x, y, z] = rgb.to.RGB().to.LinearRGB().to.XYZ();

        if (x < min.x) min.x = x;
        if (x > max.x) max.x = x;

        if (y < min.y) min.y = y;
        if (y > max.y) max.y = y;

        if (z < min.z) min.z = z;
        if (z > max.z) max.z = z;
      }
    }
  }

  console.log({ min, max });
}

function PlaygroundRouteContent() {
  const [rgb, setRgb] = React.useState(RGB.random());
  const [active, setActive] = React.useState<string | null>(null);

  const editor = useEditor();

  return (
    <div
      className="min-h-screen w-full p-8"
      style={{
        backgroundColor: rgb.toCSS(),
      }}
    >
      <div className="grid grid-cols-6 mb-8">
        <div>
          <input
            className="mr-2"
            type="checkbox"
            checked={editor.showTodo}
            onChange={(e) => {
              editor.setShowTodo(e.target.checked);
            }}
          ></input>
          Show TODO
        </div>

        <span>R: {rgb.r}</span>
        <span>G: {rgb.g}</span>
        <span>B: {rgb.b}</span>
        <span>A: {rgb.a}</span>

        <Button onClick={test}>Test</Button>
      </div>

      <div className="grid grid-cols-3 gap-y-4 gap-x-8">
        <Collapsable className="col-span-3" title="RGB Models">
          <RGBEditors
            rgb={rgb}
            active={active}
            onRGB={(rgb, active) => {
              setRgb(rgb);
              setActive(active);
            }}
          />
        </Collapsable>

        <Collapsable className="col-span-3 mt-4" title="Hue Models">
          <HueEditors
            rgb={rgb}
            active={active}
            onRGB={(rgb, active) => {
              setRgb(rgb);
              setActive(active);
            }}
          />
        </Collapsable>

        <Collapsable className="col-span-3 mt-4" title="Print and Color Difference Models">
          <PrintEditors
            rgb={rgb}
            active={active}
            onRGB={(rgb, active) => {
              setRgb(rgb);
              setActive(active);
            }}
          />
        </Collapsable>

        <Collapsable className="col-span-3 mt-4" title="Video and Broadcast Standards Models">
          <VideoEditors
            rgb={rgb}
            active={active}
            onRGB={(rgb, active) => {
              setRgb(rgb);
              setActive(active);
            }}
          />
        </Collapsable>

        <Collapsable className="col-span-3 mt-4" title="Device-Independent and Perceptual Models">
          <PerceptualEditors
            rgb={rgb}
            active={active}
            onRGB={(rgb, active) => {
              setRgb(rgb);
              setActive(active);
            }}
          />
        </Collapsable>

        <Collapsable className="col-span-3 mt-4" title="Other Models">
          <OtherEditors
            rgb={rgb}
            active={active}
            onRGB={(rgb, active) => {
              setRgb(rgb);
              setActive(active);
            }}
          />
        </Collapsable>
      </div>
    </div>
  );
}
