import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, ArrowRight, Shield, Users, Star, Briefcase, ChevronDown, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import { useRef } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const { t, lang, setLang } = useLanguage();
  const { theme, toggle } = useTheme();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const stats = [
    { value: "10K+", labelKey: "workersRegistered", icon: Users },
    { value: "5K+", labelKey: "jobsCompleted", icon: Briefcase },
    { value: "98%", labelKey: "satisfactionRate", icon: Star },
    { value: "50+", labelKey: "citiesCovered", icon: Zap },
  ];

  const features = [
    { icon: Shield, titleKey: "verifiedProfiles", descKey: "verifiedProfilesDesc" },
    { icon: Users, titleKey: "trustedNetwork", descKey: "trustedNetworkDesc" },
    { icon: Star, titleKey: "ratingSystem", descKey: "ratingSystemDesc" },
    { icon: Briefcase, titleKey: "easyHiring", descKey: "easyHiringDesc" },
  ];

  const steps = [
    { num: "01", titleKey: "signup", descKey: "signupToGetStarted" },
    { num: "02", titleKey: "selectRole", descKey: "chooseHowToUse" },
    { num: "03", titleKey: "getStarted", descKey: "easyHiringDesc" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-border/10 transition-all duration-300">
        <div className="container mx-auto flex items-center justify-between h-16 px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="WorkSetu Logo" className="w-8 h-8 rounded-lg shadow-sm" />
            <span className="text-xl font-black text-foreground tracking-tighter" style={{ fontFamily: "var(--font-heading)" }}>WorkSetu</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as "en" | "hi" | "mr")}
              className="text-xs font-bold tracking-wide uppercase bg-transparent text-foreground border-none outline-none cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="hi">हिंदी</option>
              <option value="mr">मराठी</option>
            </select>
            <div className="w-px h-4 bg-border/50 mx-1 hidden sm:block" />
            <button onClick={toggle} className="p-2 text-foreground/70 hover:text-foreground transition-colors">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="flex items-center gap-2 pl-2 sm:pl-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="hidden sm:inline-flex font-bold hover:bg-foreground/5 hover:text-foreground">
                {t("login")}
              </Button>
              <Button size="sm" onClick={() => navigate("/signup")} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-full px-5">
                {t("signup")}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero - Cinematic Layout (Agrovision Style) */}
      <section ref={heroRef} className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 w-full h-full">
          <img src={heroBg} alt="Construction workers" className="w-full h-full object-cover object-center" width={1920} height={1080} />
          {/* Aesthetic layer masking mimicking farm planning reference */}
          <div className="absolute inset-0 bg-background/20 dark:bg-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-transparent h-40" />
        </div>
        
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 w-full flex-1 flex flex-col justify-center -mt-10">
          <div className="container mx-auto px-4 sm:px-6 flex flex-col items-center text-center max-w-5xl">
            
            {/* Elegant Top Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/90 backdrop-blur-sm border border-border/50 shadow-sm mb-8"
            >
              <Zap size={14} className="text-primary shrink-0" />
              <span className="text-[11px] font-black tracking-widest uppercase text-foreground/80">Intelligent Construction Setup</span>
            </motion.div>

            {/* Giant Title exactly like reference */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] font-black text-foreground mb-6 leading-[1.05] tracking-tight drop-shadow-sm"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <span className="text-primary">{t("heroTitle").split('.')[0]}.</span>
              <span className="text-foreground">{" " + t("heroTitle").split('.').slice(1).join('.').trim()}</span>
            </motion.h1>
            
            {/* Descriptive Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg sm:text-xl md:text-2xl font-medium text-foreground/70 mb-10 max-w-3xl px-4 leading-relaxed"
            >
              {t("tagline")}
            </motion.p>

            {/* Bold CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex justify-center"
            >
              <Button
                size="lg"
                onClick={() => navigate("/signup")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-7 text-xl rounded-2xl font-bold gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left ease-out duration-300" />
                <span className="relative z-10 flex items-center gap-2">{t("getStarted")} <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" /></span>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator - integrated into fade */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          animate={{ y: [0, 8, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="text-foreground/50" size={32} />
        </motion.div>
      </section>

      {/* Stats - Overlapping section */}
      <section className="relative -mt-16 z-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="glass rounded-3xl p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.labelKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <s.icon size={20} className="text-primary" />
                </div>
                <p className="text-3xl md:text-4xl font-extrabold gradient-text" style={{ fontFamily: "var(--font-heading)" }}>{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{t(s.labelKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Bento Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              {t("whyWorkSetu")} <span className="gradient-text">WorkSetu</span>?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t("tagline")}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.titleKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card group hover-lift relative overflow-hidden ${i === 0 ? "lg:col-span-2 lg:row-span-2" : ""}`}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className={`${i === 0 ? "w-20 h-20" : "w-14 h-14"} rounded-2xl gradient-primary flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <f.icon size={i === 0 ? 32 : 24} className="text-primary-foreground" />
                  </div>
                  <h3 className={`font-bold mb-3 ${i === 0 ? "text-2xl" : "text-lg"}`} style={{ fontFamily: "var(--font-heading)" }}>{t(f.titleKey)}</h3>
                  <p className={`text-muted-foreground ${i === 0 ? "text-base" : "text-sm"}`}>{t(f.descKey)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-center mb-16"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t("howItWorks")}
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0" />
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center relative"
              >
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 text-xl font-bold text-primary-foreground shadow-xl relative z-10">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>{t(step.titleKey)}</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">{t(step.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                {t("readyToStart")}
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">{t("tagline")}</p>
              <Button
                size="lg"
                onClick={() => navigate("/signup")}
                className="gradient-primary text-primary-foreground px-10 py-6 text-lg rounded-xl font-semibold gap-2 hover:opacity-90 transition-all hover:scale-[1.02] border-0"
              >
                {t("getStarted")} <ArrowRight size={20} />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          {t("allRightsReserved")}
        </div>
      </footer>
    </div>
  );
};

export default Landing;
