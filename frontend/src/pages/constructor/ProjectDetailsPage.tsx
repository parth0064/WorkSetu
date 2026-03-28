import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import api from "@/services/api";

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
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [applicantsError, setApplicantsError] = useState<string | null>(null);

  const fetchAll = async () => {
    if (!id) return;
    try {
      const projRes = await getProjectById(id);
      setProject(projRes.data);
      
      try {
        const appRes = await getProjectApplicants(id);
        setApplicants(appRes.data || []);
        setApplicantsError(null);
      } catch (appErr: any) {
        const msg = appErr?.response?.data?.message || appErr?.message || 'Unknown error';
        setApplicantsError(msg);
        setApplicants([]);
        console.error('Applicants fetch error:', msg);
      }
    } catch {
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const handleAssign = async (workerId: string, workerName: string) => {
    if (!id) return;
    setAssigningId(workerId);
    try {
      await assignWorker(id, workerId);
      toast.success(`✅ ${workerName} assigned to project!`);
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Assignment failed');
    } finally {
      setAssigningId(null);
    }
  };

  const handleCompleteProject = async () => {
    if (!id) return;
    setCompleting(true);
    try {
      await api.post('/projects/complete', { projectId: id });
      toast.success("🏆 Project Completed!", { description: "Remaining wages have been settled." });
      setShowCompleteModal(false);
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Completion failed");
    } finally {
      setCompleting(false);
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
        <div className="z-10 shrink-0">
          {project.status === 'completed' ? (
            <div className="bg-success/10 border border-success/20 rounded-2xl px-6 py-4 text-center">
              <CheckCircle2 size={32} className="text-success mx-auto mb-1" />
              <p className="text-xs font-black text-success uppercase tracking-widest">Fully Paid</p>
            </div>
          ) : (
            <Button
              onClick={() => setShowCompleteModal(true)}
              className="h-auto py-4 px-6 rounded-2xl gradient-primary border-0 shadow-lg hover:scale-105 transition-all flex flex-col items-center gap-1"
            >
              <CheckCircle2 size={24} className="opacity-90" />
              <span className="text-xs uppercase font-black opacity-90 tracking-widest">Project Finish</span>
            </Button>
          )}
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
            {/* Show error state if applicants failed to load */}
            {applicantsError ? (
              <div className="glass-card p-8 text-center border-destructive/30 bg-destructive/5">
                <Briefcase size={36} className="mx-auto mb-3 text-destructive opacity-60" />
                <p className="font-bold text-destructive mb-1">Could not load applicants</p>
                <p className="text-xs text-muted-foreground mb-4">{applicantsError}</p>
                <Button size="sm" variant="outline" onClick={fetchAll} className="rounded-xl font-bold">
                  Try Again
                </Button>
              </div>
            ) : applicants.length === 0 ? (
              <div className="glass-card p-10 text-center border-dashed">
                <Briefcase size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-muted-foreground font-medium">No applications yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Make the project public to receive applications from workers.</p>
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

      {/* Completion Modal */}
      <AnimatePresence>
        {showCompleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card max-w-md w-full p-8 space-y-6 shadow-2xl border-primary/20"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                   <Wallet size={32} />
                </div>
                <h3 className="text-2xl font-black italic">Final Settlement</h3>
                <p className="text-muted-foreground text-sm">
                  Are you sure you want to complete this project? The following wages will be settled from your wallet:
                </p>
              </div>

              <div className="bg-secondary/40 rounded-2xl p-4 space-y-3 font-medium text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining Days:</span>
                  <span className="font-bold">{Math.max(0, project.totalDays - project.completedDays)} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Workers Assigned:</span>
                  <span className="font-bold">{project.assignedWorkers?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily Wage:</span>
                  <span className="font-bold">₹{project.wagePerDay}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between text-lg font-black text-primary">
                  <span>Total Payout:</span>
                  <span>₹{Math.max(0, (project.totalDays - project.completedDays) * project.wagePerDay * (project.assignedWorkers?.length || 0))}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-xl font-bold"
                  onClick={() => setShowCompleteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-12 rounded-xl font-bold gradient-primary"
                  onClick={handleCompleteProject}
                  disabled={completing}
                >
                  {completing ? <Loader2 size={18} className="animate-spin" /> : "Verify & Pay"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProjectDetailsPage;
