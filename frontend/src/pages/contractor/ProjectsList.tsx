import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Plus, Clock, Users, Trash2, Eye, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getMyProjects, deleteProject } from "@/services/projectService";
import CreateProjectModal from "@/components/contractor/CreateProjectModal";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const STATUS_STYLE: Record<string, string> = {
  open:        "bg-warning text-warning-foreground",
  "in-progress": "bg-primary text-primary-foreground",
  completed:   "bg-success text-white",
};

const ProjectsList = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const res = await getMyProjects();
      setProjects(res?.data || []);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this project? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteProject(id);
      toast.success("Project deleted");
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const progress = (p: any) => {
    if (p.totalDays === 0) return 0;
    return Math.round((p.completedDays / p.totalDays) * 100);
  };

  return (
    <>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div variants={item}>
            <h2 className="text-3xl font-black text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
              My Projects
            </h2>
            <p className="text-muted-foreground text-sm font-medium">
              {(projects || []).length} project{(projects || []).length !== 1 ? "s" : ""} total
            </p>
          </motion.div>
          <motion.div variants={item}>
            <Button
              onClick={() => setShowModal(true)}
              className="gradient-primary text-primary-foreground gap-2 px-6 py-6 rounded-2xl shadow-lg border-0 hover:scale-105 transition-all font-bold"
            >
              <Plus size={20} /> New Project
            </Button>
          </motion.div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (projects || []).length === 0 ? (
          <motion.div variants={item} className="glass-card py-20 text-center border-dashed">
            <Building2 size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold text-lg text-muted-foreground">No projects yet.</p>
            <p className="text-sm text-muted-foreground mt-1 mb-6">Create your first construction project to get started.</p>
            <Button onClick={() => setShowModal(true)} className="gradient-primary font-bold gap-2 rounded-xl">
              <Plus size={16} /> New Project
            </Button>
          </motion.div>
        ) : (
          <motion.div variants={item} className="grid lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {(projects || []).map((p) => (
                <motion.div
                  key={p._id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card group hover:border-primary/40 transition-all p-6 relative overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/dashboard/contractor/projects/${p._id}`)}
                >
                  {/* Status badge */}
                  <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl font-black text-[10px] uppercase tracking-widest ${STATUS_STYLE[p.status] || "bg-secondary text-muted-foreground"}`}>
                    {p.status.replace("-", " ")}
                  </div>

                  {/* Title row */}
                  <div className="flex items-center gap-4 mb-4 mt-2">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0 border border-accent/20 group-hover:scale-110 transition-transform">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">{p.title}</h3>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">
                        {p.requiredSkills?.join(", ")}
                      </p>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex gap-4 text-sm font-medium border-t border-border pt-4 flex-wrap">
                    <div className="flex items-center gap-1.5"><Users size={16} className="text-primary" /> {p.assignedWorkers?.length || 0}/{p.totalWorkers || p.workersNeeded} Workers</div>
                    <div className="flex items-center gap-1.5"><Clock size={16} className="text-warning" /> {p.duration}</div>
                    <div className="flex items-center gap-1.5 text-success font-bold">₹{p.wagePerDay}/day</div>
                  </div>

                  {/* Progress */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-primary">{progress(p)}%</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${progress(p)}%` }} />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 flex gap-2" onClick={e => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 rounded-xl font-bold gap-2 text-xs border-primary/20 text-primary hover:bg-primary/10"
                      onClick={() => navigate(`/dashboard/contractor/projects/${p._id}`)}
                    >
                      <Eye size={14} /> View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl font-bold gap-2 text-xs border-destructive/20 text-destructive hover:bg-destructive/10"
                      disabled={deletingId === p._id}
                      onClick={(e) => handleDelete(e, p._id)}
                    >
                      {deletingId === p._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>

      {/* Create Project Modal */}
      <CreateProjectModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={() => { fetchProjects(); setShowModal(false); }}
      />
    </>
  );
};

export default ProjectsList;
