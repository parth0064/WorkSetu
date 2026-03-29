import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type DesignTheme = "amber" | "midnight" | "emerald" | "bauhaus" | "editorial";

export const designThemes: Record<DesignTheme, { label: string; description: string }> = {
  amber: { label: "Amber Industrial", description: "Warm & construction-inspired" },
  midnight: { label: "Midnight Corporate", description: "Sleek enterprise SaaS" },
  emerald: { label: "Emerald Fresh", description: "Modern airy startup" },
  bauhaus: { label: "Bauhaus Abstract", description: "Bold geometric, white canvas" },
  editorial: { label: "Editorial Serif", description: "Elegant editorial, clean white" },
};

const VALID_THEMES: DesignTheme[] = ["amber", "midnight", "emerald", "bauhaus", "editorial"];

/** Read the saved design immediately (before React renders) so fonts never flash */
function getInitialDesign(): DesignTheme {
  try {
    const saved = localStorage.getItem("ws-design") as DesignTheme | null;
    if (saved && VALID_THEMES.includes(saved)) return saved;
  } catch {
    // localStorage may be unavailable (private browsing, etc.)
  }
  return "midnight";
}

// Apply the design attribute synchronously so CSS variables (and therefore
// --font-heading / --font-body) are correct on the very first paint.
const initialDesign = getInitialDesign();
document.documentElement.setAttribute("data-design", initialDesign);

const DesignContext = createContext<{
  design: DesignTheme;
  setDesign: (d: DesignTheme) => void;
}>({ design: initialDesign, setDesign: () => {} });

export const useDesign = () => useContext(DesignContext);

export const DesignProvider = ({ children }: { children: ReactNode }) => {
  const [design, setDesign] = useState<DesignTheme>(initialDesign);

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
