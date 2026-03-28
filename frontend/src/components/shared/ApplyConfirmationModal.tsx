import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Briefcase, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApplyConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    jobTitle: string;
    loading: boolean;
}

const ApplyConfirmationModal = ({ isOpen, onClose, onConfirm, jobTitle, loading }: ApplyConfirmationModalProps) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md overflow-hidden bg-card border-2 border-primary/20 shadow-2xl rounded-3xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50 bg-secondary/30">
                        <h2 className="text-xl font-black uppercase tracking-widest text-foreground flex items-center gap-3">
                            <Briefcase className="text-primary" size={24} />
                            Apply for Job
                        </h2>
                        <button 
                            onClick={onClose}
                            disabled={loading}
                            className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors disabled:opacity-50"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-8 pb-10 text-center space-y-4 relative">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                        <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-8 ring-primary/5">
                            <CheckCircle size={40} className="text-primary" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                            Confirm Application
                        </h3>
                        <p className="text-muted-foreground font-medium text-sm px-4">
                            You are about to apply for <strong className="text-foreground">"{jobTitle}"</strong>.
                            Are you sure you want to proceed?
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-secondary/50 border-t border-border/50 flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 font-bold h-12 rounded-xl text-muted-foreground hover:bg-secondary border-border/50 uppercase tracking-widest text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-1 font-black h-12 rounded-xl gradient-primary border-0 text-white uppercase tracking-widest text-xs shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : "Yes, Apply Now"}
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ApplyConfirmationModal;
