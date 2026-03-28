import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Star, Zap, Award } from "lucide-react";

interface BadgeItem {
  label: string;
  variant: "topRated" | "reliable" | "skilled" | "beginner" | "verified" | string;
}

interface WorkerCardProps {
  name: string;
  skill: string;
  rating: number;
  jobs: number;
  badges: string[];
  available: boolean;
  avatar: string;
  status?: 'available' | 'busy';
  score?: number;
  rank?: string;
  hype?: number;
  experienceLevel?: 'Beginner' | 'Intermediate' | 'Pro';
  portfolioCount?: number;
  onNavigate?: () => void;
}

const badgeStyles: Record<string, string> = {
  topRated:  "bg-yellow-400/15 text-yellow-500 border border-yellow-400/30",
  reliable:  "bg-orange-400/15 text-orange-500 border border-orange-400/30",
  skilled:   "bg-blue-400/15 text-blue-500 border border-blue-400/30",
  beginner:  "bg-green-400/15 text-green-500 border border-green-400/30",
  verified:  "bg-primary/10 text-primary border border-primary/30",
};

const inferVariant = (label: string): string => {
  if (label.includes('Top Rated'))  return 'topRated';
  if (label.includes('Reliable'))   return 'reliable';
  if (label.includes('Skilled'))    return 'skilled';
  if (label.includes('Beginner'))   return 'beginner';
  return 'verified';
};

const EXPERIENCE_BADGE: Record<string, { color: string; emoji: string }> = {
    Beginner:     { color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30', emoji: '🌱' },
    Intermediate: { color: 'bg-blue-500/15 text-blue-600 border-blue-500/30',         emoji: '⚒️' },
    Pro:          { color: 'bg-purple-500/15 text-purple-600 border-purple-500/30',    emoji: '🏆' },
};

const WorkerCard = ({ name, skill, rating, jobs, badges, available, avatar, status, score, rank, hype, experienceLevel, portfolioCount, onNavigate }: WorkerCardProps) => {
  const { t } = useLanguage();
  const isBusy = status === 'busy';
  const expConfig = experienceLevel ? EXPERIENCE_BADGE[experienceLevel] : null;


  const getRankStyle = (r?: string) => {
      if (!r) return 'from-stone-500 to-stone-600 text-white';
      const text = r.toLowerCase();
      if (text.includes('grandmaster')) return 'from-purple-600 to-indigo-600 text-purple-100 border-purple-400';
      if (text.includes('master'))      return 'from-fuchsia-500 to-pink-600 text-pink-50 border-pink-400';
      if (text.includes('diamond'))     return 'from-cyan-400 to-blue-500 text-cyan-50 border-cyan-300';
      if (text.includes('platinum'))    return 'from-emerald-400 to-teal-500 text-teal-50 border-emerald-300';
      if (text.includes('gold'))        return 'from-yellow-400 to-orange-500 text-yellow-50 border-yellow-300';
      if (text.includes('silver'))      return 'from-slate-300 to-slate-400 text-slate-800 border-slate-300';
      if (text.includes('bronze'))      return 'from-amber-600 to-orange-700 text-orange-50 border-orange-500';
      return 'from-stone-500 to-stone-600 text-white';
  };

  return (
    <motion.div whileHover={{ y: -4 }} onClick={onNavigate} className={`glass-card cursor-pointer group flex flex-col items-center text-center p-6 bg-white/5 border border-white/10 hover:border-primary/30 transition-all duration-300 ${isBusy ? 'opacity-80' : ''}`}>
      {/* Avatar */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-4xl shadow-inner border border-white/10 group-hover:scale-105 transition-transform duration-500 overflow-hidden">
          {avatar && avatar.startsWith('http') ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            avatar || "👷"
          )}
        </div>
        {isBusy ? (
          <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg ring-2 ring-card uppercase tracking-tighter">
            Busy
          </span>
        ) : available && (
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-success border-2 border-card" />
          </span>
        )}
      </div>
      
      <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors" style={{ fontFamily: "var(--font-heading)" }}>{name}</h3>
      <p className="text-sm font-medium text-muted-foreground mb-3">{skill}</p>
      
      {/* Rating Row */}
      <div className="flex items-center gap-3 mb-3">
        {/* Stars */}
        <div className="flex items-center gap-1 bg-secondary/80 px-2 py-1 rounded-full border border-border/50">
          {[1,2,3,4,5].map(i => (
            <Star key={i} size={10} className={i <= Math.round(rating) ? "text-warning fill-warning" : "text-muted-foreground/20"} />
          ))}
          <span className="text-[10px] font-bold text-muted-foreground ml-1">{rating > 0 ? rating.toFixed(1) : "New"}</span>
        </div>
      </div>

      {/* Gamification Stats */}
      <div className="flex w-full items-center justify-center gap-2 mb-4">
        {/* Rank */}
        {rank && rank !== 'Unranked' && (
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-gradient-to-r shadow-lg ${getRankStyle(rank)}`}>
               {rank}
            </span>
        )}
        
        {/* Score & Hype */}
        {score !== undefined && (
          <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border bg-primary/10 text-primary border-primary/20">
            {score} SCORE
          </span>
        )}

        {hype !== undefined && hype > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg border bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-orange-500/10 shadow-lg">
            <Zap size={10} className="fill-orange-500" /> {hype}
          </span>
        )}
      </div>

      {/* Jobs Completed */}
      <span className="text-[10px] font-bold text-muted-foreground px-2 py-0.5 rounded border border-border/50 uppercase tracking-widest mb-3">
        {jobs} {t("jobsCompletedLabel")}
      </span>

      {/* Experience Level badge */}
      {expConfig && experienceLevel && (
        <span className={`text-[10px] font-black px-3 py-1 rounded-lg border ${expConfig.color} mb-3 flex items-center gap-1`}>
          {expConfig.emoji} {experienceLevel}
          {portfolioCount !== undefined && <span className="opacity-70">({portfolioCount} works)</span>}
        </span>
      )}

      {/* Hype eligible badge */}
      {experienceLevel === 'Beginner' && (
        <span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-600 border border-orange-500/20 flex items-center gap-1 mb-3">
          <Zap size={9} className="fill-orange-500" /> Hype Eligible
        </span>
      )}

      <div className="w-full h-px bg-white/5 my-2" />

      {/* Portfolio preview */}
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
