import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle2, Clock, Star, Wallet, TrendingUp, Calendar, MapPin, Loader2, Building2, CalendarCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyAssignedJobs } from "@/services/jobService";
import { getWallet } from "@/services/walletService";
import { getAssignedProjects, getProjectWorkHistory } from "@/services/projectService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const MyWork = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<any[]>([]);
    const [wallet, setWallet] = useState({ balance: 0, pending: 0 });
    const [loading, setLoading] = useState(true);
    const [assignedProjects, setAssignedProjects] = useState<any[]>([]);
    const [projectHistory, setProjectHistory] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            const [jobsRes, walletRes, projectsRes, historyRes] = await Promise.all([
                getMyAssignedJobs(),
                getWallet(),
                getAssignedProjects().catch(() => ({ data: [] })),
                getProjectWorkHistory().catch(() => ({ data: [] }))
            ]);
            setJobs(jobsRes.data);
            setWallet(walletRes.data);
            setAssignedProjects(projectsRes.data);
            setProjectHistory(historyRes.data || []);
        } catch (error) {
            console.error("Error fetching work data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const activeJobs = jobs.filter(j => j.status === "in-progress" || j.status === "booked");
    const workHistory = jobs.filter(j => j.status === "completed");
    const activeProjects = assignedProjects.filter(p => p.status !== "completed");
    const completedProjects = assignedProjects.filter(p => p.status === "completed");

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-20">
            {/* Header + Wallet */}
            <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black mb-1" style={{ fontFamily: "var(--font-heading)" }}>{t("myWork")}</h1>
                    <p className="text-muted-foreground text-sm font-medium">Manage your active jobs and projects.</p>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-4 shadow-sm backdrop-blur-sm">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">Withdrawable Balance</p>
                        <p className="text-2xl font-black text-primary">₹{wallet.balance.toLocaleString()}</p>
                    </div>
                    <div className="ml-4 pl-4 border-l border-primary/10 flex flex-col items-center">
                        <TrendingUp size={16} className="text-success mb-1" />
                        <span className="text-[10px] font-bold text-success">+₹{wallet.pending.toLocaleString()} pending</span>
                    </div>
                </div>
            </motion.div>

            <Tabs defaultValue="projects" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-secondary/30 p-1 rounded-xl h-12">
                    <TabsTrigger value="projects" className="rounded-lg font-bold flex items-center gap-2">
                        <Building2 size={16} /> My Projects
                        {activeProjects.length > 0 && (
                            <span className="bg-primary text-primary-foreground text-[9px] font-black px-1.5 py-0.5 rounded-full">{activeProjects.length}</span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="jobs" className="rounded-lg font-bold flex items-center gap-2">
                        <Clock size={16} /> Active Jobs
                        {activeJobs.length > 0 && (
                            <span className="bg-warning text-warning-foreground text-[9px] font-black px-1.5 py-0.5 rounded-full">{activeJobs.length}</span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-lg font-bold flex items-center gap-2">
                        <CheckCircle2 size={16} /> {t("workHistory")}
                    </TabsTrigger>
                </TabsList>

                {/* ── MY PROJECTS TAB ── */}
                <TabsContent value="projects" className="space-y-4">
                    {/* Active Projects */}
                    {activeProjects.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground">Active Projects</h3>
                            {activeProjects.map(p => (
                                <motion.div key={p._id} variants={item} className="glass-card p-6 border-l-4 border-l-primary">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="font-bold text-lg">{p.title}</h4>
                                            <p className="text-xs text-muted-foreground font-medium mt-0.5">{p.requiredSkills?.join(", ")}</p>
                                        </div>
                                        <Badge className="bg-primary/10 text-primary border-primary/20 border uppercase text-[9px] font-black">
                                            {p.status.replace("-", " ")}
                                        </Badge>
                                    </div>
                                    <div className="flex gap-4 text-sm font-medium border-t border-border pt-3">
                                        <div className="flex items-center gap-1.5 text-warning"><Clock size={14} /> {p.duration}</div>
                                        <div className="flex items-center gap-1.5 text-success font-bold"><Wallet size={14} /> ₹{p.wagePerDay}/day</div>
                                    </div>
                                    {/* Summary from history */}
                                    {(() => {
                                        const summary = projectHistory.find((h: any) => h.project?._id === p._id || h.project === p._id);
                                        return summary ? (
                                            <div className="flex gap-4 mt-3 pt-3 border-t border-border text-sm">
                                                <span className="text-muted-foreground">{summary.daysWorked} day{summary.daysWorked !== 1 ? "s" : ""} worked</span>
                                                <span className="font-bold text-success">₹{summary.totalEarned.toLocaleString()} earned</span>
                                            </div>
                                        ) : null;
                                    })()}
                                    <Button
                                        onClick={() => navigate(`/dashboard/worker/projects/${p._id}`)}
                                        className="w-full mt-4 rounded-xl font-bold gap-2 gradient-primary"
                                        size="sm"
                                    >
                                        <CalendarCheck size={14} /> View & Mark Day
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Project Work History */}
                    {projectHistory.length > 0 && (
                        <div className="space-y-3 mt-6">
                            <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground">Project Earnings Summary</h3>
                            {projectHistory.map((summary: any) => (
                                <div key={summary.project?._id} className="glass-card p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
                                            <Building2 size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{summary.project?.title}</p>
                                            <p className="text-xs text-muted-foreground">{summary.daysWorked} day{summary.daysWorked !== 1 ? "s" : ""} worked</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black text-success">₹{summary.totalEarned.toLocaleString()}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Earned</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeProjects.length === 0 && projectHistory.length === 0 && (
                        <div className="glass-card p-14 text-center border-dashed">
                            <Building2 size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="text-muted-foreground font-medium">No projects assigned yet.</p>
                            <p className="text-xs text-muted-foreground mt-1 mb-4">Apply to projects in "Find Work" → Projects tab.</p>
                            <Button onClick={() => navigate("/dashboard/worker/find-work")} size="sm" className="rounded-xl font-bold gradient-primary">
                                Browse Projects
                            </Button>
                        </div>
                    )}
                </TabsContent>

                {/* ── ACTIVE JOBS TAB ── */}
                <TabsContent value="jobs" className="space-y-4">
                    {activeJobs.length > 0 ? activeJobs.map((j) => (
                        <div key={j._id} className="glass-card p-6 border-l-4 border-l-warning">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h4 className="font-bold text-lg">{j.title}</h4>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{j.location}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Badge className={`border-none uppercase text-[10px] font-black ${
                                        j.status === "booked" ? "bg-warning/20 text-warning" : "bg-blue-500/20 text-blue-500"
                                    }`}>
                                        {j.status === "booked" ? "Booked - Awaiting Payment" : t("inProgress")}
                                    </Badge>
                                    {j.paymentStatus === "secured" && (
                                        <span className="text-[10px] font-black bg-success text-success-foreground px-2 py-0.5 rounded flex items-center gap-1 uppercase shadow-sm mt-1">
                                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Payment Secured
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-sm font-medium">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar size={14} /> <span>Assigned on {new Date(j.updatedAt || j.createdAt).toLocaleDateString()}</span>
                                </div>
                                <span className="text-primary font-bold">₹{j.wage}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="glass-card p-10 text-center border-dashed">
                            <p className="text-muted-foreground">No active job assignments.</p>
                        </div>
                    )}
                </TabsContent>

                {/* ── WORK HISTORY TAB ── */}
                <TabsContent value="history" className="space-y-4">
                    {workHistory.length > 0 ? workHistory.map((w) => (
                        <div key={w._id} className="glass-card p-5 flex flex-col sm:flex-row sm:items-center gap-4 group cursor-pointer hover:border-primary/30 transition-all shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:bg-primary/10" />
                            <div className="w-14 h-14 rounded-2xl bg-success/10 text-success flex items-center justify-center text-2xl shrink-0 border border-success/20">
                                💼
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-lg group-hover:text-primary transition-colors truncate">{w.title}</h4>
                                    <Badge className="bg-success/10 text-success hover:bg-success/20 border-none uppercase text-[9px]">{t("completed")}</Badge>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                        <MapPin size={12} /> <span className="truncate">{w.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                        <Calendar size={12} /> <span>{new Date(w.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-warning">
                                        <Star size={12} className="fill-warning" />
                                        <span className="font-bold text-xs">5.0</span>
                                    </div>
                                </div>
                            </div>
                            <div className="shrink-0 flex flex-col items-end justify-center sm:pl-4 sm:border-l border-border/50">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Earned</p>
                                <p className="text-xl font-black text-foreground">₹{w.wage}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="glass-card p-10 text-center border-dashed">
                            <p className="text-muted-foreground">No completed job history yet.</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </motion.div>
    );
};

export default MyWork;
