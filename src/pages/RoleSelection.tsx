import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { HardHat, Building2, Home, ArrowRight } from "lucide-react";

const roles = [
  { key: "worker", icon: HardHat, emoji: "👷", route: "/dashboard/worker", color: "from-primary to-primary/70" },
  { key: "contractor", icon: Building2, emoji: "🏗️", route: "/dashboard/constructor", color: "from-accent to-accent/70" },
  { key: "homeowner", icon: Home, emoji: "🏠", route: "/dashboard/client", color: "from-success to-success/70" },
];

const RoleSelection = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl relative z-10">
        <div className="text-center mb-10">
          <span className="text-2xl font-bold gradient-text" style={{ fontFamily: "var(--font-heading)" }}>WorkSetu</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-2" style={{ fontFamily: "var(--font-heading)" }}>{t("selectRole")}</h1>
          <p className="text-muted-foreground">{t("chooseHowToUse")}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {roles.map((role, i) => {
            const isSelected = selected === role.key;
            return (
              <motion.button
                key={role.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(role.key)}
                className={`relative p-8 rounded-2xl text-left transition-all duration-300 ${isSelected ? "glass ring-2 ring-primary shadow-xl" : "glass hover:shadow-lg"}`}
              >
                {isSelected && (
                  <motion.div layoutId="role-selected" className="absolute inset-0 rounded-2xl bg-primary/5" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                )}
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center text-3xl mb-5 shadow-lg`}>{role.emoji}</div>
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>{t(role.key)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(`${role.key}Desc`)}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex justify-center mt-10">
          <Button
            size="lg"
            disabled={!selected}
            onClick={() => { const r = roles.find((r) => r.key === selected); if (r) navigate(r.route); }}
            className="gradient-primary text-primary-foreground px-10 py-6 text-lg rounded-xl font-semibold gap-2 hover:opacity-90 transition-all disabled:opacity-40 border-0"
          >
            {t("continue")} <ArrowRight size={20} />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RoleSelection;
