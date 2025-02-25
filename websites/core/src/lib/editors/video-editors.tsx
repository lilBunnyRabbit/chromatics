import { ColorSlider, ModelBackground } from "@/components/color-slider";
import { YCbCr255 } from "../../../../../src/models/video/ycbcr255";
import { AllEditorProps, EditorProps, ModelEditor, ModelTodo, useModelEditor } from "./model-editor";

export const YCbCr255Editor = ({ rgb, isActive, onRGB }: EditorProps) => {
  const { model, setCloneModel } = useModelEditor<YCbCr255>({
    rgb,
    isActive,
    onRGB,
    from(model) {
      return model.to.RGB255().to.RGB();
    },
    to(rgb) {
      return rgb.to.RGB255().to.YCbCr255();
    },
  });

  return (
    <ModelEditor color={model.toCSS()} title="YCbCr255">
      <ColorSlider
        label="Luminance"
        model={model}
        min={0}
        max={255}
        value={[model.y]}
        onValueChange={(value) => setCloneModel((clone) => (clone.y = value[0]))}
      >
        <ModelBackground model={model} steps={64} modify={(model, i) => (model.y = i * 4)} />
      </ColorSlider>

      <ColorSlider
        label="Blue Chroma"
        model={model}
        min={0}
        max={255}
        value={[model.cb]}
        onValueChange={(value) => setCloneModel((clone) => (clone.cb = value[0]))}
      >
        <ModelBackground model={model} steps={64} modify={(model, i) => (model.cb = i * 4)} />
      </ColorSlider>

      <ColorSlider
        label="Red Chroma"
        model={model}
        min={0}
        max={255}
        value={[model.cr]}
        onValueChange={(value) => setCloneModel((clone) => (clone.cr = value[0]))}
      >
        <ModelBackground model={model} steps={64} modify={(model, i) => (model.cr = i * 4)} />
      </ColorSlider>
    </ModelEditor>
  );
};

export default function VideoEditors({ rgb, active, onRGB }: AllEditorProps) {
  return (
    <>
      <YCbCr255Editor rgb={rgb} isActive={active === "ycbcr255"} onRGB={(rgb) => onRGB(rgb, "ycbcr255")} />

      <ModelTodo>xvYCC</ModelTodo>
      <ModelTodo>YCbCr</ModelTodo>
      <ModelTodo>YPbPr</ModelTodo>
      <ModelTodo>YUV</ModelTodo>
      <ModelTodo>ICtCp</ModelTodo>
      <ModelTodo>YIQ</ModelTodo>
      <ModelTodo>sYCC</ModelTodo>
      <ModelTodo>YCgCo</ModelTodo>
    </>
  );
}
