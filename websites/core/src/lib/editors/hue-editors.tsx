import { ColorSlider, ModelBackground } from "@/components/color-slider";
import { HSI, HSL, HSV, HWB } from "@lilbunnyrabbit/chromatics";
import { AllEditorProps, EditorProps, ModelEditor, ModelTodo, useModelEditor } from "./model-editor";

export const HSIEditor = ({ rgb, isActive, onRGB }: EditorProps) => {
  const { model, setCloneModel } = useModelEditor<HSI>({
    rgb,
    isActive,
    onRGB,
    from(model) {
      return model.to.RGB();
    },
    to(rgb) {
      return rgb.to.HSI();
    },
  });

  return (
    <ModelEditor color={model.toCSS()} title="HSI">
      <ColorSlider
        label="Hue"
        model={model}
        min={0}
        max={360}
        step={1}
        value={[model.h]}
        onValueChange={(value) => setCloneModel((clone) => (clone.h = value[0]))}
      >
        <ModelBackground model={model} steps={60} modify={(model, i) => (model.h = i * 6)} />
      </ColorSlider>

      <ColorSlider
        label="Saturation"
        model={model}
        min={0}
        max={1}
        step={0.01}
        value={[model.s]}
        onValueChange={(value) => setCloneModel((clone) => (clone.s = value[0]))}
      >
        <ModelBackground model={model} steps={60} modify={(model, i, steps) => (model.s = i / steps)} />
      </ColorSlider>

      <ColorSlider
        label="Intensity"
        model={model}
        min={0}
        max={1}
        step={0.01}
        value={[model.i]}
        onValueChange={(value) => setCloneModel((clone) => (clone.i = value[0]))}
      >
        <ModelBackground model={model} steps={60} modify={(model, i, steps) => (model.i = i / steps)} />
      </ColorSlider>
    </ModelEditor>
  );
};

export const HSLEditor = ({ rgb, isActive, onRGB }: EditorProps) => {
  const { model, setCloneModel } = useModelEditor<HSL>({
    rgb,
    isActive,
    onRGB,
    from(model) {
      return model.to.RGB();
    },
    to(rgb) {
      return rgb.to.HSL();
    },
  });

  return (
    <ModelEditor color={model.toCSS()} title="HSL">
      <ColorSlider
        label="Hue"
        model={model}
        min={0}
        max={360}
        step={1}
        value={[model.h]}
        onValueChange={(value) => setCloneModel((clone) => (clone.h = value[0]))}
      >
        <ModelBackground model={model} steps={60} modify={(model, i) => (model.h = i * 6)} />
      </ColorSlider>

      <ColorSlider
        label="Saturation"
        model={model}
        min={0}
        max={1}
        step={0.01}
        value={[model.s]}
        onValueChange={(value) => setCloneModel((clone) => (clone.s = value[0]))}
      >
        <ModelBackground model={model} steps={60} modify={(model, i, steps) => (model.s = i / steps)} />
      </ColorSlider>

      <ColorSlider
        label="Lightness"
        model={model}
        min={0}
        max={1}
        step={0.01}
        value={[model.l]}
        onValueChange={(value) => setCloneModel((clone) => (clone.l = value[0]))}
      >
        <ModelBackground model={model} steps={60} modify={(model, i, steps) => (model.l = i / steps)} />
      </ColorSlider>
    </ModelEditor>
  );
};

export const HSVEditor = ({ rgb, isActive, onRGB }: EditorProps) => {
  const { model, setCloneModel } = useModelEditor<HSV>({
    rgb,
    isActive,
    onRGB,
    from(model) {
      return model.to.RGB();
    },
    to(rgb) {
      return rgb.to.HSV();
    },
  });

  return (
    <ModelEditor color={model.toCSS()} title="HSV">
      <ColorSlider
        label="Hue"
        model={model}
        min={0}
        max={360}
        step={1}
        value={[model.h]}
        onValueChange={(value) => setCloneModel((clone) => (clone.h = value[0]))}
      >
        <ModelBackground model={model} steps={60} modify={(model, i) => (model.h = i * 6)} />
      </ColorSlider>

      <ColorSlider
        label="Saturation"
        model={model}
        min={0}
        max={1}
        step={0.01}
        value={[model.s]}
        onValueChange={(value) => setCloneModel((clone) => (clone.s = value[0]))}
      >
        <ModelBackground model={model} steps={60} modify={(model, i, steps) => (model.s = i / steps)} />
      </ColorSlider>

      <ColorSlider
        label="Value"
        model={model}
        min={0}
        max={1}
        step={0.01}
        value={[model.v]}
        onValueChange={(value) => setCloneModel((clone) => (clone.v = value[0]))}
      >
        <ModelBackground model={model} steps={60} modify={(model, i, steps) => (model.v = i / steps)} />
      </ColorSlider>
    </ModelEditor>
  );
};

export const HWBEditor = ({ rgb, isActive, onRGB }: EditorProps) => {
  const { model, setCloneModel } = useModelEditor<HWB>({
    rgb,
    isActive,
    onRGB,
    from(model) {
      return model.to.RGB();
    },
    to(rgb) {
      return rgb.to.HWB();
    },
  });

  return (
    <ModelEditor color={model.toCSS()} title="HWB">
      <ColorSlider
        label="Hue"
        model={model}
        min={0}
        max={360}
        step={1}
        value={[model.h]}
        onValueChange={(value) => setCloneModel((clone) => (clone.h = value[0]))}
      >
        <ModelBackground model={model} steps={60} modify={(model, i) => (model.h = i * 6)} />
      </ColorSlider>

      <ColorSlider
        label="Whiteness"
        model={model}
        min={0}
        max={1}
        step={0.01}
        value={[model.w]}
        onValueChange={(value) => setCloneModel((clone) => (clone.w = value[0]))}
      >
        <ModelBackground model={model} steps={60} modify={(model, i, steps) => (model.w = i / steps)} />
      </ColorSlider>

      <ColorSlider
        label="Blackness"
        model={model}
        min={0}
        max={1}
        step={0.01}
        value={[model.b]}
        onValueChange={(value) => setCloneModel((clone) => (clone.b = value[0]))}
      >
        <ModelBackground model={model} steps={60} modify={(model, i, steps) => (model.b = i / steps)} />
      </ColorSlider>
    </ModelEditor>
  );
};

export default function HueEditors({ rgb, active, onRGB }: AllEditorProps) {
  return (
    <>
      <HSIEditor rgb={rgb} isActive={active === "hsi"} onRGB={(rgb) => onRGB(rgb, "hsi")} />

      <HSLEditor rgb={rgb} isActive={active === "hsl"} onRGB={(rgb) => onRGB(rgb, "hsl")} />

      <HSVEditor rgb={rgb} isActive={active === "hsv"} onRGB={(rgb) => onRGB(rgb, "hsv")} />

      <HWBEditor rgb={rgb} isActive={active === "hwb"} onRGB={(rgb) => onRGB(rgb, "hwb")} />

      <ModelTodo>HSLuv</ModelTodo>
      <ModelTodo>HPLuv</ModelTodo>
      <ModelTodo>HCT</ModelTodo>
    </>
  );
}
