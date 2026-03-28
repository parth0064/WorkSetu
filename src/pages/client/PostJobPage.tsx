import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const PostJobPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t("jobSuccess"));
    navigate("/dashboard/client/jobs");
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl space-y-8">
      <motion.div variants={item}>
        <h2 className="text-3xl font-black text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
          {t("postJob")}
        </h2>
        <p className="text-muted-foreground text-sm font-medium">
          Create a new job listing to find skilled workers.
        </p>
      </motion.div>

      <motion.div variants={item}>
        <form onSubmit={handlePostJob} className="glass-card border-primary/20 bg-primary/5 p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t("jobTitleLabel")}</label>
              <Input 
                placeholder={t("jobTitlePlaceholder")} 
                className="bg-background/50 border-border focus:border-primary py-6 rounded-xl"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t("skillRequiredLabel")}</label>
              <select className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required>
                <option value="">{t("skillPlaceholder")}</option>
                <option value="mason">{t("mason")}</option>
                <option value="tileWorker">{t("tileWorker")}</option>
                <option value="plumber">{t("plumber")}</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Location</label>
              <Input 
                placeholder="e.g. Mumbai, Maharashtra" 
                className="bg-background/50 border-border focus:border-primary py-6 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Estimated Wage (₹)</label>
              <Input 
                type="number"
                placeholder="e.g. 15000" 
                className="bg-background/50 border-border focus:border-primary py-6 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Duration</label>
              <select className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required>
                <option value="">Select Duration</option>
                <option value="1_day">1 Day</option>
                <option value="few_days">Few Days (2-5)</option>
                <option value="1_week">1 Week</option>
                <option value="1_month">1 Month+</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-background/50 p-4 rounded-xl border border-border">
            <input type="checkbox" id="urgent" className="w-5 h-5 rounded text-primary focus:ring-primary accent-primary" />
            <div className="flex flex-col">
              <label htmlFor="urgent" className="text-sm font-bold text-foreground cursor-pointer">Mark as Urgent</label>
              <span className="text-xs text-muted-foreground">This job needs immediate attention.</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => navigate("/dashboard/client")} className="rounded-xl px-8 py-6">{t("cancel")}</Button>
            <Button type="submit" className="gradient-primary border-0 rounded-xl px-10 py-6 font-bold">{t("postJob")}</Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default PostJobPage;
