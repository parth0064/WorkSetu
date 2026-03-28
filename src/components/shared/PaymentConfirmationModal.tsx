import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Loader2, AlertCircle, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PaymentConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (extraExpense: number) => Promise<void>;
    baseWage: number;
    workerName: string;
    loading: boolean;
}

const PaymentConfirmationModal = ({ isOpen, onClose, onConfirm, baseWage, workerName, loading }: PaymentConfirmationModalProps) => {
    const [extraExpenseStr, setExtraExpenseStr] = useState("");
    const extraExpense = parseFloat(extraExpenseStr) || 0;
    const totalAmount = baseWage + (extraExpense >= 0 ? extraExpense : 0);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (extraExpense < 0) return;
        onConfirm(extraExpense);
    };

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
                    className="relative w-full max-w-lg overflow-hidden bg-card border-2 border-primary/20 shadow-2xl rounded-3xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50 bg-secondary/30">
                        <h2 className="text-xl font-black uppercase tracking-widest text-foreground flex items-center gap-3">
                            <CreditCard className="text-primary" size={24} />
                            Finalize Payment
                        </h2>
                        <button 
                            onClick={onClose}
                            disabled={loading}
                            className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-8 space-y-6">
                        <p className="text-muted-foreground text-sm font-medium">
                            Review the final payment details for <strong className="text-foreground">{workerName}</strong>. You can add extra compensation for materials or bonuses here before releasing the funds.
                        </p>

                        <div className="space-y-4">
                            {/* Base Wage */}
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border/50">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Base Wage in Escrow</p>
                                    <p className="font-bold text-foreground">Standard Job Payment</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black tracking-tighter">₹{baseWage}</p>
                                </div>
                            </div>

                            {/* Extra Expense Input */}
                            <div className="flex items-start justify-between p-4 rounded-2xl bg-primary/5 border border-primary/20 focus-within:border-primary/50 transition-colors">
                                <div className="flex-1 mr-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1 flex items-center gap-1">
                                        <PlusCircle size={10} /> Additional Expenses
                                    </p>
                                    <p className="text-xs font-medium text-muted-foreground">e.g. Paint, Materials, Bonus (Optional)</p>
                                </div>
                                <div className="w-1/3">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">₹</span>
                                        <Input 
                                            type="number" 
                                            min="0"
                                            placeholder="0"
                                            value={extraExpenseStr}
                                            onChange={(e) => setExtraExpenseStr(e.target.value)}
                                            className="pl-8 text-right font-black text-lg h-12 bg-background border-border"
                                            disabled={loading}
                                        />
                                    </div>
                                    {extraExpense < 0 && (
                                        <p className="text-[10px] text-destructive mt-1 font-bold absolute">Cannot be negative</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Total Display */}
                        <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between">
                            <h3 className="text-lg font-black uppercase tracking-widest">Total Transfer</h3>
                            <div className="text-right">
                                <p className="text-4xl font-black text-primary tracking-tighter">₹{totalAmount}</p>
                            </div>
                        </div>
                        
                        {extraExpense > 0 && (
                            <div className="bg-warning/10 border border-warning/20 p-3 rounded-xl flex gap-3 text-warning-foreground mt-2">
                                <AlertCircle size={16} className="text-warning shrink-0 mt-0.5" />
                                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                    The base wage (₹{baseWage}) will be pulled from escrow. The extra expense (₹{extraExpense}) will be deducted directly from your available balance.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-secondary/50 border-t border-border/50 flex gap-3 mt-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 font-bold h-14 rounded-xl text-muted-foreground hover:bg-secondary border-border/50 uppercase tracking-widest text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={loading || extraExpense < 0}
                            className="flex-1 font-black h-14 rounded-xl gradient-primary border-0 text-white uppercase tracking-widest text-xs shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Confirm Payment"}
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PaymentConfirmationModal;
