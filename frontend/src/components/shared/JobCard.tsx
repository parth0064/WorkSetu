import { motion } from "framer-motion";
import { MapPin, Clock, User } from "lucide-react";
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
  postedBy?: string;
  urgent?: boolean;
  status?: string;
  paymentStatus?: string;
  onClick?: () => void;
}

const JobCard = ({ title, location, budget, duration, tags, postedAgo, postedBy, urgent, status, paymentStatus, onClick }: JobCardProps) => {
  const { t } = useLanguage();

  const handleApply = () => {
    toast.success(`${t("jobApplied")}: ${title}`, {
      description: t("employerNotified"),
    });
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }} 
      onClick={onClick || handleApply}
      className={`glass-card cursor-pointer group active:scale-[0.98] transition-all relative ${status === 'completed' ? 'opacity-75' : ''}`}
    >
      <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
        {status && (
          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
            status === 'completed' ? 'bg-success/20 text-success' : 
            status === 'in-progress' ? 'bg-blue-500/20 text-blue-500' : 
            status === 'booked' ? 'bg-warning/20 text-warning border border-warning/30' : 
            'bg-primary/20 text-primary'
          }`}>
            {status}
          </span>
        )}
        {paymentStatus === 'secured' && (
          <span className="text-[9px] font-black uppercase bg-success text-success-foreground px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Secured
          </span>
        )}
        {paymentStatus === 'released' && (
          <span className="text-[9px] font-black uppercase bg-secondary/30 text-muted-foreground px-2 py-0.5 rounded flex items-center gap-1">
             Released
          </span>
        )}
      </div>
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
      {postedBy && (
        <p className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5 opacity-80 uppercase tracking-widest"><User size={12} className="text-primary" /> {postedBy}</p>
      )}
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
