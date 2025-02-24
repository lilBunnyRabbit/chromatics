import { ColorModel, RGB } from "@lilbunnyrabbit/chromatics";
import React from "react";
import { useEditor } from "./editor-provider";

export interface AllEditorProps {
  rgb: RGB;
  active?: string | null;
  onRGB: (rgb: RGB, active: string) => void;
}

export interface EditorProps {
  rgb: RGB;
  isActive: boolean;
  onRGB: (rgb: RGB) => void;
}

export function useModelEditor<T extends ColorModel>({
  rgb,
  isActive,
  onRGB,
  from,
  to,
}: {
  rgb: RGB;
  isActive: boolean;
  onRGB: (rgb: RGB) => void;
  from: (model: T) => RGB;
  to: (rgb: RGB) => T;
}) {
  const [internal, setInternal] = React.useState(() => to(rgb));

  const setModel: React.Dispatch<React.SetStateAction<T>> = React.useCallback(
    (callback) => {
      const newValue = typeof callback === "function" ? callback(internal) : callback;
      onRGB(from(newValue));
      setInternal(newValue);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onRGB, internal]
  );

  const setCloneModel = React.useCallback(
    (callback: (model: T) => unknown) => {
      setModel((model) => {
        const clone = model.clone();
        callback(clone);
        return clone;
      });
    },
    [setModel]
  );

  React.useEffect(() => {
    if (!isActive) {
      setInternal(to(rgb));
      // console.log(`SET ${newValue.constructor.name}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rgb, isActive]);

  return { model: internal, setModel, setCloneModel } as const;
}

export interface ModelEditorProps {
  color: string;
  title?: React.ReactNode;
  children: React.ReactNode;
}

export const ModelEditor = ({ color, title, children }: ModelEditorProps) => {
  return (
    <div className="min-w-80 rounded-xl overflow-hidden h-fit font-mono shadow-[8px_8px_8px_0px_rgba(0,0,0,0.27)]">
      <div className="bg-black">
        <div className="flex flex-col gap-4 p-2" style={{ backgroundColor: color }}>
          <div className="px-4 py-2 bg-black text-sm rounded-lg flex items-center justify-between">
            {title} {color}
          </div>

          <div className="grid grid-cols-[min-content,1fr,min-content] whitespace-nowrap gap-x-4 gap-y-2 items-center">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ModelTodo = ({ children }: { children: React.ReactNode }) => {
  const editor = useEditor();

  if (!editor.showTodo) return null;

  return (
    <div className="rounded-xl font-mono shadow-[8px_8px_8px_0px_rgba(0,0,0,0.27)] flex items-center justify-center text-white/30 p-4">
      {children}
    </div>
  );
};
