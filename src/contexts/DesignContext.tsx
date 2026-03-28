import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type DesignTheme = "amber" | "midnight" | "emerald" | "bauhaus" | "editorial";

export const designThemes: Record<DesignTheme, { label: string; description: string }> = {
  amber: { label: "Amber Industrial", description: "Warm & construction-inspired" },
  midnight: { label: "Midnight Corporate", description: "Sleek enterprise SaaS" },
  emerald: { label: "Emerald Fresh", description: "Modern airy startup" },
  bauhaus: { label: "Bauhaus Abstract", description: "Bold geometric, white canvas" },
  editorial: { label: "Editorial Serif", description: "Elegant editorial, clean white" },
};

const DesignContext = createContext<{
  design: DesignTheme;
  setDesign: (d: DesignTheme) => void;
}>({ design: "amber", setDesign: () => {} });

export const useDesign = () => useContext(DesignContext);

export const DesignProvider = ({ children }: { children: ReactNode }) => {
  const [design, setDesign] = useState<DesignTheme>("midnight");

  useEffect(() => {
    document.documentElement.setAttribute("data-design", design);
    localStorage.setItem("ws-design", design);
  }, [design]);

  return (
    <DesignContext.Provider value={{ design, setDesign }}>
      {children}
    </DesignContext.Provider>
  );
};
