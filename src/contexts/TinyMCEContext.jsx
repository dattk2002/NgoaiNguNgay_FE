import { createContext, useContext } from "react";
import { TINYMCE_CONFIG } from "../config/tinymce";

const TinyMCEContext = createContext();

export const useTinyMCE = () => {
  const context = useContext(TinyMCEContext);
  if (!context) {
    throw new Error('useTinyMCE must be used within a TinyMCEProvider');
  }
  return context;
};

export const TinyMCEProvider = ({ children }) => {
  return (
    <TinyMCEContext.Provider value={TINYMCE_CONFIG}>
      {children}
    </TinyMCEContext.Provider>
  );
};
