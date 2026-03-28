import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { login, googleLogin, user, loading: authLoading } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === "worker") navigate("/dashboard/worker");
      else if (user.role === "constructor") navigate("/dashboard/constructor");
      else navigate("/dashboard/client");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill all fields");
    
    setIsSubmitting(true);
    try {
      await login({ email, password });
      toast.success("Logged in successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (response: any) => {
    try {
      await googleLogin(response.credential || "");
      toast.success("Google Login successful!");
    } catch (err: any) {
      toast.error("Google login failed");
    }
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background">
      {/* Left - Visual Panel */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center p-12">
        <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-5xl font-extrabold text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>WorkSetu</h1>
            <p className="text-xl text-white/70">{t("tagline")}</p>
          </motion.div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>{t("welcomeBack")}</h2>
          <p className="text-muted-foreground mb-8 text-sm">{t("loginToContinue")}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("email")}</Label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="pl-11 h-12 rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-11 pr-11 h-12 rounded-xl" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl gradient-primary font-bold text-white shadow-lg">
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null} {t("login")}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">{t("or")}</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google login error")}
              theme="outline"
              size="large"
              shape="pill"
              text="continue_with"
            />
          </div>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            {t("noAccount")}{" "}<Link to="/signup" className="text-primary font-bold hover:underline">{t("signup")}</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
