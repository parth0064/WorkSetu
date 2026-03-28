import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  HardHat, Building2, Home, ArrowRight, ArrowLeft, Lock, Eye, EyeOff,
  Loader2, Check, Globe, Phone, MapPin, Sparkles
} from "lucide-react";
import { toast } from "sonner";

const roleOptions = [
  { key: "worker", apiValue: "worker", icon: HardHat, emoji: "👷", color: "from-amber-500 to-orange-500", bg: "bg-amber-500/10" },
  { key: "contractor", apiValue: "constructor", icon: Building2, emoji: "🏗️", color: "from-blue-500 to-indigo-500", bg: "bg-blue-500/10" },
  { key: "homeowner", apiValue: "user", icon: Home, emoji: "🏠", color: "from-emerald-500 to-green-500", bg: "bg-emerald-500/10" },
];

const languages = [
  { code: "en" as const, name: "English", native: "English", flag: "🇬🇧" },
  { code: "hi" as const, name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "mr" as const, name: "Marathi", native: "मराठी", flag: "🇮🇳" },
];

const steps = [
  { id: 1, title: "Choose Role", emoji: "👤" },
  { id: 2, title: "Set Password", emoji: "🔐" },
  { id: 3, title: "Language", emoji: "🌐" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { t, setLang } = useLanguage();
  const { user, completeOnboarding, logout } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedLang, setSelectedLang] = useState<"en" | "hi" | "mr">("en");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleNext = () => {
    if (currentStep === 1 && !selectedRole) {
      toast.error("Please select a role to continue");
      return;
    }
    if (currentStep === 2) {
      if (!password || password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleComplete = async () => {
    if (!selectedRole) return;

    setIsSubmitting(true);
    try {
      const roleData = roleOptions.find((r) => r.key === selectedRole);
      await completeOnboarding({
        role: roleData?.apiValue || "user",
        password,
        language: selectedLang,
        phone: phone || undefined,
        location: location || undefined,
      });

      // Set the language in context
      setLang(selectedLang);

      toast.success("Welcome to WorkSetu! 🎉");

      // Navigate to the correct dashboard
      const role = roleData?.apiValue;
      if (role === "worker") navigate("/dashboard/worker");
      else if (role === "constructor") navigate("/dashboard/constructor");
      else navigate("/dashboard/client");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercent = (currentStep / 3) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute top-10 right-10 w-[200px] h-[200px] rounded-full bg-primary/3 blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            <Sparkles size={16} />
            Welcome, {user?.name?.split(" ")[0] || "there"}!
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            Let's set up your account
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Just {3 - currentStep + 1} quick step{3 - currentStep + 1 !== 1 ? "s" : ""} to get started
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-2">
                <motion.div
                  animate={{
                    scale: currentStep === step.id ? 1.1 : 1,
                    backgroundColor: currentStep >= step.id ? "hsl(var(--primary))" : "hsl(var(--muted))",
                  }}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                  style={{ color: currentStep >= step.id ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))" }}
                >
                  {currentStep > step.id ? <Check size={16} /> : step.emoji}
                </motion.div>
                <span className={`text-xs font-medium hidden sm:block ${currentStep >= step.id ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full rounded-full gradient-primary"
            />
          </div>
        </div>

        {/* Step content */}
        <div className="glass rounded-2xl p-8 min-h-[340px] flex flex-col">
          <AnimatePresence mode="wait">
            {/* STEP 1: Role Selection */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                  {t("selectRole")}
                </h2>
                <p className="text-sm text-muted-foreground mb-6">{t("chooseHowToUse")}</p>

                <div className="grid gap-3">
                  {roleOptions.map((role) => {
                    const isSelected = selectedRole === role.key;
                    return (
                      <motion.button
                        key={role.key}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedRole(role.key)}
                        className={`relative flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-300 border-2 ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-lg"
                            : "border-transparent bg-secondary/30 hover:bg-secondary/50"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center text-2xl shadow-md`}>
                          {role.emoji}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-base">{t(role.key)}</h3>
                          <p className="text-xs text-muted-foreground">{t(`${role.key}Desc`)}</p>
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-7 h-7 rounded-full bg-primary flex items-center justify-center"
                          >
                            <Check size={14} className="text-primary-foreground" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Password Setup */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                  Set a Password
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Create a password so you can also log in with email next time
                </p>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="onboard-password">Password</Label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="onboard-password"
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="pl-11 pr-11 h-12 rounded-xl"
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="onboard-confirm">Confirm Password</Label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="onboard-confirm"
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="pl-11 pr-11 h-12 rounded-xl"
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Optional phone & location */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="onboard-phone">Phone (Optional)</Label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="onboard-phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="9876543210"
                          className="pl-9 h-11 rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="onboard-location">Location (Optional)</Label>
                      <div className="relative">
                        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="onboard-location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. Mumbai"
                          className="pl-9 h-11 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password strength indicator */}
                  {password && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex-1 flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              password.length >= i * 3
                                ? password.length >= 12 ? "bg-green-500" : password.length >= 8 ? "bg-yellow-500" : "bg-orange-500"
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-muted-foreground">
                        {password.length >= 12 ? "Strong" : password.length >= 8 ? "Good" : password.length >= 6 ? "Fair" : "Too short"}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 3: Language Selection */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                  Choose Your Language
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Select your preferred language for the app
                </p>

                <div className="grid gap-3">
                  {languages.map((lang) => {
                    const isSelected = selectedLang === lang.code;
                    return (
                      <motion.button
                        key={lang.code}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedLang(lang.code)}
                        className={`flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-300 border-2 ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-lg"
                            : "border-transparent bg-secondary/30 hover:bg-secondary/50"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-2xl">
                          {lang.flag}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-base">{lang.name}</h3>
                          <p className="text-sm text-muted-foreground">{lang.native}</p>
                        </div>
                        <Globe size={18} className={isSelected ? "text-primary" : "text-muted-foreground"} />
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-7 h-7 rounded-full bg-primary flex items-center justify-center"
                          >
                            <Check size={14} className="text-primary-foreground" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="mt-6 p-4 rounded-xl bg-secondary/30 border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Account Summary</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {roleOptions.find(r => r.key === selectedRole)?.emoji} {selectedRole && t(selectedRole)}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      🔐 Password set
                    </span>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {languages.find(l => l.code === selectedLang)?.flag} {languages.find(l => l.code === selectedLang)?.name}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-border/50">
            <div>
              {currentStep > 1 ? (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft size={16} /> Back
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="text-muted-foreground hover:text-destructive text-sm"
                >
                  Cancel
                </Button>
              )}
            </div>

            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                className="gradient-primary text-primary-foreground px-8 py-5 rounded-xl font-semibold gap-2 hover:opacity-90 transition-all border-0"
              >
                Next <ArrowRight size={16} />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="gradient-primary text-primary-foreground px-8 py-5 rounded-xl font-semibold gap-2 hover:opacity-90 transition-all border-0"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={16} />}
                {isSubmitting ? "Setting up..." : "Get Started!"}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
