import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import RatingStars from "./RatingStars";
import BadgeChip from "./BadgeChip";

interface WorkerCardProps {
  name: string;
  skill: string;
  rating: number;
  jobs: number;
  badges: { label: string; variant: "topRated" | "reliable" | "verified" }[];
  available: boolean;
  avatar: string;
}

const WorkerCard = ({ name, skill, rating, jobs, badges, available, avatar }: WorkerCardProps) => {
  const { t } = useLanguage();
  return (
    <motion.div whileHover={{ y: -4 }} className="glass-card cursor-pointer group flex flex-col items-center text-center p-6 bg-white/5 border border-white/10 hover:border-primary/30 transition-all duration-300">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-4xl shadow-inner border border-white/10 group-hover:scale-105 transition-transform duration-500">
          {avatar}
        </div>
        {available && (
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-success border-2 border-card" />
          </span>
        )}
      </div>
      
      <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors" style={{ fontFamily: "var(--font-heading)" }}>{name}</h3>
      <p className="text-sm font-medium text-muted-foreground mb-3">{skill}</p>
      
      <div className="flex flex-col items-center gap-2 w-full mb-4">
        <RatingStars rating={rating} size={14} />
        <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded bg-primary/10 uppercase tracking-tighter">
          {jobs} {t("jobsCompletedLabel")}
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-1.5 mb-5 min-h-[24px]">
        {badges.map((b) => (
          <BadgeChip key={b.label} label={b.label} variant={b.variant} />
        ))}
      </div>

      <div className="w-full h-px bg-white/5 my-2" />

      <div className="w-full mt-2">
        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-3 text-left pl-1">{t("viewWork")}</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="aspect-video rounded-lg bg-white/5 border border-white/10 overflow-hidden group/thumb cursor-zoom-in">
            <div className="w-full h-full bg-gradient-to-br from-secondary to-accent/10 opacity-40 group-hover/thumb:scale-110 transition-transform duration-500" />
          </div>
          <div className="aspect-video rounded-lg bg-white/5 border border-white/10 overflow-hidden group/thumb cursor-zoom-in">
            <div className="w-full h-full bg-gradient-to-tr from-accent/10 to-primary/10 opacity-40 group-hover/thumb:scale-110 transition-transform duration-500" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WorkerCard;
