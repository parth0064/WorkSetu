import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { User as UserIcon, Phone, MapPin, Mail, Award, CheckCircle, Loader2 } from "lucide-react";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const WorkerProfile = () => {
  const { t } = useLanguage();
  const { user, loading } = useAuth();

  if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!user) return <div className="p-8 text-center text-muted-foreground">Please log in to view your profile.</div>;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl space-y-6">
      <motion.div variants={item}>
        <h1 className="text-3xl font-black mb-1" style={{ fontFamily: "var(--font-heading)" }}>{t("profile")}</h1>
        <p className="text-muted-foreground text-sm font-medium">Manage your personal details and verifications.</p>
      </motion.div>

      <motion.div variants={item} className="glass-card shadow-sm">
        <div className="flex flex-col sm:flex-row gap-6 mb-8 items-center sm:items-start text-center sm:text-left">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl shadow-xl border-4 border-background shrink-0">👷</div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70" style={{ fontFamily: "var(--font-heading)" }}>{user.name}</h2>
            <p className="text-muted-foreground font-medium flex items-center justify-center sm:justify-start gap-2 mt-1">
              <MapPin size={14} className="text-primary" /> {user.location || "Location not set"}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
              <span className="px-3 py-1 bg-success/10 text-success text-xs font-bold rounded-lg flex items-center gap-1.5"><CheckCircle size={12} /> ID Verified</span>
              {user.badges?.map(badge => (
                <span key={badge} className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg flex items-center gap-1.5"><Award size={12} /> {badge}</span>
              ))}
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
              {user.skills?.length ? user.skills.map((skill) => (
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
    </motion.div>
  );
};

export default WorkerProfile;
