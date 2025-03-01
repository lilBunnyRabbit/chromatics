import { ColorSlider, ModelBackground } from "@/components/color-slider";
import { XYZ } from "../../../../../src/models/perceptual/xyz";
import { AllEditorProps, EditorProps, ModelEditor, ModelTodo, useModelEditor } from "./model-editor";

export const XYZEditor = ({ rgb, isActive, onRGB }: EditorProps) => {
  const { model, setCloneModel } = useModelEditor<XYZ>({
    rgb,
    isActive,
    onRGB,
    from(model) {
      return model.to.LinearRGB().to.RGB();
    },
    to(rgb) {
      return rgb.to.LinearRGB().to.XYZ();
    },
  });

  return (
    <ModelEditor className="col-span-3" color={model.toCSS()} title="XYZ">
      <ColorSlider
        label="X"
        model={model}
        min={0}
        // max={95.05}
        // max={0.9420127868652344}
        max={100}
        step={0.01}
        value={[model.x]}
        onValueChange={(value) => setCloneModel((clone) => (clone.x = value[0]))}
      >
        <ModelBackground model={model} steps={50} modify={(model, i) => (model.x = i * 2)} />
      </ColorSlider>

      <ColorSlider
        label="Y"
        model={model}
        min={0}
        // max={100}
        // max={0.9911022186279297}
        max={100}
        step={0.01}
        value={[model.y]}
        onValueChange={(value) => setCloneModel((clone) => (clone.y = value[0]))}
      >
        <ModelBackground model={model} steps={50} modify={(model, i) => (model.y = i * 2)} />
      </ColorSlider>

      <ColorSlider
        label="Z"
        model={model}
        min={0}
        // max={108.88}
        // max={1.0791417360305786}
        max={100}
        step={0.01}
        value={[model.z]}
        onValueChange={(value) => setCloneModel((clone) => (clone.z = value[0]))}
      >
        <ModelBackground model={model} steps={50} modify={(model, i) => (model.z = i * 2)} />
      </ColorSlider>
    </ModelEditor>
  );
};

export default function PerceptualEditors({ rgb, active, onRGB }: AllEditorProps) {
  return (
    <>
      <XYZEditor rgb={rgb} isActive={active === "xyz"} onRGB={(rgb) => onRGB(rgb, "xyz")} />

      <ModelTodo>CIE Lab</ModelTodo>
      <ModelTodo>LCHab</ModelTodo>
      <ModelTodo>CIE LCh</ModelTodo>
      <ModelTodo>LUV</ModelTodo>
      <ModelTodo>LCHuv</ModelTodo>
      <ModelTodo>Oklab</ModelTodo>
      <ModelTodo>Oklch</ModelTodo>
      <ModelTodo>JzAzBz</ModelTodo>
      <ModelTodo>JzCzHz</ModelTodo>
      <ModelTodo>CIECAM02</ModelTodo>
      <ModelTodo>CAM16</ModelTodo>
      <ModelTodo>CAM16-UCS</ModelTodo>
      <ModelTodo>Osa-UCS</ModelTodo>
      <ModelTodo>IPT</ModelTodo>
    </>
  );
}
