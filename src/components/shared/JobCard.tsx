import { motion } from "framer-motion";
import { MapPin, Clock } from "lucide-react";
import BadgeChip from "./BadgeChip";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface JobCardProps {
  title: string;
  location: string;
  budget: string;
  duration: string;
  tags: string[];
  postedAgo: string;
  urgent?: boolean;
}

const JobCard = ({ title, location, budget, duration, tags, postedAgo, urgent }: JobCardProps) => {
  const { t } = useLanguage();

  const handleApply = () => {
    toast.success(`${t("jobApplied")}: ${title}`, {
      description: t("employerNotified"),
    });
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }} 
      onClick={handleApply}
      className="glass-card cursor-pointer group active:scale-[0.98] transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-card-foreground group-hover:text-primary transition-colors leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {title}
        </h3>
        {urgent && (
          <div className="animate-pulse">
            <BadgeChip label={t("urgent")} icon="🔥" variant="topRated" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary/70" /> {location}</span>
        <span className="flex items-center gap-1.5"><Clock size={14} className="text-primary/70" /> {duration}</span>
      </div>
      <div className="flex items-center justify-between mt-auto">
        <p className="text-xl font-black text-primary" style={{ fontFamily: "var(--font-heading)" }}>{budget}</p>
        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60">{postedAgo}</span>
      </div>
      <div className="h-px w-full bg-border/40 my-4" />
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className="text-[10px] font-bold bg-secondary/80 text-secondary-foreground px-2 py-0.5 rounded-md uppercase tracking-tight">{tag}</span>
        ))}
      </div>
    </motion.div>
  );
};

export default JobCard;
