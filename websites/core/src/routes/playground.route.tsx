import { EditorProvider, useEditor } from "@/lib/editors/editor-provider";
import HueEditors from "@/lib/editors/hue-editors";
import OtherEditors from "@/lib/editors/other-editors";
import PerceptualEditors from "@/lib/editors/perceptual-editors";
import PrintEditors from "@/lib/editors/print-editors";
import RGBEditors from "@/lib/editors/rgb-editors";
import VideoEditors from "@/lib/editors/video-editors";
import { RGB } from "@lilbunnyrabbit/chromatics";
import React from "react";

export default function PlaygroundRoute() {
  return (
    <EditorProvider>
      <PlaygroundRouteContent />
    </EditorProvider>
  );
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
      <div className="grid grid-cols-5 mb-8">
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
      </div>

      <div className="grid grid-cols-3 gap-y-4 gap-x-8">
        <h4 className="col-span-3">RGB Models</h4>
        <RGBEditors
          rgb={rgb}
          active={active}
          onRGB={(rgb, active) => {
            setRgb(rgb);
            setActive(active);
          }}
        />

        <h4 className="col-span-3 mt-4">Hue Models</h4>
        <HueEditors
          rgb={rgb}
          active={active}
          onRGB={(rgb, active) => {
            setRgb(rgb);
            setActive(active);
          }}
        />

        <h4 className="col-span-3 mt-4">Print and Color Difference Models</h4>
        <PrintEditors
          rgb={rgb}
          active={active}
          onRGB={(rgb, active) => {
            setRgb(rgb);
            setActive(active);
          }}
        />

        <h4 className="col-span-3 mt-4">Video and Broadcast Standards Models</h4>
        <VideoEditors
          rgb={rgb}
          active={active}
          onRGB={(rgb, active) => {
            setRgb(rgb);
            setActive(active);
          }}
        />

        <h4 className="col-span-3 mt-4">Device-Independent and Perceptual Models</h4>
        <PerceptualEditors
          rgb={rgb}
          active={active}
          onRGB={(rgb, active) => {
            setRgb(rgb);
            setActive(active);
          }}
        />

        <h4 className="col-span-3 mt-4">Other Models</h4>
        <OtherEditors
          rgb={rgb}
          active={active}
          onRGB={(rgb, active) => {
            setRgb(rgb);
            setActive(active);
          }}
        />
      </div>
    </div>
  );
}
