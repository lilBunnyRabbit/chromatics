import { ColorSlider, ModelBackground } from "@/components/color-slider";
import { RGB, RGB255 } from "@lilbunnyrabbit/chromatics";
import { AllEditorProps, EditorProps, ModelEditor, ModelTodo, useModelEditor } from "./model-editor";

export const RGBEditor = ({ rgb, isActive, onRGB }: EditorProps) => {
  const { model, setCloneModel } = useModelEditor<RGB>({
    rgb,
    isActive,
    onRGB,
    from(model) {
      return model.clone();
    },
    to(rgb) {
      return rgb.clone();
    },
  });

  return (
    <ModelEditor color={model.toCSS()} title="RGB">
      <ColorSlider
        label="Red"
        model={model}
        min={0}
        max={1}
        step={0.01}
        value={[model.r]}
        onValueChange={(value) => setCloneModel((clone) => (clone.r = value[0]))}
      >
        <ModelBackground model={model} steps={60} modify={(model, i, steps) => (model.r = i / steps)} />
      </ColorSlider>

      <ColorSlider
        label="Green"
        model={model}
        min={0}
        max={1}
        step={0.01}
        value={[model.g]}
        onValueChange={(value) => setCloneModel((clone) => (clone.g = value[0]))}
      >
        <ModelBackground model={model} steps={60} modify={(model, i, steps) => (model.g = i / steps)} />
      </ColorSlider>

      <ColorSlider
        label="Blue"
        model={model}
        min={0}
        max={1}
        step={0.01}
        value={[model.b]}
        onValueChange={(value) => setCloneModel((clone) => (clone.b = value[0]))}
      >
        <ModelBackground model={model} steps={60} modify={(model, i, steps) => (model.b = i / steps)} />
      </ColorSlider>

      <ColorSlider
        label="Alpha"
        model={model}
        min={0}
        max={1}
        step={0.01}
        value={[model.a]}
        onValueChange={(value) => setCloneModel((clone) => (clone.a = value[0]))}
      >
        <ModelBackground model={model} steps={60} modify={(model, i, steps) => (model.a = i / steps)} />
      </ColorSlider>
    </ModelEditor>
  );
};

export const RGB255Editor = ({ rgb, isActive, onRGB }: EditorProps) => {
  const { model, setCloneModel } = useModelEditor<RGB255>({
    rgb,
    isActive,
    onRGB,
    from(model) {
      return model.to.RGB();
    },
    to(rgb) {
      return rgb.to.RGB255();
    },
  });

  return (
    <ModelEditor color={model.toHex()} title="RGB255">
      <ColorSlider
        label="Red"
        model={model}
        min={0}
        max={255}
        value={[model.r]}
        onValueChange={(value) => setCloneModel((clone) => (clone.r = value[0]))}
      >
        <ModelBackground model={model} steps={64} modify={(model, i) => (model.r = i * 4)} />
      </ColorSlider>

      <ColorSlider
        label="Green"
        model={model}
        min={0}
        max={255}
        value={[model.g]}
        onValueChange={(value) => setCloneModel((clone) => (clone.g = value[0]))}
      >
        <ModelBackground model={model} steps={64} modify={(model, i) => (model.g = i * 4)} />
      </ColorSlider>

      <ColorSlider
        label="Blue"
        model={model}
        min={0}
        max={255}
        value={[model.b]}
        onValueChange={(value) => setCloneModel((clone) => (clone.b = value[0]))}
      >
        <ModelBackground model={model} steps={64} modify={(model, i) => (model.b = i * 4)} />
      </ColorSlider>
    </ModelEditor>
  );
};

export default function RGBEditors({ rgb, active, onRGB }: AllEditorProps) {
  return (
    <>
      <RGBEditor rgb={rgb} isActive={active === "rgb"} onRGB={(rgb) => onRGB(rgb, "rgb")} />

      <RGB255Editor rgb={rgb} isActive={active === "rgb255"} onRGB={(rgb) => onRGB(rgb, "rgb255")} />

      <ModelTodo>sRGB</ModelTodo>
      <ModelTodo>Linear sRGB</ModelTodo>
      <ModelTodo>ACES</ModelTodo>
      <ModelTodo>ACEScc</ModelTodo>
      <ModelTodo>ACEScg</ModelTodo>
      <ModelTodo>Adobe RGB</ModelTodo>
      <ModelTodo>BT.2020 / REC.2020</ModelTodo>
      <ModelTodo>BT.709 / REC.709</ModelTodo>
      <ModelTodo>DCI P3</ModelTodo>
      <ModelTodo>Display P3</ModelTodo>
      <ModelTodo>ROMM RGB / ProPhoto RGB</ModelTodo>
    </>
  );
}
