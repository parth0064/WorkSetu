import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, Star, MapPin, Loader2, AlertCircle, UserCheck, ShieldCheck, Zap } from "lucide-react";
import { getWorkers } from "@/services/userService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const SKILL_ICONS: Record<string, string> = {
  mason: "🧱", plumber: "🔧", electrician: "⚡", painter: "🎨",
  carpenter: "🪚", welder: "🔥", tileWorker: "🏗️", default: "👷"
};

const getSkillIcon = (skills: string[]) => {
  if (!skills?.length) return "👷";
  const skill = skills[0].toLowerCase();
  return SKILL_ICONS[skill] || SKILL_ICONS.default;
};

const getRankStyle = (r?: string) => {
    if (!r) return 'from-stone-500 to-stone-600 text-white';
    const text = r.toLowerCase();
    if (text.includes('grandmaster')) return 'from-purple-600 to-indigo-600 text-purple-100 border-purple-400';
    if (text.includes('master'))      return 'from-fuchsia-500 to-pink-600 text-pink-50 border-pink-400';
    if (text.includes('diamond'))     return 'from-cyan-400 to-blue-500 text-cyan-50 border-cyan-300';
    if (text.includes('platinum'))    return 'from-emerald-400 to-teal-500 text-teal-50 border-emerald-300';
    if (text.includes('gold'))        return 'from-yellow-400 to-orange-500 text-yellow-50 border-yellow-300';
    if (text.includes('silver'))      return 'from-slate-300 to-slate-400 text-slate-800 border-slate-300';
    if (text.includes('bronze'))      return 'from-amber-600 to-orange-700 text-orange-50 border-orange-500';
    return 'from-stone-500 to-stone-600 text-white';
};

const FindWorkers = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await getWorkers();
        const data = res.data || [];
        setWorkers(data);
        setFiltered(data);
      } catch (err) {
        console.error("Failed to load workers:", err);
        toast.error("Failed to load workers");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  // Build unique skills list for filter pills
  const allSkills = Array.from(
    new Set(workers.flatMap((w) => w.skills || []))
  ).slice(0, 8);

  useEffect(() => {
    let result = workers;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (w) =>
          w.name?.toLowerCase().includes(q) ||
          w.skills?.some((s: string) => s.toLowerCase().includes(q)) ||
          w.location?.toLowerCase().includes(q)
      );
    }
    if (skillFilter !== "all") {
      result = result.filter((w) =>
        w.skills?.some((s: string) => s.toLowerCase() === skillFilter.toLowerCase())
      );
    }
    setFiltered(result);
  }, [search, skillFilter, workers]);

  const handleHireWorker = (worker: any) => {
    // Navigate to Post Job page with worker pre-selected
    navigate("/dashboard/client/post-job", {
      state: { preselectedWorker: worker }
    });
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
            {t("findWorkers")}
          </h2>
          <p className="text-muted-foreground text-sm font-medium">
            Browse verified professionals ready to work for you
          </p>
        </div>
        <div className="flex items-center gap-2 bg-secondary/60 rounded-xl px-4 py-3 w-full md:w-80 border border-border/50 focus-within:border-primary transition-colors">
          <Search size={18} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, skill or location..."
            className="bg-transparent text-sm font-medium outline-none flex-1 placeholder:text-muted-foreground/50"
          />
        </div>
      </motion.div>

      {/* Skill Filter Pills */}
      {allSkills.length > 0 && (
        <motion.div variants={item} className="flex flex-wrap gap-2">
          <button
            onClick={() => setSkillFilter("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${
              skillFilter === "all"
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-secondary text-muted-foreground border-border/50 hover:border-primary/40"
            }`}
          >
            All
          </button>
          {allSkills.map((skill) => (
            <button
              key={skill}
              onClick={() => setSkillFilter(skill === skillFilter ? "all" : skill)}
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${
                skillFilter === skill
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-secondary text-muted-foreground border-border/50 hover:border-primary/40"
              }`}
            >
              {skill}
            </button>
          ))}
        </motion.div>
      )}

      {/* Content */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-primary w-10 h-10" />
          <p className="text-muted-foreground text-sm font-bold animate-pulse">Loading professionals...</p>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div variants={item} className="glass-card text-center py-20 border-dashed">
          <AlertCircle className="text-muted-foreground/30 mx-auto mb-4" size={48} />
          <p className="text-muted-foreground font-black uppercase text-xs tracking-[0.2em]">
            {workers.length === 0 ? "No workers registered yet" : "No workers match your search"}
          </p>
          {workers.length === 0 && (
            <p className="text-muted-foreground/50 text-xs mt-2">Workers will appear here once they register</p>
          )}
        </motion.div>
      ) : (
        <motion.div variants={item} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((worker) => (
            <motion.div
              key={worker._id}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="glass-card group relative overflow-hidden border-border/40 hover:border-primary/30 transition-all duration-300"
            >
              {/* Availability badge */}
              <div className="absolute top-4 right-4 z-10">
                <Badge
                  className={`text-[9px] font-black uppercase tracking-widest px-2 ${
                    worker.availability !== false && worker.status !== 'busy'
                      ? "bg-success/20 text-success border-success/30"
                      : "bg-destructive/20 text-destructive border-destructive/30"
                  }`}
                  variant="outline"
                >
                  {worker.availability !== false && worker.status !== 'busy' ? "Available" : "Busy"}
                </Badge>
              </div>

              <div className="p-6 space-y-4">
                {/* Avatar & Name */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-3xl shadow-sm group-hover:bg-primary/10 transition-colors shrink-0 overflow-hidden">
                    {worker.profileImage ? (
                      <img src={worker.profileImage} alt={worker.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{getSkillIcon(worker.skills)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-lg tracking-tight truncate group-hover:text-primary transition-colors">
                      {worker.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <Star size={12} fill="currentColor" className="text-warning" />
                      <span className="text-xs font-bold text-foreground">
                        {worker.averageRating > 0 ? worker.averageRating.toFixed(1) : "New"}
                      </span>
                      <span className="text-muted-foreground/50 text-xs">•</span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {worker.completedJobs || 0} jobs
                      </span>
                      {(worker.score || 0) > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded-full ml-1">
                          Score: {worker.score}
                        </span>
                      )}
                      {(worker.hype || 0) > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] font-black bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded-full ml-1 shadow-sm">
                          <Zap size={9} className="fill-orange-500" /> {worker.hype}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {worker.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {worker.skills.slice(0, 3).map((skill: string) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="text-[10px] font-bold border-primary/20 text-primary bg-primary/5"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {worker.skills.length > 3 && (
                      <Badge variant="outline" className="text-[10px] font-bold border-border text-muted-foreground">
                        +{worker.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Location & Badges */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {worker.location ? (
                    <div className="flex items-center gap-1 font-medium">
                      <MapPin size={11} className="text-primary/70" />
                      <span className="truncate max-w-[100px]">{worker.location}</span>
                    </div>
                  ) : (
                    <span />
                  )}
                  <div className="flex flex-wrap gap-1">
                    {worker.rank && worker.rank !== 'Unranked' && (
                       <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest bg-gradient-to-r shadow-sm ${getRankStyle(worker.rank)}`}>
                         {worker.rank}
                       </span>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border/30" />

                {/* Action Button */}
                <Button
                  onClick={() => handleHireWorker(worker)}
                  disabled={worker.availability === false || worker.status === 'busy'}
                  className={`w-full rounded-xl font-black uppercase tracking-widest text-xs py-5 transition-all gap-2 ${
                    worker.availability !== false && worker.status !== 'busy'
                      ? "gradient-primary border-0 shadow-lg hover:scale-[1.02] active:scale-95"
                      : "grayscale opacity-50 cursor-not-allowed"
                  }`}
                >
                  <UserCheck size={15} />
                  {worker.availability !== false && worker.status !== 'busy' ? "Post Job & Hire" : "Currently Busy"}
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default FindWorkers;
