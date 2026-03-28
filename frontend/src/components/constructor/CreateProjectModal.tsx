import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronRight, ChevronLeft, Plus, Loader2, Check,
  Globe, Search, Send, Users, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createProject, requestWorker, updateProject } from "@/services/projectService";
import api from "@/services/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const SKILL_OPTIONS = [
  "Mason", "Plumber", "Electrician", "Carpenter", "Painter",
  "Welder", "Tile Worker", "Steel Fixer", "Supervisor", "General Labor"
];

const CreateProjectModal = ({ open, onClose, onCreated }: Props) => {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [createdProject, setCreatedProject] = useState<any>(null);

  // Step 1 form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    requiredSkills: [] as string[],
    location: "",
    duration: "",
    monthlyDuration: "",
    totalWorkers: 1,
    totalDays: 30,
    wagePerDay: 0,
    totalBudget: 0,
    isPublicPost: true,
  });

  // Step 2 state
  const [mode, setMode] = useState<"choose" | "public" | "request">("choose");
  const [workers, setWorkers] = useState<any[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [workerSearch, setWorkerSearch] = useState("");
  const [requestedWorkers, setRequestedWorkers] = useState<string[]>([]);
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  const resetAll = () => {
    setStep(1);
    setMode("choose");
    setForm({
      title: "", description: "", requiredSkills: [], location: "",
      duration: "", monthlyDuration: "", totalWorkers: 1, totalDays: 30,
      wagePerDay: 0, totalBudget: 0, isPublicPost: true,
    });
    setCreatedProject(null);
    setRequestedWorkers([]);
    setWorkerSearch("");
  };

  useEffect(() => {
    if (!open) resetAll();
  }, [open]);

  const toggleSkill = (skill: string) => {
    setForm(f => ({
      ...f,
      requiredSkills: f.requiredSkills.includes(skill)
        ? f.requiredSkills.filter(s => s !== skill)
        : [...f.requiredSkills, skill],
    }));
  };

  const handleStep1Submit = async () => {
    if (!form.title || !form.description || form.requiredSkills.length === 0 || !form.duration || !form.wagePerDay) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      const res = await createProject({ ...form });
      toast.success("Project created! Now add workers.");
      setCreatedProject(res.data);
      setStep(2);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create project");
    } finally {
      setSaving(false);
    }
  };


  const loadWorkers = async () => {
    setLoadingWorkers(true);
    try {
      const res = await api.get('/users/workers');
      setWorkers(res.data.data || []);
    } catch {
      toast.error("Failed to load workers");
    } finally {
      setLoadingWorkers(false);
    }
  };

  const handleSelectRequestMode = async () => {
    setMode("request");
    loadWorkers();
    // Ensure it remains public even if we are also requesting specific workers!
    if (createdProject?._id && !createdProject.isPublicPost) {
       try { await updateProject(createdProject._id, { isPublicPost: true }); } catch(e){}
    }
  };

  const handleSelectPublicMode = async () => {
    setMode("public");
    setSaving(true);
    try {
      // It should already be true from Step 1, but let's confirm
      if (createdProject?._id) {
         await updateProject(createdProject._id, { isPublicPost: true });
      }
      toast.success("🌐 Project is Live! Workers can now find and apply.");
    } catch {
      toast.success("🌐 Project published successfully.");
    } finally {
      setSaving(false);
    }
  };

  const handleRequestWorker = async (workerId: string, workerName: string) => {
    if (!createdProject?._id) return;
    setSendingTo(workerId);
    try {
      await requestWorker(createdProject._id, workerId);
      setRequestedWorkers(prev => [...prev, workerId]);
      toast.success(`Request sent to ${workerName}!`);
    } catch (err: any) {
      toast.error(err?.message || "Request failed");
    } finally {
      setSendingTo(null);
    }
  };

  const filteredWorkers = workers.filter(w =>
    w.name.toLowerCase().includes(workerSearch.toLowerCase()) ||
    w.skills?.some((s: string) => s.toLowerCase().includes(workerSearch.toLowerCase()))
  );

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card rounded-3xl shadow-2xl border border-primary/20"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card/90 backdrop-blur-md z-10 rounded-t-3xl">
            <div>
              <h2 className="text-xl font-black" style={{ fontFamily: "var(--font-heading)" }}>
                {step === 1 ? "Create New Project" : "Add Workers"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Step {step} of 2</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-secondary flex items-center justify-center transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex gap-2 px-6 pt-4">
            {[1, 2].map(s => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? "bg-primary" : "bg-secondary"}`} />
            ))}
          </div>

          {/* ── STEP 1: Project Details ── */}
          {step === 1 && (
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Project Title *</label>
                <Input
                  placeholder="e.g. Phase 2 – Commercial Hub"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="rounded-xl h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Description *</label>
                <textarea
                  placeholder="Describe the project scope, location, expectations..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Skills Required *</label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        form.requiredSkills.includes(skill)
                          ? "bg-primary text-primary-foreground shadow-md scale-105"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {form.requiredSkills.includes(skill) && <Check size={10} className="inline mr-1" />}
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Location</label>
                  <Input placeholder="City / Site" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Duration *</label>
                  <Input placeholder="e.g. 3 Months" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className="rounded-xl h-12" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Workers Needed *</label>
                  <Input type="number" min={1} value={form.totalWorkers} onChange={e => setForm(f => ({ ...f, totalWorkers: +e.target.value }))} className="rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Days *</label>
                  <Input type="number" min={1} value={form.totalDays} onChange={e => setForm(f => ({ ...f, totalDays: +e.target.value }))} className="rounded-xl h-12" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Wage Per Worker/Day (₹) *</label>
                  <Input type="number" min={0} value={form.wagePerDay} onChange={e => setForm(f => ({ ...f, wagePerDay: +e.target.value }))} className="rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Budget (₹)</label>
                  <Input type="number" min={0} value={form.totalBudget} onChange={e => setForm(f => ({ ...f, totalBudget: +e.target.value }))} className="rounded-xl h-12" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Monthly Duration (Optional)</label>
                <Input placeholder="e.g. Jan 2025 – Mar 2025" value={form.monthlyDuration} onChange={e => setForm(f => ({ ...f, monthlyDuration: e.target.value }))} className="rounded-xl h-12" />
              </div>

              <Button
                onClick={handleStep1Submit}
                disabled={saving}
                className="w-full h-13 gradient-primary font-bold rounded-2xl text-sm gap-2 shadow-lg mt-2"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
                {saving ? "Creating..." : "Create Project & Add Workers"}
              </Button>
            </div>
          )}

          {/* ── STEP 2: Add Workers ── */}
          {step === 2 && (
            <div className="p-6 space-y-6">
              {mode === "choose" && (
                <>
                  <p className="text-sm text-muted-foreground text-center font-medium">How would you like to find workers?</p>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Option A */}
                    <button
                      onClick={handleSelectRequestMode}
                      className="glass-card p-6 text-left rounded-2xl border-2 border-transparent hover:border-primary/40 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Users size={24} />
                      </div>
                      <h4 className="font-black text-base mb-1">Request Specific Workers</h4>
                      <p className="text-xs text-muted-foreground">Browse and invite workers from your database directly.</p>
                    </button>

                    {/* Option B */}
                    <button
                      onClick={handleSelectPublicMode}
                      className="glass-card p-6 text-left rounded-2xl border-2 border-transparent hover:border-accent/40 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Globe size={24} />
                      </div>
                      <h4 className="font-black text-base mb-1">Public Post</h4>
                      <p className="text-xs text-muted-foreground">Publish project publicly so workers can find and apply.</p>
                    </button>
                  </div>

                  <button
                    onClick={() => { onCreated(); }}
                    className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    Skip for now → I'll add workers later
                  </button>
                </>
              )}

              {mode === "public" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-10 space-y-4">
                  <div className="w-20 h-20 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto">
                    <Globe size={40} />
                  </div>
                  <h3 className="text-2xl font-black">Project is Live!</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    Your project is now publicly visible. Workers can discover and apply. You'll see applicants in the project details page.
                  </p>
                  <Button onClick={onCreated} className="gradient-primary font-bold rounded-xl gap-2 px-8">
                    <Check size={16} /> Go to My Projects
                  </Button>
                </motion.div>
              )}

              {mode === "request" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 bg-secondary/60 rounded-xl px-4 py-2.5 border border-border/50 focus-within:border-primary transition-colors">
                    <Search size={16} className="text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search workers by name or skill..."
                      value={workerSearch}
                      onChange={e => setWorkerSearch(e.target.value)}
                      className="bg-transparent text-sm outline-none flex-1"
                    />
                  </div>

                  {loadingWorkers ? (
                    <div className="h-40 flex items-center justify-center">
                      <Loader2 className="animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {filteredWorkers.length === 0 && (
                        <p className="text-center text-muted-foreground py-10">No workers found.</p>
                      )}
                      {filteredWorkers.map(w => {
                        const isRequested = requestedWorkers.includes(w._id);
                        return (
                          <div key={w._id} className="glass-card p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
                              {w.profileImage ? <img src={w.profileImage} alt={w.name} className="w-full h-full object-cover" /> : w.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm truncate">{w.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{w.skills?.join(", ") || "General"}</p>
                            </div>
                            <Button
                              size="sm"
                              variant={isRequested ? "outline" : "default"}
                              className={`shrink-0 rounded-xl text-xs font-bold gap-1.5 ${isRequested ? "border-success text-success" : ""}`}
                              disabled={isRequested || sendingTo === w._id}
                              onClick={() => !isRequested && handleRequestWorker(w._id, w.name)}
                            >
                              {sendingTo === w._id ? <Loader2 size={12} className="animate-spin" /> : isRequested ? <Check size={12} /> : <Send size={12} />}
                              {isRequested ? "Sent" : "Request"}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <Button onClick={onCreated} className="w-full rounded-xl font-bold gradient-primary gap-2">
                    <Check size={16} /> Done
                  </Button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateProjectModal;
