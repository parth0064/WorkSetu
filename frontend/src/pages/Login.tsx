import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, Loader2, User, Phone, MapPin } from "lucide-react";
import authBg from "@/assets/auth-bg.jpg";
import { toast } from "sonner";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const { login, register, user, loading: authLoading } = useAuth();

    const [isLogin, setIsLogin] = useState(location.pathname !== "/signup");
    const [showPass, setShowPass] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "client",
        phone: "",
        location: ""
    });

    useEffect(() => {
        setIsLogin(location.pathname !== "/signup");
    }, [location.pathname]);

    useEffect(() => {
        if (user) {
            if (user.role === "worker") navigate("/dashboard/worker");
            else if (user.role === "contractor") navigate("/dashboard/contractor");
            else navigate("/dashboard/client");
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLogin) {
            if (!formData.email || !formData.password) return toast.error("Please fill all fields");
            setIsSubmitting(true);
            try {
                await login({ email: formData.email, password: formData.password });
                toast.success("Logged in successfully!");
            } catch (err: any) {
                toast.error(err.response?.data?.message || "Login failed");
            } finally {
                setIsSubmitting(false);
            }
        } else {
            if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.location) {
                return toast.error("Please fill all fields");
            }
            setIsSubmitting(true);
            try {
                await register(formData);
                toast.success("Account created successfully!");
            } catch (err: any) {
                toast.error(err.response?.data?.message || "Signup failed");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    if (authLoading) return (
        <div className="h-screen flex items-center justify-center bg-background">
            <Loader2 className="animate-spin text-primary" size={32} />
        </div>
    );

    return (
        <div className="min-h-[100svh] flex items-center justify-center bg-background relative overflow-hidden p-4 sm:p-6 lg:p-8">
            {/* Full Screen Background with Cinematic Layering */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                <img src={authBg} alt="WorkSetu Workforce" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-background/30 dark:bg-background/70 backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/90" />
            </div>

            {/* Centered Glass Form Container */}
            <div className="relative z-10 w-full max-w-lg">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <div className="bg-card/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-primary/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] p-8 sm:p-10 rounded-[2rem] space-y-8 relative overflow-hidden">
                        {/* Decorative internal glows */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="relative z-10">
                        {/* Logo & Title */}
                        <div className="text-center">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                                <span className="text-2xl">👷</span>
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-widest text-primary/60 mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                                WorkSetu
                            </h2>
                            <h3 className="text-3xl font-black text-foreground mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                                {isLogin ? "Welcome Back" : "Create Account"}
                            </h3>
                            <p className="text-sm text-muted-foreground font-medium">
                                {isLogin ? "Sign in to access your dashboard" : "Join the largest network of skilled workers"}
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <AnimatePresence mode="wait">
                                {!isLogin && (
                                    <motion.div
                                        key="signup-fields"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4 overflow-hidden"
                                    >
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold uppercase tracking-widest ml-1 opacity-70">Name</Label>
                                                <div className="relative">
                                                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                        placeholder="Full Name"
                                                        className="pl-11 h-12 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 focus:ring-primary/50 transition-all focus:ring-2"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold uppercase tracking-widest ml-1 opacity-70">Phone</Label>
                                                <div className="relative">
                                                    <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                        placeholder="Phone"
                                                        className="pl-11 h-12 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 focus:ring-primary/50 transition-all focus:ring-2"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold uppercase tracking-widest ml-1 opacity-70">Location</Label>
                                            <div className="relative">
                                                <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    value={formData.location}
                                                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                                                    placeholder="e.g. Mumbai, India"
                                                    className="pl-11 h-12 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 focus:ring-primary/50 transition-all focus:ring-2"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold uppercase tracking-widest ml-1 opacity-70">I am a...</Label>
                                            <select
                                                value={formData.role}
                                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                                className="w-full h-12 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 focus:ring-primary/50 transition-all px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                                            >
                                                <option value="client">Homeowner / Client</option>
                                                <option value="worker">Worker</option>
                                                <option value="contractor">Contractor</option>
                                            </select>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-widest ml-1 opacity-70">Email Address</Label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        placeholder="email@example.com"
                                        className="pl-11 h-12 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 focus:ring-primary/50 transition-all focus:ring-2"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-widest ml-1 opacity-70">Password</Label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type={showPass ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        placeholder="Min. 6 characters"
                                        className="pl-11 pr-11 h-12 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 focus:ring-primary/50 transition-all focus:ring-2"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-14 rounded-2xl gradient-primary border-0 text-white font-black text-lg transition-all active:scale-95 shadow-xl mt-2"
                            >
                                {isSubmitting && <Loader2 className="animate-spin mr-2" size={20} />}
                                {isLogin ? "Sign In" : "Create Account"}
                            </Button>
                        </form>

                        {/* Toggle Login / Signup */}
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground font-medium">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                                <button
                                    onClick={() => navigate(isLogin ? "/signup" : "/login")}
                                    className="text-primary font-black hover:underline underline-offset-4"
                                >
                                    {isLogin ? "Create Account" : "Sign In"}
                                </button>
                            </p>
                        </div>

                        <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                            By continuing, you agree to WorkSetu's{" "}
                            <span className="underline font-bold">Terms of Service</span> and{" "}
                            <span className="underline font-bold">Privacy Policy</span>.
                        </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
