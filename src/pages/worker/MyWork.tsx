import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle2, Clock, Star, Wallet, TrendingUp, Calendar, MapPin, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getMyAssignedJobs } from "@/services/jobService";
import { getWallet } from "@/services/walletService";
import { Badge } from "@/components/ui/badge";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const MyWork = () => {
    const { t } = useLanguage();
    const [jobs, setJobs] = useState<any[]>([]);
    const [wallet, setWallet] = useState({ balance: 0, pending: 0 });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [jobsRes, walletRes] = await Promise.all([
                getMyAssignedJobs(),
                getWallet()
            ]);
            setJobs(jobsRes.data);
            setWallet(walletRes.data);
        } catch (error) {
            console.error("Error fetching work data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const activeJobs = jobs.filter(j => j.status === 'in-progress' || j.status === 'booked');
    const workHistory = jobs.filter(j => j.status === 'completed');
    
    // Calculate simulated earnings from work history (total sum of completed job wages)
    const totalEarnings = workHistory.reduce((acc, curr) => acc + (Number(curr.wage.replace(/[^0-9]/g, '')) || 0), 0);

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-20">
            <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black mb-1" style={{ fontFamily: "var(--font-heading)" }}>{t("myWork")}</h1>
                    <p className="text-muted-foreground text-sm font-medium">Manage your active jobs and view past work.</p>
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

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Active Work Section */}
                <motion.div variants={item} className="space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                        <Clock className="text-primary" size={20} /> Active Projects
                    </h3>
                    <div className="space-y-4">
                        {activeJobs.length > 0 ? activeJobs.map((j) => (
                            <div key={j._id} className="glass-card p-6 border-l-4 border-l-warning">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="font-bold text-lg">{j.title}</h4>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{j.location}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <Badge className={`border-none uppercase text-[10px] font-black ${
                                            j.status === 'booked' ? 'bg-warning/20 text-warning' : 'bg-blue-500/20 text-blue-500'
                                        }`}>
                                            {j.status === 'booked' ? 'Booked - Awaiting Payment' : t("inProgress")}
                                        </Badge>
                                        {j.paymentStatus === 'secured' && (
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
                                <p className="text-muted-foreground">No active projects assigned.</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Completed Work History */}
                <motion.div variants={item} className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                            <CheckCircle2 className="text-success" size={20} /> {t("workHistory")}
                        </h3>
                    </div>
                    
                    <div className="grid gap-4">
                        {workHistory.length > 0 ? workHistory.map((w) => (
                            <div key={w._id} className="glass-card p-5 flex flex-col sm:flex-row sm:items-center gap-4 group cursor-pointer hover:border-primary/30 transition-all shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:bg-primary/10" />
                                
                                <div className="w-14 h-14 rounded-2xl bg-success/10 text-success flex items-center justify-center text-2xl shrink-0 border border-success/20">
                                    💼
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-lg group-hover:text-primary transition-colors truncate">
                                            {w.title}
                                        </h4>
                                        <Badge className="bg-success/10 text-success hover:bg-success/20 border-none uppercase text-[9px]">
                                            {t("completed")}
                                        </Badge>
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
                                    {w.extraExpense > 0 ? (
                                        <>
                                            <p className="text-xl font-black text-success">
                                                ₹{(Number(w.wage.toString().replace(/[^0-9]/g, '')) || 0) + w.extraExpense}
                                            </p>
                                            <p className="text-[9px] text-primary mt-1 font-bold bg-primary/10 px-1.5 py-0.5 rounded-full">+₹{w.extraExpense} Bonus/Extra</p>
                                        </>
                                    ) : (
                                        <p className="text-xl font-black text-foreground">₹{w.wage}</p>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="glass-card p-10 text-center border-dashed">
                                <p className="text-muted-foreground">No completed work found yet.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default MyWork;
