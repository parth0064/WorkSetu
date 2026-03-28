import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, Users, CheckCircle2, TrendingUp, Building2, HardHat, Loader2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import api from "@/services/api";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const ClientHome = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        const res = await api.get('/jobs/my');
        setJobs(res.data.data);
      } catch (err) {
        console.error("Error fetching my jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyJobs();
  }, []);

  const activeJobs = jobs.filter(j => j.status === 'open' || j.status === 'in-progress').length;
  const completedJobs = jobs.filter(j => j.status === 'completed').length;
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicants?.length || 0), 0);

  const statsData = [
    { icon: Briefcase, label: t("activeJobs"), value: activeJobs.toString(), color: "bg-primary/10 text-primary" },
    { icon: Users, label: t("totalApplicants"), value: totalApplicants.toString(), color: "bg-accent/10 text-accent" },
    { icon: CheckCircle2, label: t("completed"), value: completedJobs.toString(), color: "bg-success/10 text-success" },
    { icon: TrendingUp, label: t("satisfactionRate"), value: "100%", color: "bg-warning/10 text-warning" },
  ];

  if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
            Hey, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-muted-foreground text-sm font-medium">
            Manage your home improvement projects
          </p>
        </div>
        <Button onClick={() => navigate("/dashboard/client/post-job")} className="gradient-primary rounded-xl font-bold gap-2 shadow-lg">
          <Plus size={18} /> Post a New Job
        </Button>
      </div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((s) => (
          <div key={s.label} className="glass-card group hover:border-primary/30 transition-all cursor-default overflow-hidden relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:w-20 group-hover:h-20" />
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                <s.icon size={22} />
              </div>
            </div>
            <p className="text-3xl font-black text-foreground leading-none mb-1" style={{ fontFamily: "var(--font-heading)" }}>{s.value}</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={item} className="glass-card bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10 overflow-hidden relative p-8">
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-6">Your Recent Posts</h4>
        
        {jobs.length > 0 ? (
          <ul className="space-y-6 relative z-10">
            {jobs.slice(0, 3).map((job) => (
              <li key={job._id} className="flex gap-4 items-center justify-between">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shrink-0 shadow-sm">
                    {job.status === 'completed' ? <CheckCircle2 size={18} className="text-success" /> : <Building2 size={18} className="text-primary" />}
                  </div>
                  <div>
                    <h5 className="font-bold text-sm leading-tight mb-1">{job.title}</h5>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      {job.status} • {job.applicants?.length || 0} Applicants
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/client/jobs/${job._id}`)} className="text-xs font-bold hover:text-primary">
                  View Details
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground text-sm">No jobs posted yet.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ClientHome;
