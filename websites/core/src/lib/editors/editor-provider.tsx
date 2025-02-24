import React from "react";

export interface EditorContextProps {
  showTodo: boolean;
  setShowTodo: React.Dispatch<React.SetStateAction<boolean>>;
}

export const EditorContext = React.createContext<EditorContextProps | null>(null);

export interface EditorProviderProps {
  children: React.ReactNode;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({ children }) => {
  const [showTodo, setShowTodo] = React.useState(false);

  return <EditorContext.Provider value={{ showTodo, setShowTodo }} children={children} />;
};

export const useEditor = () => {
  const context = React.useContext(EditorContext);
  if (!context) {
    throw new Error(`${useEditor.name} must be used within ${EditorProvider.name}`);
  }

  return context;
};
