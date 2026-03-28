import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import JobCard from "@/components/shared/JobCard";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMyJobs } from "@/services/jobService";
import { useState, useEffect } from "react";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const MyJobs = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getMyJobs();
        setJobs(data.data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

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
        {jobs.length === 0 ? (
          <div className="col-span-full text-center py-20 glass-card">
            <p className="text-muted-foreground font-medium">You haven't posted any jobs yet.</p>
            <Button variant="link" onClick={() => navigate("/dashboard/client/post-job")}>Post your first job</Button>
          </div>
        ) : (
          jobs.map((j) => (
            <div key={j._id} className="relative group" onClick={() => navigate(`/dashboard/client/jobs/${j._id}`)}>
              <JobCard 
                title={j.title} 
                location={j.location} 
                budget={`₹${j.wage}`} 
                duration={j.duration} 
                tags={[j.skillRequired]} 
                postedAgo={new Date(j.createdAt).toLocaleDateString()} 
                postedBy={j.postedBy?.name}
                urgent={j.isUrgent}
                status={j.status}
                paymentStatus={j.paymentStatus}
              />
            </div>
          ))
        )}
      </motion.div>

    </motion.div>
  );
};

export default MyJobs;
