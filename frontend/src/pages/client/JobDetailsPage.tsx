import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
    Check, 
    TrendingUp, 
    ArrowLeft, 
    Loader2, 
    ShieldCheck, 
    CreditCard, 
    UserCheck, 
    Star, 
    MapPin, 
    Briefcase,
    ChevronRight,
    CircleDot,
    MessageCircle,
    Lock
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { getJobById, bookWorker, completeJob } from "@/services/jobService";
import { securePayment, releasePayment } from "@/services/walletService";
import { getJobFeedback } from "@/services/reviewService";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import FeedbackModal from "@/components/shared/FeedbackModal";
import PaymentConfirmationModal from "@/components/shared/PaymentConfirmationModal";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item: any = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } };

const JobDetailsPage = () => {
    const { t } = useLanguage();
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    const fetchJob = async () => {
        try {
            const data = await getJobById(id!);
            const jobData = data.data;
            setJob(jobData);
            // Set feedbackSubmitted from the job record
            setFeedbackSubmitted(jobData.feedbackSubmitted === true);
        } catch (error) {
            console.error("Error fetching job:", error);
            toast.error("Failed to load job details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJob();
    }, [id]);

    const handleSecurePayment = async () => {
        setActionLoading(true);
        try {
            const amountToSend = job.paymentAmount || job.wage;
            await securePayment(id!, amountToSend);
            toast.success("Payment Secured in Escrow!", {
                description: "The job is now officially in progress."
            });
            fetchJob();
        } catch (error: any) {
            console.error("Payment Error:", error);
            const msg = error.response?.data?.message || "Failed to secure payment";
            toast.error(msg);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCompleteJob = async () => {
        setActionLoading(true);
        try {
            await completeJob({ jobId: id! });
            toast.success("Job marked as Done!", {
                description: "Please rate the worker to unlock payment release."
            });
            await fetchJob();
            // Auto-open feedback modal after job is marked done
            setFeedbackModalOpen(true);
        } catch (error: any) {
            console.error("Completion Error:", error);
            const msg = error.response?.data?.message || "Failed to complete job";
            toast.error(msg);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReleasePayment = async (extraExpense: number) => {
        setActionLoading(true);
        try {
            await releasePayment(id!, extraExpense);
            toast.success("Success! Payment released to worker. 🎉");
            setPaymentModalOpen(false);
            fetchJob();
        } catch (error: any) {
            console.error("Release Error:", error);
            const msg = error.response?.data?.message || "Failed to release payment";
            // If backend says feedback required, open modal
            if (error.response?.data?.code === 'FEEDBACK_REQUIRED') {
                toast.error("Please submit feedback first.");
                setFeedbackModalOpen(true);
            } else {
                toast.error(msg);
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleBook = async (workerId: string, workerName: string) => {
        setActionLoading(true);
        try {
            await bookWorker(id!, workerId);
            toast.success(`Hired ${workerName}!`, {
                description: "Worker accepted. Please secure the payment to start the job.",
                duration: 5000,
            });
            fetchJob();
            window.scrollTo({ top: 300, behavior: 'smooth' });
        } catch (error: any) {
            console.error("Booking Error:", error);
            const msg = error.response?.data?.message || "Booking failed";
            toast.error(msg);
        } finally {
            setActionLoading(false);
        }
    };

    const handleFeedbackSuccess = async () => {
        setFeedbackSubmitted(true);
        setFeedbackModalOpen(false);
        await fetchJob();
    };

    if (loading) return (
        <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary w-10 h-10" />
            <p className="text-muted-foreground animate-pulse font-bold tracking-tighter">SYNCING JOB DATA...</p>
        </div>
    );

    if (!job) return <div className="p-20 text-center font-bold text-2xl">Job not found</div>;

    const isAssigned = !!job.assignedWorker;
    
    const getActiveStep = () => {
        if (job.status === 'open') return 0;
        if (job.status === 'booked') return 1;
        if (job.status === 'in-progress') return 2;
        if (job.status === 'completed' && job.paymentStatus !== 'released') return 3;
        if (job.paymentStatus === 'released') return 4;
        return 0;
    };

    const STEPS = [
        { label: "Post Job", status: "open" },
        { label: "Booking", status: "booked" },
        { label: "Escrow", status: "secured" },
        { label: "Execution", status: "completed" },
        { label: "Payout", status: "released" }
    ];

    const currentStepIndex = getActiveStep();

    return (
        <>
            {/* ── Feedback Modal ── */}
            {job && job.assignedWorker && (
                <FeedbackModal
                    isOpen={feedbackModalOpen}
                    onClose={() => setFeedbackModalOpen(false)}
                    jobId={id!}
                    jobTitle={job.title}
                    workerName={job.assignedWorker?.name || "the worker"}
                    onSuccess={handleFeedbackSuccess}
                />
            )}

            <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-8 pb-32">
                {/* Header / Back */}
                <motion.div variants={item} className="flex items-center justify-between">
                    <Button 
                        variant="ghost" 
                        className="group flex items-center gap-2 font-black text-xs uppercase tracking-widest hover:bg-transparent"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Button>
                    <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-tighter px-4 py-1">
                        PROJECT ID: {job._id.slice(-6)}
                    </Badge>
                </motion.div>

                {/* Hiring Stepper */}
                <motion.div variants={item} className="glass-card p-1 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
                    <div className="relative p-6 px-10 flex items-center justify-between">
                        {STEPS.map((s, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-3 relative z-10 flex-1">
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black tracking-tighter transition-all duration-500
                                    ${idx <= currentStepIndex ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-secondary text-muted-foreground'}
                                    ${idx === currentStepIndex ? 'scale-125 ring-4 ring-primary/20' : ''}
                                `}>
                                    {idx < currentStepIndex ? <Check size={14} strokeWidth={4} /> : idx + 1}
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest transition-colors duration-500 ${idx <= currentStepIndex ? 'text-primary' : 'text-muted-foreground/50'}`}>
                                    {s.label}
                                </span>
                                {idx < STEPS.length - 1 && (
                                    <div className={`absolute top-4 left-[50%] w-full h-[2px] -z-10 transition-colors duration-500 ${idx < currentStepIndex ? 'bg-primary' : 'bg-border/30'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Job Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div variants={item} className="glass-card overflow-hidden group">
                            <div className="h-2 w-full bg-primary/20 relative overflow-hidden">
                                <motion.div 
                                    className="absolute top-0 left-0 h-full bg-primary" 
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${(currentStepIndex + 1) * 20}%` }}
                                    transition={{ duration: 1, ease: "easeInOut" }}
                                />
                            </div>
                            <div className="p-8">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-5xl font-black text-foreground tracking-tighter" style={{ fontFamily: "var(--font-heading)" }}>
                                            {job.title}
                                        </h2>
                                    </div>
                                    
                                    <p className="text-muted-foreground leading-relaxed text-lg max-w-2xl font-medium">
                                        {job.description}
                                    </p>

                                    <div className="flex flex-wrap gap-4 pt-4 border-t border-border/40">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Required Skill</span>
                                            <span className="text-lg font-black text-primary">{job.skillRequired}</span>
                                        </div>
                                        <div className="w-[1px] h-10 bg-border/40 mx-2" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Posted In</span>
                                            <span className="text-lg font-black text-foreground flex items-center gap-2"><MapPin size={18} className="text-primary" /> {job.location}</span>
                                        </div>
                                        <div className="w-[1px] h-10 bg-border/40 mx-2" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Duration</span>
                                            <span className="text-lg font-black text-foreground">{job.duration || "Short-term"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Applicants or Assigned Worker */}
                        <AnimatePresence mode="wait">
                            {isAssigned ? (
                                <motion.div 
                                    key="assigned"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-6"
                                >
                                    <h3 className="text-xl font-black tracking-tight flex items-center gap-3 uppercase">
                                        <UserCheck className="text-primary" size={24} /> 
                                        Hired Professional
                                    </h3>
                                    <div className="glass-card border-primary/20 ring-1 ring-primary/5 relative p-8 group transition-all duration-500">
                                        <div className="absolute top-4 right-4 animate-pulse">
                                            <Badge className="bg-success text-white font-black uppercase text-[10px] tracking-widest px-3">HIRED</Badge>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="w-24 h-24 rounded-3xl bg-secondary flex items-center justify-center text-5xl shadow-inner group-hover:scale-110 transition-transform overflow-hidden">
                                                {job.assignedWorker.profileImage ? (
                                                    <img src={job.assignedWorker.profileImage} alt={job.assignedWorker.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>👷</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-3xl font-black tracking-tighter mb-1">{job.assignedWorker.name}</h4>
                                                <div className="flex items-center gap-4 mb-3">
                                                    <div className="flex items-center gap-1 text-warning font-bold">
                                                        <Star size={14} fill="currentColor" /> {job.assignedWorker.averageRating > 0 ? job.assignedWorker.averageRating.toFixed(1) : "New"}
                                                    </div>
                                                    <span className="text-muted-foreground text-sm font-medium">{job.assignedWorker.skills?.join(', ')}</span>
                                                </div>
                                                <div className="flex gap-2 flex-wrap">
                                                    {(job.assignedWorker.badges || []).length > 0 ? (
                                                        job.assignedWorker.badges.map((b: string) => (
                                                            <Badge key={b} variant="outline" className="border-primary/30 text-primary text-[10px] font-black">{b}</Badge>
                                                        ))
                                                    ) : (
                                                        <>
                                                            <Badge variant="outline" className="border-border text-xs">TOP RATED</Badge>
                                                            <Badge variant="outline" className="border-border text-xs">FAST RESPONSE</Badge>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="applicants"
                                    variants={item} 
                                    className="space-y-6"
                                >
                                    <h3 className="text-xl font-black tracking-tight flex items-center gap-3 uppercase opacity-80">
                                        <Briefcase className="text-primary" size={24} /> 
                                        Verified Applicants ({job.applicants?.length || 0})
                                    </h3>
                                    <div className="grid gap-4">
                                        {job.applicants?.length > 0 ? (
                                            job.applicants.map((a: any) => (
                                                <motion.div 
                                                    key={a._id} 
                                                    whileHover={{ scale: 1.01 }}
                                                    className="glass-card flex flex-col sm:flex-row items-center gap-8 p-6 transition-all hover:bg-primary/5 group border-border/40 hover:border-primary/20"
                                                >
                                                    <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center text-4xl shadow-sm group-hover:bg-primary/10 transition-colors overflow-hidden shrink-0">
                                                        {a.profileImage ? (
                                                            <img src={a.profileImage} alt={a.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span>👷</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 text-center sm:text-left">
                                                        <div className="flex flex-col sm:flex-row items-center justify-between mb-2">
                                                            <h4 className="font-black text-2xl tracking-tighter mb-1 sm:mb-0 group-hover:text-primary transition-colors">{a.name}</h4>
                                                            <div className="flex items-center gap-1 text-warning">
                                                                {[1,2,3,4,5].map(i => <Star key={i} size={12} fill={i <= Math.round(a.averageRating || 4) ? "currentColor" : "none"} />)}
                                                                <span className="text-xs font-bold ml-1 text-foreground">{a.averageRating > 0 ? a.averageRating.toFixed(1) : "New"}</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm font-medium text-muted-foreground mb-4 opacity-70 italic">Expert in {a.skills?.join(', ') || "Construction"} • {a.completedJobs || 0} jobs done</p>
                                                        <div className="flex items-center gap-4 justify-center sm:justify-start flex-wrap">
                                                            {a.status === 'busy' ? (
                                                                <Badge className="bg-destructive/20 text-destructive border-destructive/30 uppercase text-[10px] font-black tracking-widest px-3">Currently Busy</Badge>
                                                            ) : (
                                                                <>
                                                                    <Badge variant="outline" className="text-[9px] font-bold border-success/30 text-success uppercase">VERIFIED PARTNER</Badge>
                                                                    {(a.badges || []).slice(0, 2).map((b: string) => (
                                                                        <Badge key={b} variant="outline" className="text-[9px] font-bold border-primary/30 text-primary uppercase">{b}</Badge>
                                                                    ))}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button 
                                                        disabled={actionLoading || a.status === 'busy'}
                                                        onClick={() => handleBook(a._id, a.name)}
                                                        className={`gradient-primary border-0 rounded-2xl px-8 py-7 font-black tracking-widest uppercase shadow-xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto mt-4 sm:mt-0 ${a.status === 'busy' ? 'grayscale opacity-50' : ''}`}
                                                    >
                                                        {actionLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : <UserCheck size={18} className="mr-2" />}
                                                        {a.status === 'busy' ? 'Worker Busy' : 'Book Now'}
                                                    </Button>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12 glass-card border-dashed border-border flex flex-col items-center gap-4">
                                                <CircleDot className="text-muted-foreground/30 animate-pulse" size={48} />
                                                <div>
                                                    <p className="text-muted-foreground font-black uppercase text-xs tracking-[0.2em] mb-2">Waiting for Applications</p>
                                                    <p className="text-muted-foreground/60 text-xs max-w-xs mx-auto leading-relaxed">
                                                        Share this job with workers. Once they apply from their dashboard, their profiles will appear here and you can <strong>Book Now</strong>.
                                                    </p>
                                                </div>
                                                <div className="flex flex-col gap-2 text-xs font-medium text-muted-foreground/60 bg-secondary/40 rounded-xl p-4 w-full max-w-xs text-left">
                                                    <p className="font-black text-foreground text-[10px] uppercase tracking-widest mb-1">How Booking Works</p>
                                                    <p>① Worker logs in → Find Work → Applies</p>
                                                    <p>② Applicant appears here below</p>
                                                    <p>③ You click <span className="text-primary font-bold">Book Now</span></p>
                                                    <p>④ Secure payment in escrow</p>
                                                    <p>⑤ Work begins!</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Column: Dynamic Action Panel */}
                    <div className="space-y-6">
                        <motion.div variants={item} className="glass-card p-8 border-primary/30 bg-primary/5 backdrop-blur-md relative group">
                            <div className="absolute top-0 right-0 p-4">
                                <TrendingUp className="text-primary/20 group-hover:text-primary/40 transition-colors" size={48} />
                            </div>
                            
                            <div className="flex flex-col gap-8">
                                <div>
                                    <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-2">Quoted Budget</h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black text-foreground tracking-tighter">₹{job.wage}</span>
                                        <span className="text-sm font-bold text-muted-foreground italic">/ Fixed</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* STEP 4: PAY & SECURE */}
                                    {job.status === 'booked' && job.paymentStatus === 'pending' && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-500">
                                            <div className="p-4 bg-background/50 rounded-2xl border border-primary/20">
                                                <label className="text-[10px] font-black uppercase text-muted-foreground block mb-2 opacity-60">Proposed Final Wage</label>
                                                <Input 
                                                    type="number" 
                                                    className="bg-transparent border-0 text-3xl font-black p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0" 
                                                    value={job.paymentAmount || job.wage}
                                                    onChange={(e) => setJob({...job, paymentAmount: e.target.value})}
                                                />
                                            </div>
                                            <Button 
                                                onClick={handleSecurePayment} 
                                                disabled={actionLoading}
                                                className="w-full gradient-primary border-0 rounded-3xl px-6 py-8 font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all text-lg flex items-center justify-center gap-3"
                                            >
                                                {actionLoading ? <Loader2 className="animate-spin" size={24} /> : <ShieldCheck size={24} />}
                                                Pay & Secure
                                                <ChevronRight size={20} />
                                            </Button>
                                        </div>
                                    )}

                                    {/* STEP 5: MARK DONE */}
                                    {job.status === 'in-progress' && job.paymentStatus === 'secured' && (
                                        <div className="space-y-4">
                                            <div className="bg-success/10 border border-success/20 p-4 rounded-2xl flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center text-white shadow-lg">
                                                    <ShieldCheck size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-success uppercase">Escrow Secured</p>
                                                    <p className="text-sm font-bold">₹{job.paymentAmount || job.wage} Held Safely</p>
                                                </div>
                                            </div>
                                            <Button 
                                                onClick={handleCompleteJob} 
                                                disabled={actionLoading}
                                                className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-3xl px-6 py-8 font-black uppercase tracking-widest shadow-xl transition-all text-lg flex items-center justify-center gap-3"
                                            >
                                                {actionLoading ? <Loader2 className="animate-spin" size={24} /> : <Check size={24} />}
                                                Mark Done
                                            </Button>
                                        </div>
                                    )}

                                    {/* STEP 6: FEEDBACK + RELEASE (only if completed) */}
                                    {job.status === 'completed' && job.paymentStatus === 'secured' && (
                                        <div className="space-y-3">
                                            {/* Feedback Status Banner */}
                                            <AnimatePresence mode="wait">
                                                {feedbackSubmitted ? (
                                                    <motion.div
                                                        key="feedback-done"
                                                        initial={{ opacity: 0, y: -8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="bg-success/10 border border-success/20 p-3 rounded-2xl flex items-center gap-3"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                                                            <Check size={16} className="text-success" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-success uppercase tracking-widest">Feedback Submitted ✓</p>
                                                            <p className="text-xs font-medium text-muted-foreground">You can now release the payment</p>
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="feedback-needed"
                                                        initial={{ opacity: 0, y: -8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="bg-warning/10 border border-warning/30 p-3 rounded-2xl flex items-center gap-3"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                                                            <Lock size={16} className="text-warning" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-warning uppercase tracking-widest">Feedback Required</p>
                                                            <p className="text-xs font-medium text-muted-foreground">Rate the worker to unlock payment</p>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Give Feedback Button (visible when not submitted) */}
                                            {!feedbackSubmitted && (
                                                <Button
                                                    onClick={() => setFeedbackModalOpen(true)}
                                                    className="w-full bg-warning text-white hover:bg-warning/90 rounded-2xl px-6 py-6 font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-3"
                                                >
                                                    <MessageCircle size={20} />
                                                    Give Feedback ⭐
                                                </Button>
                                            )}

                                            {/* Release Funds */}
                                            <Button 
                                                onClick={() => {
                                                    if (!feedbackSubmitted) {
                                                        toast.error("Please submit feedback first to unlock payment.", {
                                                            description: "Click 'Give Feedback' to rate the worker.",
                                                            duration: 4000
                                                        });
                                                        setFeedbackModalOpen(true);
                                                        return;
                                                    }
                                                    setPaymentModalOpen(true);
                                                }}
                                                disabled={actionLoading || !feedbackSubmitted}
                                                className={`w-full rounded-3xl px-6 py-8 font-black uppercase tracking-widest shadow-xl transition-all text-lg flex items-center justify-center gap-3 ${
                                                    feedbackSubmitted
                                                        ? "bg-success text-white hover:bg-success/90"
                                                        : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                                                }`}
                                            >
                                                {actionLoading ? <Loader2 className="animate-spin" size={24} /> : feedbackSubmitted ? <CreditCard size={24} /> : <Lock size={24} />}
                                                {feedbackSubmitted ? "Release Funds" : "Locked — Submit Feedback First"}
                                            </Button>
                                        </div>
                                    )}

                                    {/* PAYMENT COMPLETED */}
                                    {job.paymentStatus === 'released' && (
                                        <div className="bg-success/5 p-8 rounded-3xl text-center space-y-6 border border-success/20">
                                            <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center text-white mx-auto shadow-xl shadow-success/20">
                                                <Check size={40} strokeWidth={4} />
                                            </div>
                                            <div>
                                                <h4 className="text-2xl font-black text-foreground tracking-tighter uppercase italic mb-1">Phase Complete</h4>
                                                <p className="text-xs font-bold text-success/80 uppercase">Worker has been paid in full.</p>
                                            </div>

                                            {/* Breakdown Box */}
                                            <div className="bg-background rounded-2xl p-4 text-left border border-border/50">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 border-b border-border/50 pb-2">Final Transfer Breakdown</p>
                                                <div className="flex justify-between items-center text-sm font-bold mb-2">
                                                    <span>Base Wage</span>
                                                    <span>₹{job.paymentAmount || job.wage}</span>
                                                </div>
                                                {job.extraExpense > 0 && (
                                                    <div className="flex justify-between items-center text-sm font-bold mb-2 text-primary">
                                                        <span>Extra Expenses</span>
                                                        <span>+₹{job.extraExpense}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/50 text-lg font-black">
                                                    <span>Total</span>
                                                    <span>₹{(job.paymentAmount || job.wage) + (job.extraExpense || 0)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={item} className="glass-card p-6 bg-secondary/30 border-dashed border-border flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <ShieldCheck size={18} />
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed">
                                Your transaction is protected by WorkSetu Escrow. Funds only leave your pocket when you say so.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Payment Confirmation Modal */}
            {job && job.assignedWorker && (
                <PaymentConfirmationModal
                    isOpen={paymentModalOpen}
                    onClose={() => setPaymentModalOpen(false)}
                    onConfirm={handleReleasePayment}
                    baseWage={job.paymentAmount || job.wage}
                    workerName={job.assignedWorker.name}
                    loading={actionLoading}
                />
            )}
        </>
    );
};

export default JobDetailsPage;
