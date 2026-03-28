import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, ThumbsDown, Send, CheckCircle, Loader2, MessageSquare, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { submitFeedback } from "@/services/reviewService";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobId: string;
    jobTitle: string;
    workerName: string;
    onSuccess: () => void; // called after feedback submitted so parent can refresh
}

const backdrop = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
};

const modal = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, damping: 22, stiffness: 300 } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
};

const FeedbackModal = ({ isOpen, onClose, jobId, jobTitle, workerName, onSuccess }: FeedbackModalProps) => {
    const [hoveredStar, setHoveredStar] = useState(0);
    const [selectedRating, setSelectedRating] = useState(0);
    const [notSatisfied, setNotSatisfied] = useState(false);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [completedEarly, setCompletedEarly] = useState(false);
    const [hypeAwarded, setHypeAwarded] = useState(false);

    const handleNotSatisfied = () => {
        setNotSatisfied(true);
        setSelectedRating(0);
        setHoveredStar(0);
        setCompletedEarly(false);
        setHypeAwarded(false);
    };

    const handleStarClick = (star: number) => {
        setSelectedRating(star);
        setNotSatisfied(false);
    };

    const handleSubmit = async () => {
        if (!notSatisfied && selectedRating === 0) {
            toast.error("Please select a star rating or mark as Not Satisfied.");
            return;
        }

        setLoading(true);
        try {
            await submitFeedback({
                jobId,
                rating: notSatisfied ? 0 : selectedRating,
                notSatisfied,
                completedEarly: notSatisfied ? false : completedEarly,
                hypeAwarded: notSatisfied ? false : hypeAwarded,
                comment: comment.trim()
            });

            setSubmitted(true);
            toast.success("Feedback submitted! You can now release the payment.", {
                duration: 4000,
                icon: "🎉"
            });

            // Give success screen time to show before calling parent
            setTimeout(() => {
                onSuccess();
            }, 1800);

        } catch (error: any) {
            const msg = error.response?.data?.message || "Failed to submit feedback.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const starLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];
    const displayStar = hoveredStar || selectedRating;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="feedback-backdrop"
                    variants={backdrop}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
                    onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
                >
                    <motion.div
                        key="feedback-modal"
                        variants={modal}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="w-full max-w-md relative"
                    >
                        <div className="glass-card overflow-hidden border border-border/40 shadow-2xl">
                            {/* Decorative gradient top bar */}
                            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />

                            <AnimatePresence mode="wait">
                                {submitted ? (
                                    // ── Success State ──────────────────────────────────
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-10 flex flex-col items-center gap-5 text-center"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", damping: 15, stiffness: 300, delay: 0.1 }}
                                            className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center"
                                        >
                                            <CheckCircle className="w-12 h-12 text-success" strokeWidth={2} />
                                        </motion.div>
                                        <div>
                                            <h3 className="text-2xl font-black tracking-tight mb-2">Feedback Sent! 🎉</h3>
                                            <p className="text-muted-foreground text-sm">
                                                You can now <span className="text-success font-bold">Release the Payment</span> to {workerName}.
                                            </p>
                                        </div>
                                        <div className="flex gap-2 text-3xl">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <motion.span
                                                    key={i}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.08 }}
                                                >
                                                    {i <= selectedRating ? "⭐" : ""}
                                                </motion.span>
                                            ))}
                                            {notSatisfied && <span className="text-3xl">❌</span>}
                                        </div>
                                    </motion.div>
                                ) : (
                                    // ── Form State ────────────────────────────────────
                                    <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-6">
                                            <div>
                                                <h2 className="text-xl font-black tracking-tight">Rate the Work</h2>
                                                <p className="text-muted-foreground text-sm mt-1">
                                                    How was <span className="font-bold text-foreground">{workerName}</span>'s work on
                                                </p>
                                                <p className="text-primary font-bold text-sm truncate max-w-[240px]">"{jobTitle}"</p>
                                            </div>
                                            <button
                                                onClick={onClose}
                                                disabled={loading}
                                                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>

                                        {/* Star Rating */}
                                        <div className="flex flex-col items-center gap-4 mb-6">
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <motion.button
                                                        key={star}
                                                        whileHover={{ scale: 1.2 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        disabled={notSatisfied}
                                                        onClick={() => handleStarClick(star)}
                                                        onMouseEnter={() => !notSatisfied && setHoveredStar(star)}
                                                        onMouseLeave={() => setHoveredStar(0)}
                                                        className={`transition-all duration-150 ${notSatisfied ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
                                                    >
                                                        <Star
                                                            size={40}
                                                            strokeWidth={1.5}
                                                            className={`transition-colors duration-150 ${
                                                                star <= displayStar
                                                                    ? "text-warning fill-warning"
                                                                    : "text-muted-foreground/30"
                                                            }`}
                                                        />
                                                    </motion.button>
                                                ))}
                                            </div>

                                            {/* Star label */}
                                            <AnimatePresence mode="wait">
                                                {displayStar > 0 && !notSatisfied && (
                                                    <motion.div
                                                        key={displayStar}
                                                        initial={{ opacity: 0, y: -5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0 }}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <span className="text-xl">{["", "😞", "😐", "🙂", "😊", "🤩"][displayStar]}</span>
                                                        <span className="font-black text-foreground text-sm uppercase tracking-widest">
                                                            {starLabels[displayStar]}
                                                        </span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Divider */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex-1 h-px bg-border/40" />
                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">or</span>
                                            <div className="flex-1 h-px bg-border/40" />
                                        </div>

                                        {/* Not Satisfied Button */}
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleNotSatisfied}
                                            className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border-2 font-black text-sm uppercase tracking-widest transition-all duration-200 mb-6 ${
                                                notSatisfied
                                                    ? "bg-destructive/15 border-destructive text-destructive shadow-lg shadow-destructive/10"
                                                    : "border-border/50 text-muted-foreground hover:border-destructive/50 hover:text-destructive"
                                            }`}
                                        >
                                            <ThumbsDown size={18} />
                                            Not Satisfied ❌
                                            {notSatisfied && <span className="text-[10px] bg-destructive/20 px-2 py-0.5 rounded-full">-1 Point</span>}
                                        </motion.button>

                                        {/* Gamification Bonuses */}
                                        {!notSatisfied && selectedRating > 0 && (
                                            <div className="flex flex-col gap-3 mb-6">
                                                <button
                                                    onClick={() => setCompletedEarly(!completedEarly)}
                                                    className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                                                        completedEarly 
                                                        ? "border-primary/50 bg-primary/10 text-primary font-bold" 
                                                        : "border-border/40 text-muted-foreground hover:bg-secondary"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={16} className={completedEarly ? "text-primary" : ""} />
                                                        <span className="text-sm">Completed Before Time?</span>
                                                    </div>
                                                    {completedEarly && <span className="text-[10px] bg-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-black">+2 Pts</span>}
                                                </button>

                                                <button
                                                    onClick={() => setHypeAwarded(!hypeAwarded)}
                                                    className={`w-full flex relative items-center justify-between p-3 rounded-xl border-2 transition-all overflow-hidden ${
                                                        hypeAwarded 
                                                        ? "border-orange-500/50 bg-orange-500/10 text-orange-500 font-bold" 
                                                        : "border-border/40 text-muted-foreground hover:bg-secondary"
                                                    }`}
                                                >
                                                    {hypeAwarded && (
                                                        <motion.div 
                                                            layoutId="hype-bg" 
                                                            className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-500/20 opacity-50"
                                                        />
                                                    )}
                                                    <div className="flex items-center gap-2 relative z-10">
                                                        <Zap size={16} className={hypeAwarded ? "text-orange-500 fill-orange-500" : ""} />
                                                        <span className="text-sm">HYPE this Worker! 🔥</span>
                                                    </div>
                                                    {hypeAwarded && <span className="text-[10px] bg-orange-500/20 text-orange-600 px-2 py-0.5 rounded-full uppercase tracking-wider font-black relative z-10">Hype Boost</span>}
                                                </button>
                                                <p className="text-[10px] text-muted-foreground/60 text-center leading-tight px-4">
                                                    Hyping a worker significantly boosts their score, helping talented new workers grow without prior networking!
                                                </p>
                                            </div>
                                        )}

                                        {/* Comment */}
                                        <div className="mb-6">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-2">
                                                <MessageSquare size={12} /> Optional Comment
                                            </label>
                                            <textarea
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                placeholder="Share details about the work quality..."
                                                maxLength={400}
                                                rows={3}
                                                className="w-full bg-secondary/50 border border-border/40 rounded-xl px-4 py-3 text-sm font-medium resize-none placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                                            />
                                            <p className="text-right text-[10px] text-muted-foreground/40 mt-1">{comment.length}/400</p>
                                        </div>

                                        {/* Submit Button */}
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={loading || (!notSatisfied && selectedRating === 0)}
                                            className="w-full gradient-primary border-0 rounded-2xl py-6 font-black uppercase tracking-widest text-base shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                        >
                                            {loading ? (
                                                <><Loader2 size={20} className="animate-spin" /> Submitting...</>
                                            ) : (
                                                <><Send size={18} /> Submit Feedback</>
                                            )}
                                        </Button>

                                        <p className="text-center text-[10px] text-muted-foreground/40 font-medium mt-3 uppercase tracking-wider">
                                            Payment unlocks after feedback is submitted
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FeedbackModal;
