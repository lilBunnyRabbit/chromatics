import { ColorSlider, ModelBackground } from "@/components/color-slider";
import { CMY, CMYK } from "@lilbunnyrabbit/chromatics";
import { AllEditorProps, EditorProps, ModelEditor, ModelTodo, useModelEditor } from "./model-editor";

export const CMYEditor = ({ rgb, isActive, onRGB }: EditorProps) => {
  const { model, setCloneModel } = useModelEditor<CMY>({
    rgb,
    isActive,
    onRGB,
    from(model) {
      return model.to.RGB();
    },
    to(rgb) {
      return rgb.to.CMY();
    },
  });

  return (
    <ModelEditor color={model.toCSS()} title="CMY">
      <ColorSlider
        label="Cyan"
        model={model}
        min={0}
        max={1}
        step={0.01}
        value={[model.c]}
        onValueChange={(value) => setCloneModel((clone) => (clone.c = value[0]))}
      >
        <ModelBackground model={model} steps={60} modify={(model, i, steps) => (model.c = i / steps)} />
      </ColorSlider>

      <ColorSlider
        label="Magenta"
        model={model}
        min={0}
        max={1}
        step={0.01}
        value={[model.m]}
        onValueChange={(value) => setCloneModel((clone) => (clone.m = value[0]))}
      >
        <ModelBackground model={model} steps={60} modify={(model, i, steps) => (model.m = i / steps)} />
      </ColorSlider>

      <ColorSlider
        label="Yellow"
        model={model}
        min={0}
        max={1}
        step={0.01}
        value={[model.y]}
        onValueChange={(value) => setCloneModel((clone) => (clone.y = value[0]))}
      >
        <ModelBackground model={model} steps={60} modify={(model, i, steps) => (model.y = i / steps)} />
      </ColorSlider>
    </ModelEditor>
  );
};

export const CMYKEditor = ({ rgb, isActive, onRGB }: EditorProps) => {
  const { model, setCloneModel } = useModelEditor<CMYK>({
    rgb,
    isActive,
    onRGB,
    from(model) {
      return model.to.RGB();
    },
    to(rgb) {
      return rgb.to.CMYK();
    },
  });

  return (
    <ModelEditor color={model.toCSS()} title="CMYK">
      <ColorSlider
        label="Cyan"
        model={model}
        min={0}
        max={1}
        step={0.01}
        value={[model.c]}
        onValueChange={(value) => setCloneModel((clone) => (clone.c = value[0]))}
      >
        <ModelBackground model={model} steps={60} modify={(model, i, steps) => (model.c = i / steps)} />
      </ColorSlider>

      <ColorSlider
        label="Magenta"
        model={model}
        min={0}
        max={1}
        step={0.01}
        value={[model.m]}
        onValueChange={(value) => setCloneModel((clone) => (clone.m = value[0]))}
      >
        <ModelBackground model={model} steps={60} modify={(model, i, steps) => (model.m = i / steps)} />
      </ColorSlider>

      <ColorSlider
        label="Yellow"
        model={model}
        min={0}
        max={1}
        step={0.01}
        value={[model.y]}
        onValueChange={(value) => setCloneModel((clone) => (clone.y = value[0]))}
      >
        <ModelBackground model={model} steps={60} modify={(model, i, steps) => (model.y = i / steps)} />
      </ColorSlider>

      <ColorSlider
        label="Key"
        model={model}
        min={0}
        max={1}
        step={0.01}
        value={[model.k]}
        onValueChange={(value) => setCloneModel((clone) => (clone.k = value[0]))}
      >
        <ModelBackground model={model} steps={60} modify={(model, i, steps) => (model.k = i / steps)} />
      </ColorSlider>
    </ModelEditor>
  );
};
export default function PrintEditors({ rgb, active, onRGB }: AllEditorProps) {
  return (
    <>
      <CMYEditor rgb={rgb} isActive={active === "cmy"} onRGB={(rgb) => onRGB(rgb, "cmy")} />

      <CMYKEditor rgb={rgb} isActive={active === "cmyk"} onRGB={(rgb) => onRGB(rgb, "cmyk")} />

      <ModelTodo>HunterLAB</ModelTodo>
      <ModelTodo>ICC-based Color Profiles</ModelTodo>
      <ModelTodo>Munsell Color System</ModelTodo>
      <ModelTodo>NCS</ModelTodo>
      <ModelTodo>RAL Color Space</ModelTodo>
    </>
  );
}
