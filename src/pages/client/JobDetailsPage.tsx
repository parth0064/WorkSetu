import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, TrendingUp, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const JobDetailsPage = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();

  const applicants = [
    { name: "Suresh Raina", skill: t("mason"), rating: 4.8, jobs: 156, badges: [{ label: t("topRated"), variant: "topRated" as const }, { label: t("verified"), variant: "verified" as const }], available: true, avatar: "👷" },
    { name: "Pawan Kalyan", skill: t("tileWorker"), rating: 4.6, jobs: 92, badges: [{ label: t("reliable"), variant: "reliable" as const }], available: true, avatar: "🧑‍🔧" },
    { name: "Amitabh B.", skill: t("plumber"), rating: 4.9, jobs: 210, badges: [{ label: t("topRated"), variant: "topRated" as const }], available: false, avatar: "🔧" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl space-y-8">
      <motion.div variants={item} className="flex flex-col gap-4">
        <Button variant="ghost" className="w-fit text-sm font-bold gap-2 -ml-3 text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back to My Jobs
        </Button>
      </motion.div>

      <motion.div variants={item} className="glass-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-8">
        <div>
          <h2 className="text-3xl font-black text-foreground mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Job Details (ID: {id})
          </h2>
          <div className="flex gap-4 text-sm font-medium text-muted-foreground">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">Kitchen Renovation</span>
            <span className="flex items-center">Bengaluru</span>
            <span className="flex items-center">₹28,500</span>
          </div>
        </div>
        <div className="bg-success text-success-foreground px-4 py-2 font-black uppercase tracking-widest text-xs rounded-xl shadow-md">
          Open
        </div>
      </motion.div>

      <motion.div variants={item} className="space-y-6">
        <h3 className="text-2xl font-black text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{t("applicants")}</h3>
        <div className="grid gap-4">
          {applicants.map((a) => (
            <div key={a.name} className="glass-card flex flex-col sm:flex-row items-center gap-6 p-5 transition-all hover:border-primary/20">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-3xl shadow-sm shrink-0">
                {a.avatar}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-1 gap-2">
                  <h4 className="font-bold text-lg">{a.name}</h4>
                  <span className="text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                    <Check size={12} /> {t("verified")}
                  </span>
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-2">{a.skill}</p>
                <div className="flex items-center justify-center sm:justify-start gap-4">
                  <div className="flex items-center gap-1 text-warning">
                    <TrendingUp size={14} className="fill-current" />
                    <span className="text-xs font-bold">4.9 {t("rating")}</span>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{a.jobs} {t("jobsCompletedLabel")}</span>
                </div>
              </div>
              <Button 
                onClick={() => toast.success(`${t("hireSuccess")}: ${a.name}`)}
                className="gradient-primary border-0 rounded-xl px-6 py-6 font-bold shadow-md hover:scale-105 transition-all w-full sm:w-auto mt-4 sm:mt-0"
              >
                {t("hireCandidate")}
              </Button>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default JobDetailsPage;
