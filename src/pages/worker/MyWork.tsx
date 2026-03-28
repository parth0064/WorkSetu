import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle2, Clock, Star } from "lucide-react";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const MyWork = () => {
  const { t } = useLanguage();

  const workTracker = [
    { day: 1, status: "completed", date: "24 Mar" },
    { day: 2, status: "completed", date: "25 Mar" },
    { day: 3, status: "inProgress", date: "26 Mar" },
    { day: 4, status: "pending", date: "27 Mar" },
  ];

  const workHistory = [
    { titleKey: "villaRenovation", ratingVal: 4.9, daysAgo: "5", emoji: "🏠" },
    { titleKey: "officeTiling", ratingVal: 5.0, daysAgo: "12", emoji: "🏢" },
    { titleKey: "bathroomRemodel", ratingVal: 4.8, daysAgo: "20", emoji: "🚿" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={item}>
        <h1 className="text-3xl font-black mb-1" style={{ fontFamily: "var(--font-heading)" }}>{t("myWork")}</h1>
        <p className="text-muted-foreground text-sm font-medium">Manage your active jobs and view past work.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Active Work / Work Tracker */}
        <motion.div variants={item} className="glass-card shadow-sm border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Active Project</h3>
              <p className="text-xs text-muted-foreground mt-1 font-medium select-none uppercase tracking-widest">Office Tiling - Phase 1</p>
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
              75% {t("progressShort")}
            </span>
          </div>

          <div className="flex justify-between items-start gap-2 relative mt-8">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-border -z-0 mx-4" />
            {workTracker.map((w) => (
              <div key={w.day} className="flex flex-col items-center gap-2 relative z-10 bg-card/80 p-1 rounded-xl">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                  w.status === "completed" ? "bg-success border-success text-success-foreground shadow-sm" :
                  w.status === "inProgress" ? "bg-primary border-primary text-primary-foreground animate-pulse shadow-md" :
                  "bg-secondary border-border text-muted-foreground"
                }`}>
                  {w.status === "completed" ? <CheckCircle2 size={14} /> : w.day}
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-tight">{t("day")} {w.day}</p>
                  <p className="text-[9px] text-muted-foreground">{w.date}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-border flex flex-col gap-3">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-muted-foreground">Duration</span>
              <span>4 Days</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span className="text-muted-foreground">Status</span>
              <span className="text-primary font-bold">In Progress</span>
            </div>
          </div>
        </motion.div>

        {/* Completed Work History */}
        <motion.div variants={item} className="space-y-4 shadow-none">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{t("workHistory")}</h3>
            <span className="text-xs px-3 py-1 bg-secondary text-muted-foreground rounded-full font-bold">Past 30 Days</span>
          </div>
          
          <div className="grid gap-4">
            {workHistory.map((w) => (
              <div key={w.titleKey} className="glass-card p-4 flex items-center gap-4 group cursor-pointer hover:border-primary/30 transition-all shadow-sm">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center text-2xl shrink-0 border border-border/50 group-hover:scale-105 transition-transform">
                  {w.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-base group-hover:text-primary transition-colors truncate mb-1">
                    {t(w.titleKey)}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5 opacity-80">
                      <Clock size={12} className="text-primary" /> {w.daysAgo} {t("days")}
                    </span>
                    <span className="text-border text-[10px]">|</span>
                    <div className="flex items-center gap-1.5 text-warning bg-warning/10 px-2 py-0.5 rounded-md">
                      <Star size={12} className="fill-warning" /> 
                      <span className="font-bold text-[10px]">{w.ratingVal.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-success bg-success/10 px-2 py-1 rounded-md shadow-inner">
                    {t("completed")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MyWork;
