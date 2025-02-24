import { AllEditorProps, ModelTodo } from "./model-editor";

export default function OtherEditors({ rgb, active, onRGB }: AllEditorProps) {
  return (
    <>
      <ModelTodo>ANSI</ModelTodo>
      <ModelTodo>GL</ModelTodo>
      <ModelTodo>TSL</ModelTodo>
      <ModelTodo>ISO-CIE Color Encodings</ModelTodo>
      <ModelTodo>SCOTDIC</ModelTodo>
      <ModelTodo>Coloroid</ModelTodo>
    </>
  );
}
