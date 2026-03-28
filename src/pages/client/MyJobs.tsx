import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import JobCard from "@/components/shared/JobCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const MyJobs = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const myJobs = [
    { id: 1, titleKey: "kitchenRenovation", location: "Bengaluru", budget: "₹28,500", durationKey: "2 " + t("weeks"), tags: [t("tiling"), t("masonry")], postedAgo: "4 " + t("hoursAgo"), urgent: true, status: "in-progress" },
    { id: 2, titleKey: "floorTiling", location: "Nashik", budget: "₹18,000", durationKey: "1 " + t("week"), tags: [t("tiling")], postedAgo: "1 " + t("dayAgo"), urgent: false, status: "open" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div variants={item}>
          <h2 className="text-3xl font-black text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
            {t("myJobListings")}
          </h2>
          <p className="text-muted-foreground text-sm font-medium">Manage all jobs you have posted.</p>
        </motion.div>
        
        <motion.div variants={item} className="flex gap-2">
          <Button 
            onClick={() => navigate("/dashboard/client/post-job")}
            className="gradient-primary text-primary-foreground gap-2 px-6 py-6 rounded-2xl shadow-lg border-0 hover:scale-105 transition-all font-bold"
          >
            <Plus size={20} /> {t("postJob")}
          </Button>
        </motion.div>
      </div>

      <motion.div variants={item} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myJobs.map((j) => (
          <div key={j.id} className="relative group cursor-pointer" onClick={() => navigate(`/dashboard/client/jobs/${j.id}`)}>
            <div className={`absolute top-3 right-3 z-10 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
              j.status === "in-progress" ? "bg-warning/20 text-warning" : "bg-success/20 text-success"
            }`}>
              {j.status === "in-progress" ? "In Progress" : "Open"}
            </div>
            
            <JobCard 
              title={t(j.titleKey)} 
              location={j.location} 
              budget={j.budget} 
              duration={j.durationKey} 
              tags={j.tags} 
              postedAgo={j.postedAgo} 
              urgent={j.urgent} 
            />
          </div>
        ))}
      </motion.div>

    </motion.div>
  );
};

export default MyJobs;
