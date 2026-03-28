import { motion, AnimatePresence } from "framer-motion";
import { Palette, X, Check } from "lucide-react";
import { useState } from "react";
import { useDesign, DesignTheme, designThemes } from "@/contexts/DesignContext";
import { useLanguage } from "@/contexts/LanguageContext";

const themeColors: Record<DesignTheme, { from: string; to: string }> = {
  amber: { from: "#f97316", to: "#0ea5e9" },
  midnight: { from: "#6366f1", to: "#a855f7" },
  emerald: { from: "#10b981", to: "#ec4899" },
  bauhaus: { from: "#dc2626", to: "#2563eb" },
  editorial: { from: "#c2410c", to: "#0d9488" },
};

const DesignSwitcher = () => {
  const [open, setOpen] = useState(false);
  const { design, setDesign } = useDesign();
  const { t } = useLanguage();

  return (
    <>
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${themeColors[design].from}, ${themeColors[design].to})` }}
      >
        {open ? <X size={22} className="text-primary-foreground" /> : <Palette size={22} className="text-primary-foreground" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-[100] w-72 glass-card"
          >
            <h3 className="font-semibold text-sm mb-1" style={{ fontFamily: "var(--font-heading)" }}>
              {t("switchDesign")}
            </h3>
            <p className="text-xs text-muted-foreground mb-4">{t("differentDesigns")}</p>
            <div className="space-y-2">
              {(Object.entries(designThemes) as [DesignTheme, typeof designThemes.amber][]).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => setDesign(key)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                    design === key ? "ring-2 ring-primary bg-primary/5" : "hover:bg-secondary"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ background: `linear-gradient(135deg, ${themeColors[key].from}, ${themeColors[key].to})` }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{theme.label}</p>
                    <p className="text-xs text-muted-foreground">{theme.description}</p>
                  </div>
                  {design === key && <Check size={18} className="text-primary flex-shrink-0" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DesignSwitcher;
