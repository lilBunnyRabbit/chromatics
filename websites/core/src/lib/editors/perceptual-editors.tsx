import { AllEditorProps, ModelTodo } from "./model-editor";

export default function PerceptualEditors({ rgb, active, onRGB }: AllEditorProps) {
  return (
    <>
      <ModelTodo>CIE Lab</ModelTodo>
      <ModelTodo>LCHab</ModelTodo>
      <ModelTodo>CIE LCh</ModelTodo>
      <ModelTodo>CIE XYZ</ModelTodo>
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
