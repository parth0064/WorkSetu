import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const ProjectDetailsPage = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();

  const constructorWorkers = [
    { name: "Vikas Kumar", role: t("mason"), status: "working", progress: 85, avatar: "👷" },
    { name: "Rahul Singh", role: t("tileWorker"), status: "working", progress: 40, avatar: "🧑‍🔧" },
    { name: "Sanjay Dutt", role: t("plumber"), status: "completed", progress: 100, avatar: "🔧" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl space-y-8">
      <motion.div variants={item} className="flex flex-col gap-4">
        <Button variant="ghost" className="w-fit text-sm font-bold gap-2 -ml-3 text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back to Projects
        </Button>
      </motion.div>

      <motion.div variants={item} className="glass-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -mr-16 -mt-16 blur-2xl" />
        <div>
          <h2 className="text-3xl font-black text-foreground mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Phase 2 - Commercial Hub (ID: {id})
          </h2>
          <div className="flex gap-4 text-sm font-medium text-muted-foreground">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">Bengaluru</span>
            <span className="flex items-center">Duration: 6 Months</span>
            <span className="flex items-center">Workers: 12</span>
          </div>
        </div>
        <div className="bg-primary text-primary-foreground px-4 py-2 font-black uppercase tracking-widest text-xs rounded-xl shadow-md z-10 block">
          45% Complete
        </div>
      </motion.div>

      <motion.div variants={item} className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{t("workerManagement")}</h3>
          <Button onClick={() => navigate("/dashboard/constructor/hire")} size="sm" variant="outline" className="text-xs font-bold gap-2 rounded-xl border-primary/20 text-primary hover:bg-primary/10 shadow-sm">
            <Search size={14} /> {t("findNew")}
          </Button>
        </div>
        
        <div className="grid gap-4">
          {constructorWorkers.map((w) => (
            <div key={w.name} className="glass-card flex flex-col sm:flex-row items-center gap-6 p-5 hover:border-primary/20 transition-all border-border/50">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-2xl shadow-lg border border-border/50 shrink-0 group-hover:bg-primary/5 transition-colors">
                {w.avatar}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h4 className="font-bold text-lg mb-0.5">{w.name}</h4>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{w.role}</p>
              </div>
              <div className="w-full sm:w-48 space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span>{t("progress")}</span>
                  <span className="text-primary">{w.progress}%</span>
                </div>
                <Progress value={w.progress} className="h-2 bg-secondary" />
              </div>
              <div className="flex items-center justify-end w-full sm:w-24 shrink-0">
                <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-inner ${
                  w.status === "working" ? "bg-primary/10 text-primary border border-primary/20" : "bg-success/10 text-success border border-success/20"
                }`}>
                  {w.status === "working" ? t("working") : t("completed")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProjectDetailsPage;
