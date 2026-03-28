import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import JobCard from "@/components/shared/JobCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2, Search } from "lucide-react";
import api from "@/services/api";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const FindWork = () => {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs');
        setJobs(res.data.data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    j.skillRequired.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black mb-1" style={{ fontFamily: "var(--font-heading)" }}>{t("findWork")}</h1>
          <p className="text-muted-foreground text-sm font-medium">{t("jobOpportunities")}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-secondary/60 rounded-xl px-4 py-2 border border-border/50 transition-colors focus-within:border-primary">
            <Search size={16} className="text-muted-foreground" />
            <input 
              type="text" 
              placeholder={t("search") || "Search jobs..."} 
              className="bg-transparent text-sm outline-none w-40 md:w-60"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <span className="text-xs px-4 py-2 bg-primary text-primary-foreground rounded-full font-bold cursor-pointer shadow-md">
              {t("all")}
            </span>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <motion.div variants={item} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((j) => (
            <JobCard 
              key={j._id} 
              title={j.title} 
              location={j.location} 
              budget={j.wage} 
              duration={j.duration} 
              tags={[j.skillRequired]} 
              postedAgo={new Date(j.createdAt).toLocaleDateString()} 
              urgent={j.status === 'urgent'} 
            />
          ))}
          {filteredJobs.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground glass-card">
              No jobs found matching your search.
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default FindWork;
