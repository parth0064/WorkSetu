import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Users, UserCheck, Loader2, Building2, Clock,
  Wallet, CheckCircle2, UserPlus, Briefcase
} from "lucide-react";
import { toast } from "sonner";
import { getProjectById, getProjectApplicants, assignWorker } from "@/services/projectService";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const STATUS_STYLE: Record<string, string> = {
  open: "bg-warning/20 text-warning border-warning/30",
  "in-progress": "bg-primary/20 text-primary border-primary/30",
  completed: "bg-success/20 text-success border-success/30",
};

const ProjectDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"workers" | "applicants">("workers");
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const fetchAll = async () => {
    if (!id) return;
    try {
      const [projRes, appRes] = await Promise.all([
        getProjectById(id),
        getProjectApplicants(id).catch(() => ({ data: [] }))
      ]);
      setProject(projRes.data);
      setApplicants(appRes.data || []);
    } catch {
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const handleAssign = async (workerId: string, workerName: string, applicationId?: string) => {
    if (!id) return;
    setAssigningId(workerId);
    try {
      await assignWorker(id, workerId);
      toast.success(`✅ ${workerName} assigned to project!`);
      fetchAll(); // Refresh
    } catch (err: any) {
      toast.error(err?.message || "Assignment failed");
    } finally {
      setAssigningId(null);
    }
  };

  const progress = project
    ? project.totalDays > 0 ? Math.round((project.completedDays / project.totalDays) * 100) : 0
    : 0;

  if (loading) return (
    <div className="h-64 flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  if (!project) return (
    <div className="text-center py-20 text-muted-foreground">
      <Building2 size={48} className="mx-auto mb-4 opacity-20" />
      <p className="font-bold">Project not found.</p>
      <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
    </div>
  );

  const assignedIds = project.assignedWorkers?.map((w: any) => w._id?.toString()) || [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl space-y-8">
      {/* Back */}
      <motion.div variants={item}>
        <Button variant="ghost" className="w-fit text-sm font-bold gap-2 -ml-3 text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back to Projects
        </Button>
      </motion.div>

      {/* Project Header Card */}
      <motion.div variants={item} className="glass-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-bl-full -mr-20 -mt-20 blur-3xl" />
        <div className="z-10 flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-black text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
              {project.title}
            </h2>
            <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${STATUS_STYLE[project.status] || ""}`}>
              {project.status.replace("-", " ")}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mb-4 max-w-xl">{project.description}</p>
          <div className="flex flex-wrap gap-3 text-sm font-medium">
            <span className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
              <Clock size={14} /> {project.duration}
            </span>
            <span className="flex items-center gap-1.5 bg-success/10 text-success px-3 py-1 rounded-full font-bold">
              <Wallet size={14} /> ₹{project.wagePerDay}/day
            </span>
            <span className="flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1 rounded-full font-bold">
              <Users size={14} /> {project.assignedWorkers?.length || 0}/{project.totalWorkers || project.workersNeeded} Workers
            </span>
          </div>
        </div>
        <div className="z-10 shrink-0 bg-primary/10 border border-primary/20 rounded-2xl px-6 py-4 text-center">
          <p className="text-3xl font-black text-primary">{progress}%</p>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Complete</p>
        </div>
      </motion.div>

      {/* Progress bar */}
      <motion.div variants={item} className="glass-card p-5">
        <div className="flex justify-between text-xs font-bold mb-3 uppercase tracking-widest">
          <span className="text-muted-foreground">Overall Progress</span>
          <span className="text-primary">{project.completedDays} / {project.totalDays} days</span>
        </div>
        <Progress value={progress} className="h-3 bg-secondary" />
      </motion.div>

      {/* Skills */}
      <motion.div variants={item} className="flex flex-wrap gap-2">
        {project.requiredSkills?.map((s: string) => (
          <span key={s} className="px-3 py-1 bg-secondary rounded-xl text-xs font-bold text-muted-foreground border border-border">
            {s}
          </span>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item} className="space-y-4">
        <div className="flex gap-1 bg-secondary/30 p-1 rounded-xl w-fit">
          <button
            onClick={() => setTab("workers")}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${tab === "workers" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
          >
            <UserCheck size={16} /> Assigned Workers ({project.assignedWorkers?.length || 0})
          </button>
          <button
            onClick={() => setTab("applicants")}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 relative ${tab === "applicants" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Briefcase size={16} /> Applicants ({applicants.filter(a => a.status === 'pending').length})
            {applicants.filter(a => a.status === 'pending').length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white text-[9px] rounded-full flex items-center justify-center animate-pulse">
                {applicants.filter(a => a.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {/* Assigned Workers */}
        {tab === "workers" && (
          <div className="space-y-3">
            {project.assignedWorkers?.length === 0 ? (
              <div className="glass-card p-10 text-center border-dashed">
                <Users size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-muted-foreground font-medium">No workers assigned yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Check the Applicants tab or go to Hire Workers.</p>
                <Button
                  onClick={() => navigate("/dashboard/constructor/hire")}
                  size="sm"
                  className="mt-4 rounded-xl font-bold gap-2"
                >
                  <UserPlus size={14} /> Find Workers
                </Button>
              </div>
            ) : (
              project.assignedWorkers.map((w: any) => (
                <div key={w._id} className="glass-card flex items-center gap-4 p-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
                    {w.profileImage ? <img src={w.profileImage} alt={w.name} className="w-full h-full object-cover" /> : w.name?.[0] || "W"}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold">{w.name}</h4>
                    <p className="text-xs text-muted-foreground">{w.skills?.join(", ") || "General Worker"}</p>
                  </div>
                  <Badge className="bg-success/10 text-success border-success/20 border uppercase text-[9px] font-black">
                    <CheckCircle2 size={10} className="mr-1" /> Assigned
                  </Badge>
                </div>
              ))
            )}
          </div>
        )}

        {/* Applicants */}
        {tab === "applicants" && (
          <div className="space-y-3">
            {applicants.length === 0 ? (
              <div className="glass-card p-10 text-center border-dashed">
                <Briefcase size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-muted-foreground font-medium">No applications yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Make the project public to receive applications.</p>
              </div>
            ) : (
              applicants.map((app: any) => {
                const w = app.workerId;
                const isAssigned = assignedIds.includes(w?._id?.toString());
                const isPending = app.status === 'pending';
                return (
                  <div key={app._id} className="glass-card flex items-center gap-4 p-5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
                      {w?.profileImage ? <img src={w.profileImage} alt={w.name} className="w-full h-full object-cover" /> : (w?.name?.[0] || "W")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold">{w?.name || "Unknown"}</h4>
                      <p className="text-xs text-muted-foreground">{w?.skills?.join(", ") || "General"} • {w?.completedJobs || 0} jobs</p>
                      {app.message && <p className="text-xs text-primary mt-1 italic">"{app.message}"</p>}
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      {isAssigned ? (
                        <Badge className="bg-success/10 text-success border-success/20 border uppercase text-[9px] font-black">
                          <CheckCircle2 size={10} className="mr-1" /> Assigned
                        </Badge>
                      ) : isPending ? (
                        <Button
                          size="sm"
                          className="rounded-xl font-bold gap-1.5 text-xs"
                          disabled={assigningId === w?._id}
                          onClick={() => handleAssign(w._id, w.name)}
                        >
                          {assigningId === w?._id ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />}
                          Assign
                        </Button>
                      ) : (
                        <Badge variant="secondary" className="uppercase text-[9px] font-black">{app.status}</Badge>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ProjectDetailsPage;
