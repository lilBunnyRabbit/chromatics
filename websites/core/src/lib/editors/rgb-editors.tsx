import { ColorSlider, ModelBackground } from "@/components/color-slider";
import { LinearRGB, RGB, RGB255 } from "@lilbunnyrabbit/chromatics";
import { AllEditorProps, EditorProps, ModelEditor, ModelTodo, useModelEditor } from "./model-editor";
import React from "react";
import { Slider } from "@/components/ui/slider";

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
    <ModelEditor className="col-span-3" color={model.toCSS()} title="RGB">
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

export const LinearRGBEditor = ({ rgb, isActive, onRGB }: EditorProps) => {
  const { model, setCloneModel } = useModelEditor<LinearRGB>({
    rgb,
    isActive,
    onRGB,
    from(model) {
      return model.to.RGB();
    },
    to(rgb) {
      return rgb.to.LinearRGB();
    },
  });

  return (
    <ModelEditor color={model.toCSS()} title="LinearRGB">
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
    </ModelEditor>
  );
};

export const NumericRGBEditor = ({ rgb, isActive, onRGB }: EditorProps) => {
  const [internal, setInternal] = React.useState(() => rgb.to.RGB255().toNumeric());

  const setModel: React.Dispatch<React.SetStateAction<number>> = React.useCallback(
    (callback) => {
      const newValue = typeof callback === "function" ? callback(internal) : callback;
      onRGB(RGB255.fromNumeric(newValue).to.RGB());
      setInternal(newValue);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onRGB, internal]
  );

  React.useEffect(() => {
    if (!isActive) {
      setInternal(rgb.to.RGB255().toNumeric());
      // console.log(`SET ${newValue.constructor.name}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rgb, isActive]);

  return (
    <ModelEditor className="col-span-3" color={rgb.toCSS()} title="Numeric RGB">
      <div className="bg-black px-2 py-1 rounded-lg font-mono text-sm text-center min-w-[66.42px]">Value</div>
      <Slider min={0} max={256 * 256 * 256 - 1} value={[internal]} onValueChange={(value) => setModel(value[0])} />
      <div className="bg-black px-2 py-1 rounded-lg font-mono text-sm text-center min-w-[66.42px]">{internal}</div>
    </ModelEditor>
  );
};

export default function RGBEditors({ rgb, active, onRGB }: AllEditorProps) {
  return (
    <>
      <NumericRGBEditor rgb={rgb} isActive={active === "numeric-rgb"} onRGB={(rgb) => onRGB(rgb, "numeric-rgb")} />

      <RGBEditor rgb={rgb} isActive={active === "rgb"} onRGB={(rgb) => onRGB(rgb, "rgb")} />

      <RGB255Editor rgb={rgb} isActive={active === "rgb255"} onRGB={(rgb) => onRGB(rgb, "rgb255")} />

      <LinearRGBEditor rgb={rgb} isActive={active === "linear-rgb"} onRGB={(rgb) => onRGB(rgb, "linear-rgb")} />

      <ModelTodo>sRGB</ModelTodo>
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
