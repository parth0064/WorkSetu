import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { createJob } from "@/services/jobService";
import { Loader2, UserCheck, X } from "lucide-react";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const SKILLS = ["mason", "tileWorker", "plumber", "electrician", "carpenter", "painter", "welder", "other"];

const PostJobPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Check if a worker was pre-selected from FindWorkers page
  const preselectedWorker = (location.state as any)?.preselectedWorker || null;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skillRequired: preselectedWorker?.skills?.[0] || "",
    location: "",
    wage: "",
    duration: "1 Week",
    isUrgent: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.skillRequired || !formData.location || !formData.wage || !formData.duration) {
      return toast.error("Please fill all fields");
    }
    setLoading(true);
    try {
      const res = await createJob(formData);
      toast.success("Job posted successfully!", {
        description: "Workers can now apply for your job.",
        duration: 4000,
      });
      // Navigate to the new job's details page so they can manage it
      const newJobId = res.data?._id;
      if (newJobId) {
        navigate(`/dashboard/client/jobs/${newJobId}`);
      } else {
        navigate("/dashboard/client/jobs");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl space-y-8 pb-20">
      <motion.div variants={item}>
        <h2 className="text-3xl font-black text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
          {t("postJob")}
        </h2>
        <p className="text-muted-foreground text-sm font-medium">
          Post a job listing — workers will apply and you can book them directly.
        </p>
      </motion.div>

      {/* Pre-selected worker banner */}
      {preselectedWorker && (
        <motion.div variants={item} className="glass-card border-primary/30 bg-primary/5 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
            {preselectedWorker.profileImage ? (
              <img src={preselectedWorker.profileImage} alt={preselectedWorker.name} className="w-full h-full object-cover" />
            ) : "👷"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black uppercase tracking-widest text-primary mb-0.5">Posting for Worker</p>
            <p className="font-bold text-lg truncate">{preselectedWorker.name}</p>
            <p className="text-xs text-muted-foreground">{preselectedWorker.skills?.join(", ")}</p>
          </div>
          <button
            onClick={() => navigate("/dashboard/client/workers")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
          <div className="text-xs font-medium text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <UserCheck size={12} className="text-primary" />
            After posting, go to job details and click "Book Now" on this worker once they apply
          </div>
        </motion.div>
      )}

      <motion.div variants={item}>
        <form onSubmit={handleSubmit} className="glass-card border-primary/20 bg-primary/5 p-8 space-y-6">

          {/* Title & Description */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                {t("jobTitleLabel")}
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Kitchen Tile Work Needed"
                className="bg-background/50 border-border focus:border-primary py-6 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the work in detail — materials needed, area size, access, etc."
                className="bg-background/50 border-border focus:border-primary rounded-xl min-h-[120px]"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Skill Required */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Skill Required</label>
              <select
                value={formData.skillRequired}
                onChange={(e) => setFormData({...formData, skillRequired: e.target.value})}
                className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select a skill...</option>
                {SKILLS.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Location</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="e.g. Mumbai, Maharashtra"
                className="bg-background/50 border-border focus:border-primary py-6 rounded-xl"
                required
              />
            </div>

            {/* Wage */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Budget / Wage (₹)</label>
              <Input
                type="number"
                value={formData.wage}
                onChange={(e) => setFormData({...formData, wage: e.target.value})}
                placeholder="e.g. 15000"
                className="bg-background/50 border-border focus:border-primary py-6 rounded-xl"
                required
                min="1"
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Duration</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="1 Day">1 Day</option>
                <option value="2-3 Days">2-3 Days</option>
                <option value="1 Week">1 Week</option>
                <option value="2 Weeks">2 Weeks</option>
                <option value="1 Month">1 Month</option>
                <option value="2-3 Months">2-3 Months</option>
                <option value="Ongoing">Ongoing</option>
              </select>
            </div>
          </div>

          {/* Urgent toggle */}
          <div className="flex items-center gap-3 bg-background/50 p-4 rounded-xl border border-border">
            <input
              type="checkbox"
              id="urgent"
              checked={formData.isUrgent}
              onChange={(e) => setFormData({...formData, isUrgent: e.target.checked})}
              className="w-5 h-5 rounded text-primary focus:ring-primary accent-primary"
            />
            <div className="flex flex-col">
              <label htmlFor="urgent" className="text-sm font-bold text-foreground cursor-pointer">Mark as Urgent</label>
              <span className="text-xs text-muted-foreground">Workers will see this job needs immediate attention.</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => navigate("/dashboard/client")} className="rounded-xl px-8 py-6">
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={loading} className="gradient-primary border-0 rounded-xl px-10 py-6 font-bold">
              {loading && <Loader2 className="animate-spin mr-2" size={18} />}
              Post Job
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default PostJobPage;
