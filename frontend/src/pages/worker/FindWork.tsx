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
import { getAllProjects, applyToProject, getMyApplications, updateProjectApplicationStatus } from "@/services/projectService";
import ApplyConfirmationModal from "@/components/shared/ApplyConfirmationModal";
import { useNavigate } from "react-router-dom";
import JobMap from "./JobMap";

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
      setJobs(jobsRes?.data || []);
      setRequests(requestsRes?.data || []);
    } catch (err) {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectData = async () => {
    try {
      const [projectsRes, appsRes] = await Promise.all([getAllProjects(), getMyApplications()]);
      setProjects(projectsRes?.data || []);
      setMyApplications(appsRes?.data || []);
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

  const filteredJobs = (jobs || []).filter(j => {
    const term = searchTerm.toLowerCase();
    const locationStr = typeof j.location === 'object'
      ? (j.location?.address || '')
      : (j.location || '');
    return (
      j.title.toLowerCase().includes(term) ||
      j.skillRequired.toLowerCase().includes(term) ||
      locationStr.toLowerCase().includes(term)
    );
  });

  const filteredProjects = (projects || []).filter(p =>
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

  const handleUpdateRequest = async (id: string, status: "accepted" | "rejected", type: "job" | "project" = "job") => {
    try {
      if (type === "project") {
        await updateProjectApplicationStatus(id, status);
      } else {
        await updateJobRequestStatus(id, status);
      }
      toast.success(`${type === 'project' ? 'Project invite' : 'Job request'} ${status} successfully!`);
      fetchJobData();
      fetchProjectData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update request");
    }
  };

  const handleApplyToProject = async (projectId: string, projectTitle: string) => {
    setApplyingProjectId(projectId);
    try {
      await applyToProject(projectId);
      toast.success(`Applied to "${projectTitle}"!`, { description: "The contractor will review your application." });
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
            <JobMap />
          </TabsContent>

          {/* ── JOBS TAB ── */}
          <TabsContent value="recommended" className="space-y-6">
            {/* Info banner explaining the two location modes */}
            <div className="flex items-start gap-3 bg-secondary/40 border border-border/60 rounded-xl px-4 py-3">
              <div className="flex gap-2 mt-0.5 shrink-0">
                <MapPin size={14} className="text-warning" />
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <span className="font-bold text-foreground">All jobs appear here.</span>{" "}
                Jobs marked <span className="font-bold text-warning">📍 Manual Location</span> were posted without GPS — find them here and apply directly.{" "}
                Jobs posted via GPS also show up on the{" "}
                <span className="font-bold text-foreground">Nearby</span> map tab.
              </p>
            </div>

            <motion.div variants={item} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.length > 0 ? filteredJobs.map((j) => {
                const hasCoords = Array.isArray(j.location?.coordinates) && j.location.coordinates.length === 2;
                const locationText = typeof j.location === 'object'
                  ? (j.location?.address || 'Location Hidden')
                  : (j.location || 'Location Hidden');
                return (
                  <div key={j._id} className="relative">
                    {/* Manual location badge */}
                    {!hasCoords && (
                      <div className="absolute -top-2 -right-2 z-10 flex items-center gap-1 bg-warning/15 border border-warning/30 text-warning rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-sm">
                        <MapPin size={8} />
                        Manual
                      </div>
                    )}
                    <JobCard
                      title={j.title}
                      location={locationText}
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
                  </div>
                );
              }) : (
                <div className="col-span-full py-20 text-center text-muted-foreground glass-card border-dashed">
                  <Search size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-bold text-lg">No jobs found matching your search.</p>
                  <p className="text-sm mt-1 opacity-70">Try searching by job title, skill, or city name.</p>
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
                <p className="text-sm mt-1">Check back soon — contractors will post project opportunities here.</p>
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
                          <p className="text-xs text-muted-foreground truncate">{p.createdBy?.name}</p>
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
                        <h3 className="text-xl font-bold">{req.job?.title || req.title || "Direct Offer"}</h3>
                        <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-md ${req.type === 'project' ? 'bg-amber-100 text-amber-600' : 'bg-primary/10 text-primary'}`}>
                          {req.type === 'project' ? 'Professional Project' : 'One-off Job'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                        <User size={14} className="text-primary/70" /> {req.sender?.name || req.clientId?.name || "Client"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-primary">₹{req.job?.wage || req.wage || 0}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                         {req.job?.location && typeof req.job.location === 'object' ? req.job.location.address : (req.job?.location || req.location || "N/A")}
                      </p>
                    </div>
                  </div>

                  {req.status === "pending" ? (
                    <div className="flex gap-3 mt-6">
                      <Button
                        onClick={() => handleUpdateRequest(req._id, "accepted", req.type)}
                        className="flex-1 font-bold h-11 shadow-lg shadow-success/10 bg-success hover:bg-success/90 text-white"
                      >
                        <Check size={18} className="mr-2" /> Accept
                      </Button>
                      <Button
                        onClick={() => handleUpdateRequest(req._id, "rejected", req.type)}
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
