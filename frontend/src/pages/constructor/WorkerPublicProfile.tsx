import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, MapPin, Star, Trophy, Zap, TrendingUp, CheckCircle,
    Phone, Mail, Loader2, ImagePlus, ChevronLeft, ChevronRight, X,
    Calendar, Clock, User as UserIcon, Layers, AlertCircle, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getUserProfile } from "@/services/userService";
import { getWorkerPortfolio, EXPERIENCE_LEVEL_CONFIG, PortfolioEntry, ExperienceLevel } from "@/services/portfolioService";
import { getWorkerReviews, ReviewData } from "@/services/reviewService";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const getRankStyle = (rank: string) => {
    const text = rank.toLowerCase();
    if (text.includes('grandmaster')) return 'from-purple-600 to-indigo-600 text-purple-100 border-purple-400';
    if (text.includes('master'))      return 'from-fuchsia-500 to-pink-600 text-pink-50 border-pink-400';
    if (text.includes('diamond'))     return 'from-cyan-400 to-blue-500 text-cyan-50 border-cyan-300';
    if (text.includes('platinum'))    return 'from-emerald-400 to-teal-500 text-teal-50 border-emerald-300';
    if (text.includes('gold'))        return 'from-yellow-400 to-orange-500 text-yellow-50 border-yellow-300';
    if (text.includes('silver'))      return 'from-slate-300 to-slate-400 text-slate-800 border-slate-300';
    if (text.includes('bronze'))      return 'from-amber-600 to-orange-700 text-orange-50 border-orange-500';
    return 'from-stone-500 to-stone-600 text-white border-stone-500';
};

const WorkerPublicProfile = () => {
    const { workerId } = useParams<{ workerId: string }>();
    const navigate = useNavigate();
    const [workerData, setWorkerData] = useState<any>(null);
    const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([]);
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Beginner');
    const [isBeginnerEligible, setIsBeginnerEligible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [lightboxEntry, setLightboxEntry] = useState<PortfolioEntry | null>(null);
    const [lightboxIdx, setLightboxIdx] = useState(0);
    const [activeTab, setActiveTab] = useState<'portfolio' | 'reviews'>('portfolio');

    useEffect(() => {
        if (workerId) fetchAll(workerId);
    }, [workerId]);

    const fetchAll = async (id: string) => {
        setLoading(true);
        try {
            const [profileRes, portfolioRes, reviewsRes] = await Promise.all([
                getUserProfile(id),
                getWorkerPortfolio(id),
                getWorkerReviews(id)
            ]);
            setWorkerData(profileRes.data?.user || profileRes.data);
            setPortfolio(portfolioRes.data || []);
            setExperienceLevel(portfolioRes.experienceLevel || 'Beginner');
            setIsBeginnerEligible(portfolioRes.isBeginnerEligible || false);
            setReviews(reviewsRes.data || []);
        } catch (err) {
            toast.error("Failed to load worker profile");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="h-96 flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={36} />
        </div>
    );

    if (!workerData) return (
        <div className="glass-card text-center py-20">
            <AlertCircle size={40} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Worker not found</p>
        </div>
    );

    const config = EXPERIENCE_LEVEL_CONFIG[experienceLevel];
    const avgRating = workerData.rating?.average || workerData.averageRating || 0;
    const totalReviews = workerData.rating?.totalReviews || 0;
    const rank = workerData.rank || 'Unranked';
    const hype = workerData.hype || 0;
    const score = workerData.score || 0;

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl space-y-6">
            {/* Back */}
            <motion.div variants={item}>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Workers
                </button>
            </motion.div>

            {/* Profile Card — LinkedIn Style */}
            <motion.div variants={item} className="glass-card overflow-hidden relative">
                {/* Cover gradient */}
                <div className={`h-24 bg-gradient-to-r ${config.color} opacity-60 absolute top-0 left-0 right-0`} />

                <div className="relative pt-10 pb-2 px-6">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-2xl border-4 border-background overflow-hidden bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl shadow-xl mb-3">
                        {workerData.profileImage
                            ? <img src={workerData.profileImage} alt={workerData.name} className="w-full h-full object-cover" />
                            : "👷"
                        }
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                            <h2 className="text-2xl font-black" style={{ fontFamily: "var(--font-heading)" }}>{workerData.name}</h2>
                            <p className="text-muted-foreground text-sm font-medium flex items-center gap-1 mt-0.5">
                                <MapPin size={12} className="text-primary" /> {workerData.location || "Location not set"}
                            </p>

                            {/* Badges row */}
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                {/* Experience level */}
                                <span className={`px-3 py-1 text-xs font-black rounded-xl bg-gradient-to-r ${config.color} text-white flex items-center gap-1.5 shadow-sm`}>
                                    {config.emoji} {experienceLevel}
                                </span>
                                {/* Rank */}
                                {rank !== 'Unranked' && (
                                    <span className={`px-3 py-1 text-xs font-black rounded-xl bg-gradient-to-r ${getRankStyle(rank)} text-white flex items-center gap-1`}>
                                        <Trophy size={11} /> {rank}
                                    </span>
                                )}
                                {/* Hype eligible */}
                                {isBeginnerEligible && (
                                    <span className="px-3 py-1 text-xs font-black rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-600 flex items-center gap-1">
                                        <Zap size={11} className="fill-orange-500" /> Hype Eligible
                                    </span>
                                )}
                                <span className="px-3 py-1 bg-success/10 text-success text-xs font-bold rounded-xl flex items-center gap-1">
                                    <CheckCircle size={11} /> Verified
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Skills */}
                    {workerData.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-4">
                            {workerData.skills.map((skill: string) => (
                                <span key={skill} className="px-2.5 py-1 bg-secondary text-foreground text-xs font-bold rounded-lg border border-border/50">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Stats row */}
                    <div className="grid grid-cols-4 gap-3 mt-5 mb-2">
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-center">
                            <div className="flex items-center justify-center gap-1 mb-0.5">
                                <Trophy size={13} className="text-primary" />
                                <span className="text-lg font-black">{score}</span>
                            </div>
                            <p className="text-[9px] font-black text-primary uppercase tracking-widest">Score</p>
                        </div>
                        <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-3 text-center">
                            <div className="flex items-center justify-center gap-1 mb-0.5">
                                <Zap size={13} className="text-orange-500" />
                                <span className="text-lg font-black text-orange-600">{hype}</span>
                            </div>
                            <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Hype</p>
                        </div>
                        <div className="bg-warning/5 border border-warning/20 rounded-xl p-3 text-center">
                            <div className="flex items-center justify-center gap-1 mb-0.5">
                                <Star size={13} className="text-warning fill-warning" />
                                <span className="text-lg font-black">{avgRating > 0 ? avgRating.toFixed(1) : "—"}</span>
                            </div>
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Rating</p>
                        </div>
                        <div className="bg-success/5 border border-success/20 rounded-xl p-3 text-center">
                            <div className="flex items-center justify-center gap-1 mb-0.5">
                                <TrendingUp size={13} className="text-success" />
                                <span className="text-lg font-black">{workerData.completedJobs || 0}</span>
                            </div>
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Jobs</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Beginner Hype Info Banner */}
            {isBeginnerEligible && (
                <motion.div variants={item} className="glass-card bg-gradient-to-r from-orange-500/10 to-amber-500/5 border-orange-500/20 p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
                        <Zap size={20} className="text-orange-500 fill-orange-500" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-orange-600">This worker is a Beginner — Hype them!</p>
                        <p className="text-xs text-muted-foreground font-medium">Beginners with fewer than 10 past works are Hype eligible. Your Hype boost accelerates their career! 🚀</p>
                    </div>
                </motion.div>
            )}

            {/* Tabs */}
            <motion.div variants={item} className="flex gap-1 bg-secondary/50 p-1 rounded-2xl w-full sm:w-fit">
                {(['portfolio', 'reviews'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            activeTab === tab
                                ? 'bg-card text-foreground shadow-sm border border-border/50'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {tab === 'portfolio' ? `Portfolio (${portfolio.length})` : `Reviews (${reviews.length})`}
                    </button>
                ))}
            </motion.div>

            {/* Portfolio Tab */}
            {activeTab === 'portfolio' && (
                <motion.div variants={item}>
                    {portfolio.length === 0 ? (
                        <div className="glass-card text-center py-16">
                            <Layers size={40} className="text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-muted-foreground font-medium">No portfolio entries yet</p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 gap-5">
                            {portfolio.map(entry => (
                                <motion.div
                                    key={entry._id}
                                    whileHover={{ y: -3 }}
                                    className="glass-card group overflow-hidden hover:border-primary/40 transition-all cursor-pointer"
                                    onClick={() => { setLightboxEntry(entry); setLightboxIdx(0); }}
                                >
                                    {/* Image */}
                                    {entry.images.length > 0 ? (
                                        <div className="relative h-44 overflow-hidden rounded-xl mb-4">
                                            <img
                                                src={entry.images[0]}
                                                alt={entry.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            {entry.images.length > 1 && (
                                                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                                                    +{entry.images.length - 1}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="h-24 bg-secondary/50 rounded-xl mb-4 flex items-center justify-center">
                                            <ImagePlus size={24} className="text-muted-foreground/40" />
                                        </div>
                                    )}

                                    <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-primary/10 text-primary uppercase tracking-widest">
                                        {entry.category}
                                    </span>
                                    <h3 className="text-base font-bold mt-2 mb-1">{entry.title}</h3>
                                    {entry.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{entry.description}</p>
                                    )}
                                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground font-medium pt-2 border-t border-border/40">
                                        {entry.location && <span className="flex items-center gap-1"><MapPin size={9} className="text-primary" /> {entry.location}</span>}
                                        {entry.completionYear && <span className="flex items-center gap-1"><Calendar size={9} className="text-primary" /> {entry.completionYear}</span>}
                                        {entry.duration && <span className="flex items-center gap-1"><Clock size={9} className="text-primary" /> {entry.duration}</span>}
                                        {entry.clientName && <span className="flex items-center gap-1"><UserIcon size={9} className="text-primary" /> {entry.clientName}</span>}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
                <motion.div variants={item} className="space-y-4">
                    {reviews.length === 0 ? (
                        <div className="glass-card text-center py-16">
                            <Star size={40} className="text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-muted-foreground font-medium">No reviews yet</p>
                        </div>
                    ) : reviews.map(review => (
                        <div key={review._id} className="glass-card">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-sm">
                                        {review.reviewerId?.name?.[0]?.toUpperCase() || "?"}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{review.reviewerId?.name || "Anonymous"}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {typeof review.jobId === 'object' ? review.jobId.title : "Job"}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    {review.notSatisfied ? (
                                        <span className="text-xs bg-destructive/10 text-destructive border border-destructive/20 px-2 py-1 rounded-lg font-black">Not Satisfied ❌</span>
                                    ) : (
                                        <div className="flex gap-0.5">
                                            {[1,2,3,4,5].map(i => (
                                                <Star key={i} size={12} className={i <= review.rating ? "text-warning fill-warning" : "text-muted-foreground/30"} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {review.comment && <p className="text-sm text-muted-foreground italic ml-11">"{review.comment}"</p>}
                            <div className="flex items-center justify-between mt-2 ml-11">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full outline outline-1 ${review.pointsAwarded > 0 ? 'bg-primary/5 text-primary outline-primary/30' : 'bg-destructive/5 text-destructive outline-destructive/30'}`}>
                                    {review.pointsAwarded > 0 ? `+${review.pointsAwarded}` : review.pointsAwarded} pts
                                </span>
                                <span className="text-[10px] text-muted-foreground/50">
                                    {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    ))}
                </motion.div>
            )}

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxEntry && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                        onClick={() => setLightboxEntry(null)}
                    >
                        <button className="absolute top-4 right-4 text-white/70 hover:text-white z-10">
                            <X size={28} />
                        </button>
                        <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
                            <img
                                src={lightboxEntry.images[lightboxIdx]}
                                alt={lightboxEntry.title}
                                className="w-full max-h-[80vh] object-contain rounded-2xl"
                            />
                            {lightboxEntry.images.length > 1 && (
                                <>
                                    <button onClick={() => setLightboxIdx(i => (i - 1 + lightboxEntry.images.length) % lightboxEntry.images.length)}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/80">
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button onClick={() => setLightboxIdx(i => (i + 1) % lightboxEntry.images.length)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/80">
                                        <ChevronRight size={20} />
                                    </button>
                                    <p className="text-center text-white/50 text-xs mt-2">{lightboxIdx + 1}/{lightboxEntry.images.length}</p>
                                </>
                            )}
                            <p className="text-white font-bold text-center mt-2">{lightboxEntry.title}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default WorkerPublicProfile;
