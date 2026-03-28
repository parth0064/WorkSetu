import { motion } from "framer-motion";
import RatingStars from "@/components/shared/RatingStars";
import BadgeChip from "@/components/shared/BadgeChip";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, Star, TrendingUp, CheckCircle2, Edit2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const WorkerHome = () => {
  const { t } = useLanguage();
  const { user, loading } = useAuth();

  if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!user) return <div>{t("pleaseLogin")}</div>;

  const stats = [
    { icon: Briefcase, value: user.completedJobs || "12", label: t("jobsCompletedLabel"), color: "bg-primary/10 text-primary" },
    { icon: Star, value: user.averageRating?.toFixed(1) || "4.8", label: t("rating"), color: "bg-warning/10 text-warning" },
    { icon: TrendingUp, value: "₹9,500", label: "Monthly Earnings", color: "bg-success/10 text-success" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-3xl font-black mb-6" style={{ fontFamily: "var(--font-heading)" }}>{t("dashboard")}</h1>
      </motion.div>

      <div className="grid lg:grid-cols-[1fr_auto] gap-6">
        <motion.div variants={item} className="glass-card flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl shadow-lg border border-white/20 overflow-hidden">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
              ) : "👷"}
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success border-2 border-card" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{user.name}</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-8 h-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => toast.success(t("profileUpdated"))}
              >
                <Edit2 size={14} />
              </Button>
              <div className="w-full" />
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-success/10 text-success flex items-center gap-1"><CheckCircle2 size={12} /> {t("available")}</span>
            </div>
            <p className="text-muted-foreground mb-3 text-sm font-medium">{user.skills?.join(", ") || t("noSkillsListed")}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <RatingStars rating={user.averageRating || 0} />
              <span className="text-xs text-muted-foreground">({user.completedJobs || 0} {t("jobs")})</span>
              <div className="flex gap-1.5">{user.badges?.map((b) => <BadgeChip key={b} label={b} variant="topRated" />)}</div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="glass-card text-center min-w-[100px]">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-2`}><s.icon size={18} /></div>
              <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WorkerHome;
