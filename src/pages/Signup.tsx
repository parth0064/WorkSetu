import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, User, Loader2, MapPin, Phone } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { toast } from "sonner";

const Signup = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { register, googleLogin, user, loading: authLoading } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    phone: "",
    location: ""
  });

  useEffect(() => {
    if (user) {
      if (user.role === "worker") navigate("/dashboard/worker");
      else if (user.role === "constructor") navigate("/dashboard/constructor");
      else navigate("/dashboard/client");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  const handleGoogleSuccess = async (response: any) => {
    try {
      await googleLogin(response.credential || "");
      toast.success("Google Signup successful!");
    } catch (err: any) {
      toast.error("Google signup failed");
    }
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>{t("createAccount")}</h2>
          <p className="text-muted-foreground mb-8 text-sm">{t("signupToGetStarted")}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">{t("name")}</Label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="pl-9 h-11 rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">{t("phone") || "Phone"}</Label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="pl-9 h-11 rounded-xl" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">{t("email")}</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="pl-9 h-11 rounded-xl" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location">{t("location") || "Location"}</Label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input id="location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="pl-9 h-11 rounded-xl" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role">{t("selectRole") || "Select Role"}</Label>
              <select 
                title="role"
                value={formData.role} 
                onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                className="w-full h-11 rounded-xl bg-secondary/50 border border-border px-3 text-sm focus:outline-none focus:border-primary"
              >
                <option value="user">Homeowner</option>
                <option value="worker">Worker</option>
                <option value="constructor">Constructor</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type={showPass ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="pl-9 pr-9 h-11 rounded-xl" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl gradient-primary font-bold text-white shadow-lg">
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null} {t("signup")}
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
              onError={() => toast.error("Google signup error")}
              theme="outline"
              size="large"
              shape="pill"
              text="continue_with"
            />
          </div>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            {t("haveAccount")}{" "}<Link to="/login" className="text-primary font-bold hover:underline">{t("login")}</Link>
          </p>
        </motion.div>
      </div>

      {/* Right - Visual Panel */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center p-12">
        <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-md text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
            <h1 className="text-5xl font-extrabold mb-4" style={{ fontFamily: "var(--font-heading)" }}>WorkSetu</h1>
            <p className="text-xl text-white/70 mb-10">{t("tagline")}</p>
            <div className="space-y-4">
              {["verifiedProfiles", "trustedNetwork", "ratingSystem"].map((key, i) => (
                <motion.div key={key} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-sm font-bold">✓</div>
                  <span className="text-sm font-medium">{t(key)}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
