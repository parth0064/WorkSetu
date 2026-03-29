import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { 
    User as UserIcon, Phone, MapPin, Mail, Award, CheckCircle, 
    Loader2, Edit2, Camera, Star, Trophy, TrendingUp, Zap, Layers, Plus, ImagePlus
} from "lucide-react";
import EditProfileModal from "@/components/worker/EditProfileModal";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { uploadProfilePhoto } from "@/services/userService";
import { getWorkerReviews, ReviewData } from "@/services/reviewService";
import { getMyPortfolio, EXPERIENCE_LEVEL_CONFIG, PortfolioEntry, ExperienceLevel } from "@/services/portfolioService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const getRankStyle = (rank: string) => {
    const text = rank.toLowerCase();
    if (text.includes('grandmaster')) return 'from-purple-600 to-indigo-600 text-purple-100 border-purple-400 shadow-purple-500/20';
    if (text.includes('master'))      return 'from-fuchsia-500 to-pink-600 text-pink-50 border-pink-400 shadow-pink-500/20';
    if (text.includes('diamond'))     return 'from-cyan-400 to-blue-500 text-cyan-50 border-cyan-300 shadow-cyan-500/20';
    if (text.includes('platinum'))    return 'from-emerald-400 to-teal-500 text-teal-50 border-emerald-300 shadow-teal-500/20';
    if (text.includes('gold'))        return 'from-yellow-400 to-orange-500 text-yellow-50 border-yellow-300 shadow-yellow-500/20';
    if (text.includes('silver'))      return 'from-slate-300 to-slate-400 text-slate-800 border-slate-300 shadow-slate-500/20';
    if (text.includes('bronze'))      return 'from-amber-600 to-orange-700 text-orange-50 border-orange-500 shadow-orange-500/20';
    return 'from-stone-500 to-stone-600 text-white border-stone-500';
};

const WorkerProfile = () => {
  const { t } = useLanguage();
  const { user, loading, setUser } = useAuth();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Beginner');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userId = user?.id || user?._id;
    if (userId) {
        fetchReviews(userId);
        fetchPortfolio();
    }
  }, [user?.id, user?._id]);

  const fetchReviews = async (userId: string) => {
    setReviewsLoading(true);
    try {
        const res = await getWorkerReviews(userId);
        setReviews(res.data || []);
    } catch (err) {
        // silently fail
    } finally {
        setReviewsLoading(false);
    }
  };

  const fetchPortfolio = async () => {
    try {
        const res = await getMyPortfolio();
        setPortfolio(res.data || []);
        setExperienceLevel(res.experienceLevel || 'Beginner');
    } catch {
        // silently fail
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file.");
        return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploadLoading(true);
    try {
        const response = await uploadProfilePhoto(formData);
        if (response.success) {
            toast.success("Profile photo updated successfully!");
            if (setUser && user) {
                setUser({ ...user, profileImage: response.data });
            }
        }
    } catch (error: any) {
        console.error("Upload Error:", error);
        toast.error(error.response?.data?.message || "Failed to upload photo.");
    } finally {
        setUploadLoading(false);
    }
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!user) return <div className="p-8 text-center text-muted-foreground">Please log in to view your profile.</div>;

  const avgRating = user.rating?.average || user.averageRating || 0;
  const totalReviews = user.rating?.totalReviews || 0;
  const score = user.score || 0;
  const rank = user.rank || 'Unranked';
  const hype = user.hype || 0;

  // Next rank threshold calculation
  const getNextRankThreshold = (currentScore: number) => {
      if (currentScore < 16) return 16;   // To Silver
      if (currentScore < 41) return 41;   // To Gold
      if (currentScore < 81) return 81;   // To Platinum
      if (currentScore < 151) return 151; // To Diamond
      if (currentScore < 251) return 251; // To Master
      if (currentScore < 400) return 400; // To Grandmaster
      return null;
  };
  
  const nextRankThreshold = getNextRankThreshold(score);
  const getProgressPct = () => {
      if (!nextRankThreshold) return 100;
      
      // Calculate progress WITHIN the current tier.
      let currentFloor = 0;
      if (score >= 251) currentFloor = 251;
      else if (score >= 151) currentFloor = 151;
      else if (score >= 81) currentFloor = 81;
      else if (score >= 41) currentFloor = 41;
      else if (score >= 16) currentFloor = 16;
      else if (score >= 1) currentFloor = 1;
      
      const tierSize = nextRankThreshold - currentFloor;
      const progressInTier = score - currentFloor;
      return Math.min(100, (progressInTier / tierSize) * 100);
  };
  const progressPct = getProgressPct();

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black mb-1" style={{ fontFamily: "var(--font-heading)" }}>{t("profile")}</h1>
          <p className="text-muted-foreground text-sm font-medium">Manage your personal details and verifications.</p>
        </div>
        <Button 
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-2 font-bold shadow-lg hover:shadow-xl transition-all"
        >
          <Edit2 size={16} />
          Edit Profile
        </Button>
      </motion.div>

      {/* Profile Card */}
      <motion.div variants={item} className="glass-card shadow-sm">
        <div className="flex flex-col sm:flex-row gap-6 mb-8 items-center sm:items-start text-center sm:text-left">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl shadow-xl border-4 border-background overflow-hidden relative">
              {user.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                "👷"
              )}
              {uploadLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin text-white" />
                </div>
              )}
            </div>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all ring-4 ring-background z-10"
                title="Change Photo"
            >
                <Camera size={14} />
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70" style={{ fontFamily: "var(--font-heading)" }}>{user.name}</h2>
            <p className="text-muted-foreground font-medium flex items-center justify-center sm:justify-start gap-2 mt-1">
              <MapPin size={14} className="text-primary" /> {user.location || "Location not set"}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
              <span className="px-3 py-1 bg-success/10 text-success text-xs font-bold rounded-lg flex items-center gap-1.5"><CheckCircle size={12} /> ID Verified</span>
              {rank !== 'Unranked' && (
                <span className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 bg-gradient-to-r ${getRankStyle(rank)}`}>
                    <Trophy size={14} /> {rank}
                </span>
              )}
              {/* Experience Level badge */}
              {(() => {
                const cfg = EXPERIENCE_LEVEL_CONFIG[experienceLevel];
                return (
                  <span className={`px-3 py-1.5 text-xs font-black rounded-lg flex items-center gap-1.5 bg-gradient-to-r ${cfg.color} text-white`}>
                    {cfg.emoji} {experienceLevel}
                  </span>
                );
              })()}
              {/* Hype eligible banner */}
              {experienceLevel === 'Beginner' && (
                <span className="px-3 py-1.5 text-xs font-black rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-600 flex items-center gap-1.5">
                  <Zap size={12} className="fill-orange-500" /> Hype Eligible
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground pb-2 border-b border-border">Contact Information</h3>
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors"><Phone size={16} className="text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest leading-none mb-1">Phone</p>
                <p className="font-bold">{user.phone || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors"><Mail size={16} className="text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest leading-none mb-1">Email</p>
                <p className="font-bold">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground pb-2 border-b border-border">Skills & Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {user.skills?.length ? user.skills.map((skill: string) => (
                <span key={skill} className="px-3 py-1.5 bg-secondary text-foreground text-xs font-bold rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-default">
                  {skill}
                </span>
              )) : (
                <p className="text-xs text-muted-foreground italic">No skills listed yet.</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Reputation Stats ──────────────────────────────────────────────────── */}
      <motion.div variants={item} className="glass-card">
        <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground pb-3 border-b border-border mb-6 flex items-center gap-2">
            <Trophy size={16} className="text-primary" /> Reputation & Stats
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {/* Score */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                    <Trophy size={16} className="text-primary" />
                    <span className="text-2xl font-black text-foreground">{score}</span>
                </div>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Final Score</p>
                <p className="text-xs text-muted-foreground font-medium">Global Ranking</p>
            </div>

            {/* Hype */}
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                    <Zap size={16} className="text-orange-500 fill-orange-500" />
                    <span className="text-2xl font-black text-orange-600">{hype}</span>
                </div>
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Hype Boosts</p>
                <p className="text-xs text-muted-foreground font-medium">Community Vouch</p>
            </div>

            {/* Rating */}
            <div className="bg-warning/5 border border-warning/20 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                    <Star size={16} className="text-warning fill-warning" />
                    <span className="text-2xl font-black text-foreground">{avgRating > 0 ? avgRating.toFixed(1) : "—"}</span>
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Avg Rating</p>
                <p className="text-xs text-muted-foreground font-medium">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
            </div>

            {/* Jobs */}
            <div className="bg-success/5 border border-success/20 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp size={16} className="text-success" />
                    <span className="text-2xl font-black text-foreground">{user.completedJobs || 0}</span>
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Jobs Done</p>
                <p className="text-xs text-muted-foreground font-medium">Completed work</p>
            </div>
        </div>


      </motion.div>

      {/* ── Portfolio Preview ──────────────────────────────────────────────── */}
      <motion.div variants={item} className="glass-card mb-6">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-6">
            <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Layers size={16} className="text-primary" /> My Portfolio
            </h3>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard/worker/portfolio')}
                className="text-primary font-bold text-xs hover:bg-primary/10 h-7 px-3 rounded-lg"
            >
                View Full
            </Button>
        </div>

        {portfolio.length === 0 ? (
            <div className="bg-secondary/30 rounded-2xl p-6 text-center border border-border/40">
                <ImagePlus size={28} className="mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground mb-3 font-medium">No portfolio items added yet.</p>
                <Button 
                    onClick={() => navigate('/dashboard/worker/portfolio')}
                    size="sm" 
                    className="gradient-primary h-8 font-bold text-xs gap-1 shadow-md border-0"
                >
                    <Plus size={14} /> Add First Work
                </Button>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolio.slice(0, 3).map(entry => (
                     <div key={entry._id} className="group relative overflow-hidden rounded-2xl bg-secondary/20 border border-border/40 hover:border-primary/40 transition-colors cursor-pointer" onClick={() => navigate('/dashboard/worker/portfolio')}>
                        <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-sm text-[9px] font-black text-white uppercase tracking-widest">
                            {entry.category}
                        </div>
                        {entry.images.length > 0 ? (
                            <img src={entry.images[0]} alt={entry.title} className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                            <div className="w-full h-32 bg-secondary/50 flex items-center justify-center">
                                <ImagePlus size={24} className="text-muted-foreground/30" />
                            </div>
                        )}
                        <div className="p-3">
                            <h4 className="font-bold text-sm leading-tight mb-1 truncate">{entry.title}</h4>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                {entry.completionYear} {entry.location && `• ${entry.location}`}
                            </p>
                        </div>
                     </div>
                ))}
            </div>
        )}
      </motion.div>

      {/* ── Recent Reviews ───────────────────────────────────────────────────── */}
      <motion.div variants={item} className="glass-card">
        <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground pb-3 border-b border-border mb-6 flex items-center gap-2">
            <Star size={16} className="text-warning" /> Client Reviews
        </h3>

        {reviewsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
        ) : reviews.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6 italic">No reviews yet. Complete jobs to earn ratings!</p>
        ) : (
            <div className="space-y-4">
                {reviews.slice(0, 5).map((review) => (
                    <div key={review._id} className="bg-secondary/30 rounded-2xl p-4 border border-border/40">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-sm">
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
                        {review.comment && (
                            <p className="text-sm text-muted-foreground italic ml-10">"{review.comment}"</p>
                        )}
                        <div className="flex items-center justify-between mt-2 ml-10">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full outline outline-1 ${review.pointsAwarded > 0 ? 'bg-primary/5 text-primary outline-primary/30' : 'bg-destructive/5 text-destructive outline-destructive/30'}`}>
                                {review.pointsAwarded > 0 ? `+${review.pointsAwarded}` : review.pointsAwarded} Score Pts
                            </span>
                            <span className="text-[10px] text-muted-foreground/50">
                                {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </motion.div>

      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />
    </motion.div>
  );
};

export default WorkerProfile;
