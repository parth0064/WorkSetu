import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import WorkerCard from "@/components/shared/WorkerCard";
import { Search } from "lucide-react";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const FindWorkers = () => {
  const { t } = useLanguage();

  const applicants = [
    { name: "Suresh Raina", skill: t("mason"), rating: 4.8, jobs: 156, badges: [{ label: t("topRated"), variant: "topRated" as const }, { label: t("verified"), variant: "verified" as const }], available: true, avatar: "👷" },
    { name: "Pawan Kalyan", skill: t("tileWorker"), rating: 4.6, jobs: 92, badges: [{ label: t("reliable"), variant: "reliable" as const }], available: true, avatar: "🧑‍🔧" },
    { name: "Amitabh B.", skill: t("plumber"), rating: 4.9, jobs: 210, badges: [{ label: t("topRated"), variant: "topRated" as const }], available: false, avatar: "🔧" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
            {t("findWorkers")}
          </h2>
          <p className="text-muted-foreground text-sm font-medium">Browse verified professionals for your needs.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-secondary/60 rounded-xl px-4 py-3 w-full md:w-80 border border-border/50 focus-within:border-primary transition-colors">
          <Search size={18} className="text-muted-foreground" />
          <input type="text" placeholder={`Search by skill or name...`} className="bg-transparent text-sm font-medium outline-none flex-1 placeholder:text-muted-foreground/50" />
        </div>
      </motion.div>

      <motion.div variants={item} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {applicants.map((a) => (
          <WorkerCard key={a.name} {...a} />
        ))}
        {applicants.map((a) => (
          <WorkerCard key={a.name + "1"} {...a} name={a.name + " II"} />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default FindWorkers;
