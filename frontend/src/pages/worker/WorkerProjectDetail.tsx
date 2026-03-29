import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Clock, Wallet, Users, CheckCircle2, Loader2,
  Calendar, Building2, AlertCircle, CalendarCheck
} from "lucide-react";
import { toast } from "sonner";
import { getProjectById, markDayComplete, getProjectWorkHistory } from "@/services/projectService";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const WorkerProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth() as any;
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [todayMarked, setTodayMarked] = useState(false);
  const [workLogs, setWorkLogs] = useState<any[]>([]);

  const today = new Date().toISOString().split("T")[0];

  const fetchData = async () => {
    if (!id) return;
    try {
      const [projRes, historyRes] = await Promise.all([
        getProjectById(id),
        getProjectWorkHistory()
      ]);
      setProject(projRes.data);

      // Find today's log for this project
      const myLogs = historyRes.logs?.filter((l: any) => l.projectId?._id === id || l.projectId === id) || [];
      setWorkLogs(myLogs);
      setTodayMarked(myLogs.some((l: any) => l.date === today));
    } catch {
      toast.error("Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleMarkDay = async () => {
    if (!id) return;
    setMarking(true);
    try {
      const res = await markDayComplete(id);
      toast.success(res.message || "Day marked! Wage credited to wallet.", {
        description: `₹${project?.wagePerDay} added to your wallet balance.`,
        duration: 4000,
      });
      setTodayMarked(true);
      fetchData();
      // Refresh user to update wallet balance
      if (refreshUser) refreshUser();
    } catch (err: any) {
      toast.error(err?.message || "Failed to mark day");
    } finally {
      setMarking(false);
    }
  };

  const isAssigned = project?.assignedWorkers?.some(
    (w: any) => w._id === user?._id || w._id === user?.id || w === user?._id || w === user?.id
  );

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

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl space-y-8">
      <motion.div variants={item}>
        <Button variant="ghost" className="w-fit text-sm font-bold gap-2 -ml-3 text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </Button>
      </motion.div>

      {/* Project Header */}
      <motion.div variants={item} className="glass-card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-bl-full -mr-20 -mt-20 blur-3xl" />
        <div className="z-10 relative">
          <h1 className="text-3xl font-black mb-2" style={{ fontFamily: "var(--font-heading)" }}>{project.title}</h1>
          <p className="text-muted-foreground text-sm mb-5">{project.description}</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
              <Clock size={14} /> {project.duration}
            </span>
            <span className="flex items-center gap-1.5 bg-success/10 text-success px-3 py-1 rounded-full font-bold text-base">
              <Wallet size={14} /> ₹{project.wagePerDay}/day
            </span>
            <span className="flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1 rounded-full font-bold">
              <Users size={14} /> {project.assignedWorkers?.length || 0} assigned
            </span>
          </div>
        </div>
      </motion.div>

      {/* Progress */}
      <motion.div variants={item} className="glass-card p-5">
        <div className="flex justify-between text-xs font-bold mb-3 uppercase tracking-widest">
          <span className="text-muted-foreground">Project Progress</span>
          <span className="text-primary">{project.completedDays || 0} / {project.totalDays} days</span>
        </div>
        <Progress value={progress} className="h-3 bg-secondary" />
      </motion.div>

      {/* Mark Day Complete */}
      {isAssigned && (
        <motion.div variants={item} className="glass-card p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <CalendarCheck size={24} />
            </div>
            <div>
              <h3 className="font-black text-lg">Today's Work — {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</h3>
              <p className="text-xs text-muted-foreground font-medium">Mark today as complete to credit ₹{project.wagePerDay} to your wallet.</p>
            </div>
          </div>

          {todayMarked ? (
            <div className="flex items-center gap-3 bg-success/10 border border-success/30 rounded-xl px-5 py-4">
              <CheckCircle2 className="text-success" size={22} />
              <div>
                <p className="font-bold text-success">Day Marked Complete!</p>
                <p className="text-xs text-success/70">₹{project.wagePerDay} has been credited to your wallet today.</p>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleMarkDay}
              disabled={marking}
              className="w-full h-14 gradient-primary font-black text-base rounded-2xl gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
            >
              {marking ? <Loader2 size={22} className="animate-spin" /> : <CalendarCheck size={22} />}
              {marking ? "Marking..." : "✅ Mark Day Complete"}
            </Button>
          )}
        </motion.div>
      )}

      {/* Not assigned warning */}
      {!isAssigned && (
        <motion.div variants={item} className="glass-card p-5 border-warning/20 bg-warning/5 flex items-center gap-3">
          <AlertCircle className="text-warning shrink-0" size={20} />
          <p className="text-sm font-medium text-muted-foreground">
            You are not yet assigned to this project. Once the contractor assigns you, you can mark daily attendance.
          </p>
        </motion.div>
      )}

      {/* Work Log History for this project */}
      {workLogs.length > 0 && (
        <motion.div variants={item} className="space-y-3">
          <h3 className="font-black text-lg flex items-center gap-2">
            <Calendar className="text-primary" size={20} /> My Work Log
          </h3>
          <div className="space-y-2">
            {workLogs.map((log: any) => (
              <div key={log._id} className="glass-card flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-success" size={18} />
                  <div>
                    <p className="font-bold text-sm">{new Date(log.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</p>
                    <p className="text-xs text-muted-foreground capitalize">{log.status}</p>
                  </div>
                </div>
                <span className="font-black text-success text-lg">+₹{log.wage}</span>
              </div>
            ))}
          </div>
          <div className="glass-card p-4 flex justify-between items-center bg-success/5 border-success/20">
            <span className="font-bold text-sm text-muted-foreground">Total Earned on this Project</span>
            <span className="text-2xl font-black text-success">
              ₹{workLogs.reduce((s: number, l: any) => s + l.wage, 0).toLocaleString()}
            </span>
          </div>
        </motion.div>
      )}

      {/* Assigned Workers */}
      <motion.div variants={item} className="space-y-3">
        <h3 className="font-black text-lg flex items-center gap-2"><Users className="text-primary" size={20} /> Team Members</h3>
        {project.assignedWorkers?.length > 0 ? (
          <div className="space-y-2">
            {(project.assignedWorkers || []).map((w: any) => (
              <div key={w._id} className="glass-card flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
                  {w.profileImage ? <img src={w.profileImage} alt={w.name} className="w-full h-full object-cover" /> : w.name?.[0] || "W"}
                </div>
                <div>
                  <p className="font-bold text-sm">{w.name}</p>
                  <p className="text-xs text-muted-foreground">{w.skills?.join(", ")}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-6 text-center border-dashed">
            <p className="text-muted-foreground text-sm">No workers assigned yet.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default WorkerProjectDetail;
