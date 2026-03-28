import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import JobCard from "@/components/shared/JobCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2, Search, Map as MapIcon, Check, X as CloseIcon, Navigation, User, MapPin, Building2, Clock, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { getJobs, getJobRequests, updateJobRequestStatus, applyForJob } from "@/services/jobService";
import { getAllProjects, applyToProject, getMyApplications } from "@/services/projectService";
import ApplyConfirmationModal from "@/components/shared/ApplyConfirmationModal";
import { useNavigate } from "react-router-dom";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const FindWork = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [applyingProjectId, setApplyingProjectId] = useState<string | null>(null);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [jobToApply, setJobToApply] = useState<{ id: string, title: string } | null>(null);
  const [applyLoading, setApplyLoading] = useState(false);

  const fetchJobData = async () => {
    try {
      const [jobsRes, requestsRes] = await Promise.all([getJobs(), getJobRequests()]);
      setJobs(jobsRes.data);
      setRequests(requestsRes.data);
    } catch (err) {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectData = async () => {
    try {
      const [projectsRes, appsRes] = await Promise.all([getAllProjects(), getMyApplications()]);
      setProjects(projectsRes.data);
      setMyApplications(appsRes.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobData();
    fetchProjectData();
  }, []);

  const filteredJobs = jobs.filter(j =>
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.skillRequired.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.requiredSkills?.some((s: string) => s.toLowerCase().includes(projectSearch.toLowerCase()))
  );

  const getApplicationStatus = (projectId: string) => {
    const app = myApplications.find((a: any) => a.projectId?._id === projectId || a.projectId === projectId);
    return app?.status || null;
  };

  const handleApplyClick = (jobId: string, title: string) => {
    setJobToApply({ id: jobId, title });
    setShowApplyModal(true);
  };

  const confirmApply = async () => {
    if (!jobToApply) return;
    setApplyLoading(true);
    try {
      await applyForJob(jobToApply.id);
      toast.success(`${t("jobApplied")}: ${jobToApply.title}`, { description: t("employerNotified") });
      fetchJobData();
      setShowApplyModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Application failed");
    } finally {
      setApplyLoading(false);
      setJobToApply(null);
    }
  };

  const handleUpdateRequest = async (id: string, status: "accepted" | "rejected") => {
    try {
      await updateJobRequestStatus(id, status);
      toast.success(`Request ${status} successfully!`);
      fetchJobData();
    } catch {
      toast.error("Failed to update request");
    }
  };

  const handleApplyToProject = async (projectId: string, projectTitle: string) => {
    setApplyingProjectId(projectId);
    try {
      await applyToProject(projectId);
      toast.success(`Applied to "${projectTitle}"!`, { description: "The constructor will review your application." });
      fetchProjectData();
    } catch (err: any) {
      toast.error(err?.message || "Application failed");
    } finally {
      setApplyingProjectId(null);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black mb-1" style={{ fontFamily: "var(--font-heading)" }}>{t("findWork")}</h1>
          <p className="text-muted-foreground text-sm font-medium">{t("jobOpportunities")}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-secondary/60 rounded-xl px-4 py-2 border border-border/50 transition-colors focus-within:border-primary">
            <Search size={16} className="text-muted-foreground" />
            <input
              type="text"
              placeholder={t("search") || "Search jobs..."}
              className="bg-transparent text-sm outline-none w-40 md:w-60"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="recommended" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-secondary/30 p-1 rounded-xl h-12">
            <TabsTrigger value="nearby" className="rounded-lg font-bold flex items-center gap-2">
              <MapIcon size={16} /> Nearby
            </TabsTrigger>
            <TabsTrigger value="recommended" className="rounded-lg font-bold flex items-center gap-2">
              <User size={16} /> Jobs
            </TabsTrigger>
            <TabsTrigger value="projects" className="rounded-lg font-bold flex items-center gap-2">
              <Building2 size={16} /> Projects
              {filteredProjects.length > 0 && (
                <span className="bg-primary text-primary-foreground text-[9px] font-black px-1.5 py-0.5 rounded-full">{filteredProjects.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" className="rounded-lg font-bold flex items-center gap-2 relative">
              <Navigation size={16} /> Requests
              {requests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-[10px] text-white rounded-full flex items-center justify-center animate-pulse">
                  {requests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── NEARBY TAB ── */}
          <TabsContent value="nearby" className="space-y-6">
            <div className="glass-card p-0 overflow-hidden border border-border/50 shadow-xl relative min-h-[500px] flex items-center justify-center bg-slate-100 dark:bg-slate-900">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
              <div className="relative w-full h-full p-8 flex flex-wrap gap-12 items-center justify-center">
                {jobs.slice(0, 5).map((j, idx) => (
                  <motion.div
                    key={j._id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative"
                  >
                    <div
                      onClick={() => setSelectedJob(j)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shadow-xl transition-all hover:scale-110 active:scale-95 border-2 ${
                        selectedJob?._id === j._id ? "bg-primary text-primary-foreground border-white" : "bg-white text-primary border-primary"
                      }`}
                    >
                      <MapPin size={24} />
                    </div>
                    {selectedJob?._id === j._id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 glass-card p-3 z-50 shadow-2xl border-primary animate-in fade-in slide-in-from-bottom-2"
                      >
                        <h4 className="font-bold text-xs truncate mb-1">{j.title}</h4>
                        <p className="text-[10px] text-muted-foreground mb-2">₹{j.wage} • {j.location}</p>
                        <Button size="sm" onClick={() => handleApplyClick(j._id, j.title)} className="w-full h-7 text-[10px] font-bold">Apply Now</Button>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
              <div className="absolute top-4 left-4 glass-card px-4 py-2 text-xs font-bold flex items-center gap-2 shadow-lg">
                <Navigation size={14} className="text-primary animate-pulse" />
                Showing jobs near {user?.location || "your location"}
              </div>
            </div>
          </TabsContent>

          {/* ── JOBS TAB ── */}
          <TabsContent value="recommended" className="space-y-6">
            <motion.div variants={item} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.length > 0 ? filteredJobs.map((j) => (
                <JobCard
                  key={j._id}
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
                  onClick={() => handleApplyClick(j._id, j.title)}
                />
              )) : (
                <div className="col-span-full py-20 text-center text-muted-foreground glass-card border-dashed">
                  <Search size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-bold text-lg">No jobs found matching your skills.</p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* ── PROJECTS TAB ── */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex items-center gap-2 bg-secondary/60 rounded-xl px-4 py-2.5 border border-border/50 focus-within:border-primary transition-colors">
              <Search size={16} className="text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects by title or skill..."
                className="bg-transparent text-sm outline-none flex-1"
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
              />
            </div>

            {projectsLoading ? (
              <div className="h-40 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground glass-card border-dashed">
                <Building2 size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-bold text-lg">No public projects available right now.</p>
                <p className="text-sm mt-1">Check back soon — constructors will post project opportunities here.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(p => {
                  const appStatus = getApplicationStatus(p._id);
                  return (
                    <motion.div
                      key={p._id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-6 flex flex-col gap-4 hover:border-primary/40 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                          <Building2 size={22} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-base truncate">{p.title}</h3>
                          <p className="text-xs text-muted-foreground truncate">{p.constructor?.name}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {p.requiredSkills?.slice(0, 3).map((s: string) => (
                          <span key={s} className="px-2 py-0.5 bg-secondary text-muted-foreground rounded-lg text-[10px] font-bold">{s}</span>
                        ))}
                      </div>

                      <div className="flex gap-3 text-sm border-t border-border pt-3">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Clock size={14} className="text-warning" /> {p.duration}
                        </div>
                        <div className="flex items-center gap-1.5 font-bold text-success">
                          <Wallet size={14} /> ₹{p.wagePerDay}/day
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 rounded-xl text-xs font-bold"
                          onClick={() => navigate(`/dashboard/worker/projects/${p._id}`)}
                        >
                          View Details
                        </Button>
                        {appStatus ? (
                          <Badge
                            className={`rounded-xl px-3 text-[10px] font-black uppercase ${
                              appStatus === "accepted" ? "bg-success/20 text-success" :
                              appStatus === "rejected" ? "bg-destructive/20 text-destructive" :
                              "bg-warning/20 text-warning"
                            }`}
                          >
                            {appStatus === "accepted" ? "✓ Accepted" : appStatus === "rejected" ? "✗ Rejected" : "⏳ Pending"}
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            className="flex-1 rounded-xl text-xs font-bold gradient-primary"
                            disabled={applyingProjectId === p._id}
                            onClick={() => handleApplyToProject(p._id, p.title)}
                          >
                            {applyingProjectId === p._id ? <Loader2 size={12} className="animate-spin" /> : "Apply"}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ── REQUESTS TAB ── */}
          <TabsContent value="requests" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {requests.length > 0 ? requests.map((req) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={req._id}
                  className="glass-card p-5 group hover:border-primary/50 transition-all border-l-4 border-l-primary shadow-lg shadow-primary/5"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold">{req.job?.title || "Direct Offer"}</h3>
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-md">Direct Invite</span>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                        <User size={14} className="text-primary/70" /> {req.sender?.name || "Client"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-primary">₹{req.job?.wage || 0}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{req.job?.location || "N/A"}</p>
                    </div>
                  </div>

                  {req.status === "pending" ? (
                    <div className="flex gap-3 mt-6">
                      <Button
                        onClick={() => handleUpdateRequest(req._id, "accepted")}
                        className="flex-1 font-bold h-11 shadow-lg shadow-success/10 bg-success hover:bg-success/90 text-white"
                      >
                        <Check size={18} className="mr-2" /> Accept
                      </Button>
                      <Button
                        onClick={() => handleUpdateRequest(req._id, "rejected")}
                        variant="outline"
                        className="flex-1 font-bold h-11 border-destructive/30 text-destructive hover:bg-destructive/5 hover:border-destructive"
                      >
                        <CloseIcon size={18} className="mr-2" /> Reject
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-6 text-center">
                      <Badge variant={req.status === "accepted" ? "secondary" : "destructive"} className="uppercase">
                        {req.status}
                      </Badge>
                    </div>
                  )}
                </motion.div>
              )) : (
                <div className="col-span-full py-20 text-center text-muted-foreground glass-card border-dashed">
                  <Navigation size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-bold text-lg">No job requests yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      <ApplyConfirmationModal
        isOpen={showApplyModal}
        onClose={() => { setShowApplyModal(false); setJobToApply(null); }}
        onConfirm={confirmApply}
        jobTitle={jobToApply?.title || ""}
        loading={applyLoading}
      />
    </motion.div>
  );
};

export default FindWork;
