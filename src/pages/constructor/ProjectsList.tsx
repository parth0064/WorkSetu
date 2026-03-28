import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Building2, Plus, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const ProjectsList = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const projects = [
    { id: 1, title: "Phase 2 - Commercial Hub", location: "Bengaluru", workers: 12, duration: "6 Months", status: "Active", progress: 45 },
    { id: 2, title: "Bridge Repair - Sector 4", location: "Mumbai", workers: 8, duration: "3 Months", status: "Active", progress: 80 },
    { id: 3, title: "Residential Complex - Tower B", location: "Pune", workers: 24, duration: "1 Year", status: "Planning", progress: 0 },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div variants={item}>
          <h2 className="text-3xl font-black text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
            Projects
          </h2>
          <p className="text-muted-foreground text-sm font-medium">Manage all your active construction projects.</p>
        </motion.div>
        
        <motion.div variants={item} className="flex gap-2">
          <Button 
            className="gradient-primary text-primary-foreground gap-2 px-6 py-6 rounded-2xl shadow-lg border-0 hover:scale-105 transition-all font-bold"
          >
            <Plus size={20} /> New Project
          </Button>
        </motion.div>
      </div>

      <motion.div variants={item} className="grid lg:grid-cols-2 gap-6">
        {projects.map((p) => (
          <div key={p.id} onClick={() => navigate(`/dashboard/constructor/projects/${p.id}`)} className="glass-card group cursor-pointer hover:border-primary/40 transition-all p-6 relative overflow-hidden">
            <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl font-black text-[10px] uppercase tracking-widest text-white ${p.status === 'Active' ? 'bg-primary' : 'bg-secondary text-muted-foreground'}`}>
              {p.status}
            </div>
            
            <div className="flex items-center gap-4 mb-4 mt-2">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0 border border-accent/20 group-hover:scale-110 transition-transform">
                <Building2 size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">{p.title}</h3>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{p.location}</p>
              </div>
            </div>

            <div className="flex gap-4 text-sm font-medium border-t border-border pt-4 break-words flex-wrap">
              <div className="flex items-center gap-1.5"><Users size={16} className="text-primary"/> {p.workers} Workers</div>
              <div className="flex items-center gap-1.5"><Clock size={16} className="text-warning"/> {p.duration}</div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
               <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest">
                 <span className="text-muted-foreground">Overall Progress</span>
                 <span className="text-primary">{p.progress}%</span>
               </div>
               <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                 <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${p.progress}%` }} />
               </div>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default ProjectsList;
