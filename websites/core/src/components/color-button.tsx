import React from "react";

interface ColorButtonProps<T extends { toString: () => string }> {
  model: T;
  onClick: (model: T) => void;
  children: React.ReactNode;
}

export const ColorButton = <T extends { toString: () => string }>({
  model,
  children,
  onClick,
}: ColorButtonProps<T>) => {
  const color = React.useMemo(() => model.toString(), [model]);

  return (
    <button
      onClick={() => onClick(model)}
      className="border-4 rounded-lg bg-black px-4 py-2"
      style={{
        borderColor: color,
      }}
    >
      <div>{children}</div>
    </button>
  );
};
