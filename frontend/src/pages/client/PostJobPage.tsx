import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { createJob } from "@/services/jobService";
import { Loader2, UserCheck, X, MapPin, Navigation, CheckCircle2, AlertCircle, Edit3 } from "lucide-react";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const SKILLS = ["mason", "tileWorker", "plumber", "electrician", "carpenter", "painter", "welder", "other"];

const PostJobPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Pre-selected worker from FindWorkers page
  const preselectedWorker = (location.state as any)?.preselectedWorker || null;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skillRequired: preselectedWorker?.skills?.[0] || "",
    wage: "",
    duration: "1 Week",
    isUrgent: false,
  });

  // ── Dual-Location State ──────────────────────────────────────────────────
  // GPS location (fetched from device + reverse-geocoded)
  const [gpsLocation, setGpsLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Manual location (typed by user)
  const [manualLocation, setManualLocation] = useState("");
  // ─────────────────────────────────────────────────────────────────────────

  /** Fetch current device GPS → reverse-geocode to street address */
  const handleFetchGPS = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }

    setGpsLoading(true);
    setGpsError(null);
    setGpsLocation(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        if (!API_KEY) {
          // No API key — store coords with generic address label
          setGpsLocation({ address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng });
          setGpsLoading(false);
          toast.success("GPS location captured (no reverse-geocode key).");
          return;
        }

        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`
          );
          const data = await res.json();

          if (data.status === "OK" && data.results.length > 0) {
            const address = data.results[0].formatted_address;
            setGpsLocation({ address, lat, lng });
            toast.success("Location fetched!", { description: address });
          } else {
            // Coords captured but geocode failed — still usable for map
            setGpsLocation({ address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng });
            toast.info("Location captured. Address lookup failed — using coordinates.");
          }
        } catch {
          // Network error during reverse-geocode — still have coords
          setGpsLocation({ address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng });
          toast.info("GPS captured but address not resolved. Coordinates saved.");
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) {
          setGpsError("Location permission denied. Please allow access in browser settings.");
        } else if (err.code === 2) {
          setGpsError("Location unavailable. Please use manual entry below.");
        } else {
          setGpsError("Location request timed out. Try again or use manual entry.");
        }
        toast.warning("GPS failed — you can still enter location manually below.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  /** Clear fetched GPS so user can retry or rely on manual */
  const clearGPS = () => {
    setGpsLocation(null);
    setGpsError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.skillRequired || !formData.wage || !formData.duration) {
      return toast.error("Please fill all required fields.");
    }

    // Resolve location — GPS wins if available, manual is the fallback
    let locationPayload: any;

    if (gpsLocation && !gpsError) {
      // ✅ GPS path — rich GeoJSON with coordinates (appears on Nearby map)
      locationPayload = {
        type: "Point",
        coordinates: [gpsLocation.lng, gpsLocation.lat], // GeoJSON: [lng, lat]
        address: gpsLocation.address,
      };
    } else if (manualLocation.trim()) {
      // 📍 Manual path — address only, no coordinates (appears in Jobs tab)
      locationPayload = { address: manualLocation.trim() };
    } else {
      return toast.error("Please provide a job location — use GPS or type it manually.");
    }

    setLoading(true);
    try {
      const payload = { ...formData, location: locationPayload };
      const res = await createJob(payload);

      toast.success("Job posted successfully!", {
        description: gpsLocation
          ? "This job will appear on the worker's Nearby map."
          : "This job will appear in the worker's Jobs list.",
        duration: 4000,
      });

      const newJobId = res.data?._id;
      if (newJobId) {
        navigate(`/dashboard/client/jobs/${newJobId}`);
      } else {
        navigate("/dashboard/client/jobs");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  // Derived: which location mode is "active"
  const locationResolved = gpsLocation || manualLocation.trim().length > 0;
  const usingGPS = !!gpsLocation && !gpsError;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl space-y-8 pb-20">
      <motion.div variants={item}>
        <h2 className="text-3xl font-black text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
          {t("postJob")}
        </h2>
        <p className="text-muted-foreground text-sm font-medium">
          Post a job listing — workers will apply and you can book them directly.
        </p>
      </motion.div>

      {/* Pre-selected worker banner */}
      {preselectedWorker && (
        <motion.div variants={item} className="glass-card border-primary/30 bg-primary/5 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
            {preselectedWorker.profileImage ? (
              <img src={preselectedWorker.profileImage} alt={preselectedWorker.name} className="w-full h-full object-cover" />
            ) : "👷"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black uppercase tracking-widest text-primary mb-0.5">Posting for Worker</p>
            <p className="font-bold text-lg truncate">{preselectedWorker.name}</p>
            <p className="text-xs text-muted-foreground">{preselectedWorker.skills?.join(", ")}</p>
          </div>
          <button
            onClick={() => navigate("/dashboard/client/workers")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
          <div className="text-xs font-medium text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <UserCheck size={12} className="text-primary" />
            After posting, go to job details and click "Book Now" on this worker once they apply
          </div>
        </motion.div>
      )}

      <motion.div variants={item}>
        <form onSubmit={handleSubmit} className="glass-card border-primary/20 bg-primary/5 p-8 space-y-6">

          {/* Title & Description */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                {t("jobTitleLabel")}
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Kitchen Tile Work Needed"
                className="bg-background/50 border-border focus:border-primary py-6 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the work in detail — materials needed, area size, access, etc."
                className="bg-background/50 border-border focus:border-primary rounded-xl min-h-[120px]"
                required
              />
            </div>
          </div>

          {/* ── DUAL LOCATION SECTION ─────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                Job Location
              </label>
              {/* Active mode indicator */}
              {usingGPS && (
                <span className="text-[10px] font-black uppercase tracking-widest text-success flex items-center gap-1">
                  <CheckCircle2 size={11} /> GPS Active — will appear on Nearby map
                </span>
              )}
              {!usingGPS && manualLocation.trim() && (
                <span className="text-[10px] font-black uppercase tracking-widest text-warning flex items-center gap-1">
                  <Edit3 size={11} /> Manual — will appear in Jobs list
                </span>
              )}
            </div>

            <div className="rounded-xl border border-border bg-background/50 overflow-hidden divide-y divide-border">
              {/* ── Row 1: GPS Location ── */}
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Navigation size={14} className={usingGPS ? "text-success" : "text-muted-foreground"} />
                  <span className="text-xs font-bold text-foreground">GPS Location</span>
                  <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Recommended</span>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      readOnly
                      value={gpsLocation?.address || ""}
                      placeholder="Click the button to fetch your current location..."
                      className={`bg-background/30 border-border py-5 rounded-xl pr-8 text-sm cursor-default ${
                        usingGPS ? "border-success/50 text-foreground" : "text-muted-foreground"
                      }`}
                    />
                    {gpsLocation && (
                      <button
                        type="button"
                        onClick={clearGPS}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        title="Clear GPS location"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <Button
                    type="button"
                    onClick={handleFetchGPS}
                    disabled={gpsLoading}
                    variant="outline"
                    className={`shrink-0 rounded-xl font-bold text-xs px-4 gap-2 border-primary/30 hover:border-primary hover:bg-primary/5 transition-all ${
                      usingGPS ? "border-success/50 text-success hover:bg-success/5 hover:border-success" : ""
                    }`}
                  >
                    {gpsLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : usingGPS ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <MapPin size={14} />
                    )}
                    {gpsLoading ? "Fetching..." : usingGPS ? "GPS Locked" : "Fetch from Google API"}
                  </Button>
                </div>

                {/* GPS Error Message */}
                {gpsError && !gpsLoading && (
                  <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                    <AlertCircle size={13} className="text-destructive shrink-0 mt-0.5" />
                    <p className="text-xs text-destructive font-medium">{gpsError}</p>
                  </div>
                )}

                {/* GPS Success hint */}
                {usingGPS && (
                  <p className="text-[11px] text-success/80 font-medium ml-1">
                    ✓ Coordinates saved — workers nearby will find this job on the map.
                  </p>
                )}
              </div>

              {/* ── Divider with OR label ── */}
              <div className="relative flex items-center px-4 py-3 bg-secondary/20">
                <div className="flex-1 h-px bg-border" />
                <span className="mx-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {usingGPS ? "or override with" : "or enter manually"}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* ── Row 2: Manual Location ── */}
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Edit3 size={14} className={!usingGPS && manualLocation ? "text-warning" : "text-muted-foreground"} />
                  <span className="text-xs font-bold text-foreground">Manual Location</span>
                  <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Fallback</span>
                </div>
                <Input
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  placeholder="e.g. Mumbai, Maharashtra  /  Thane West  /  Pune"
                  className={`bg-background/30 border-border focus:border-primary py-5 rounded-xl text-sm ${
                    !usingGPS && manualLocation ? "border-warning/40" : ""
                  }`}
                />
                {!usingGPS && manualLocation.trim() && (
                  <p className="text-[11px] text-warning/80 font-medium ml-1">
                    📍 Workers will find this job in the Jobs list tab (not on map).
                  </p>
                )}
              </div>
            </div>

            {/* Location resolution status */}
            {!locationResolved && (
              <p className="text-[11px] text-muted-foreground ml-1">
                Provide at least one location — GPS or manual text.
              </p>
            )}
          </div>
          {/* ── END DUAL LOCATION ─────────────────────────────────────────── */}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Skill Required */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Skill Required</label>
              <select
                value={formData.skillRequired}
                onChange={(e) => setFormData({ ...formData, skillRequired: e.target.value })}
                className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select a skill...</option>
                {SKILLS.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Wage */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Budget / Wage (₹)</label>
              <Input
                type="number"
                value={formData.wage}
                onChange={(e) => setFormData({ ...formData, wage: e.target.value })}
                placeholder="e.g. 15000"
                className="bg-background/50 border-border focus:border-primary py-6 rounded-xl"
                required
                min="1"
              />
            </div>

            {/* Duration */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Duration</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="1 Day">1 Day</option>
                <option value="2-3 Days">2-3 Days</option>
                <option value="1 Week">1 Week</option>
                <option value="2 Weeks">2 Weeks</option>
                <option value="1 Month">1 Month</option>
                <option value="2-3 Months">2-3 Months</option>
                <option value="Ongoing">Ongoing</option>
              </select>
            </div>
          </div>

          {/* Urgent toggle */}
          <div className="flex items-center gap-3 bg-background/50 p-4 rounded-xl border border-border">
            <input
              type="checkbox"
              id="urgent"
              checked={formData.isUrgent}
              onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
              className="w-5 h-5 rounded text-primary focus:ring-primary accent-primary"
            />
            <div className="flex flex-col">
              <label htmlFor="urgent" className="text-sm font-bold text-foreground cursor-pointer">Mark as Urgent</label>
              <span className="text-xs text-muted-foreground">Workers will see this job needs immediate attention.</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => navigate("/dashboard/client")} className="rounded-xl px-8 py-6">
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={loading || !locationResolved}
              className="gradient-primary border-0 rounded-xl px-10 py-6 font-bold"
            >
              {loading && <Loader2 className="animate-spin mr-2" size={18} />}
              Post Job
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default PostJobPage;
