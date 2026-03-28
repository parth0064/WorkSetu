import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import WorkerCard from "@/components/shared/WorkerCard";
import { Search, Loader2 } from "lucide-react";
import api from "@/services/api";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const HireWorkersPage = () => {
  const { t } = useLanguage();
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await api.get('/users/workers');
        setWorkers(res.data.data);
      } catch (err) {
        console.error("Error fetching workers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.skills?.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
            {t("hireWorkers")}
          </h2>
          <p className="text-muted-foreground text-sm font-medium">Find skilled talent for your construction teams.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-secondary/60 rounded-xl px-4 py-3 w-full md:w-80 border border-border/50 focus-within:border-primary transition-colors">
          <Search size={18} className="text-muted-foreground" />
          <input 
            type="text" 
            placeholder={`Search by skill or name...`} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-sm font-medium outline-none flex-1 placeholder:text-muted-foreground/50" 
          />
        </div>
      </motion.div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <motion.div variants={item} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkers.map((w) => (
            <WorkerCard 
              key={w._id} 
              name={w.name}
              skill={w.skills?.[0] || "General Worker"}
              rating={w.averageRating || 0}
              jobs={w.completedJobs || 0}
              badges={w.badges?.map((b: string) => ({ label: b, variant: "topRated" })) || []}
              available={true}
              avatar="👷"
            />
          ))}
          {filteredWorkers.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              No workers found matching your search.
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default HireWorkersPage;
