import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
    Plus, Trash2, ImagePlus, Loader2, Layers, X, ChevronLeft, ChevronRight,
    MapPin, Calendar, Clock, User as UserIcon, Zap, Award, AlertCircle, Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    addPortfolioEntry, getMyPortfolio, deletePortfolioEntry,
    EXPERIENCE_LEVEL_CONFIG, PortfolioEntry, ExperienceLevel
} from "@/services/portfolioService";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const CATEGORIES = [
    'Masonry', 'Plumbing', 'Electrical', 'Carpentry', 'Painting',
    'Flooring', 'Tiling', 'Welding', 'Roofing', 'Civil Work',
    'Interior Design', 'Landscaping', 'Other'
];

const CURRENT_YEAR = new Date().getFullYear();

const MyPortfolio = () => {
    const { user } = useAuth();
    const [entries, setEntries] = useState<PortfolioEntry[]>([]);
    const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Beginner');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [lightboxEntry, setLightboxEntry] = useState<PortfolioEntry | null>(null);
    const [lightboxIdx, setLightboxIdx] = useState(0);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [detectLoading, setDetectLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'Other',
        clientName: '',
        location: '',
        duration: '',
        completionYear: CURRENT_YEAR.toString()
    });

    const config = EXPERIENCE_LEVEL_CONFIG[experienceLevel];

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        setLoading(true);
        try {
            const res = await getMyPortfolio();
            setEntries(res.data || []);
            setExperienceLevel(res.experienceLevel || 'Beginner');
        } catch {
            toast.error("Failed to load portfolio");
        } finally {
            setLoading(false);
        }
    };

    const compressImage = (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new window.Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 1200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                        else reject(new Error("Compression failed"));
                    }, 'image/jpeg', 0.8);
                };
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []).slice(0, 5);
        setSelectedFiles(files);
        setPreviewUrls(files.map(f => URL.createObjectURL(f)));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) { toast.error("Title is required"); return; }

        setSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => formData.append(k, v));
            
            // Automatically compress all high-res photos to prevent 500 payload errors
            const compressedFiles = await Promise.all(selectedFiles.map(compressImage));
            compressedFiles.forEach(f => formData.append('images', f));

            const res = await addPortfolioEntry(formData);
            toast.success("Work added to portfolio! 🎉");
            setEntries(prev => [res.data, ...prev]);
            setExperienceLevel(res.experienceLevel || experienceLevel);
            setShowModal(false);
            resetForm();
        } catch (err: any) {
            toast.error(err?.response?.data?.error || err?.response?.data?.message || err.message || "Failed to add entry");
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setForm({ title: '', description: '', category: 'Other', clientName: '', location: '', duration: '', completionYear: CURRENT_YEAR.toString() });
        setSelectedFiles([]);
        setPreviewUrls([]);
    };

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setDetectLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
                    
                    const res = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`
                    );
                    const data = await res.json();
                    
                    if (data.status === 'OK' && data.results.length > 0) {
                        const address = data.results[0].formatted_address;
                        setForm(prev => ({ ...prev, location: address }));
                        toast.success("Location detected!");
                    } else {
                        toast.error("Could not determine address");
                    }
                } catch (err) {
                    toast.error("Failed to fetch address");
                } finally {
                    setDetectLoading(false);
                }
            },
            (error) => {
                setDetectLoading(false);
                toast.error("Location access denied or failed");
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this portfolio entry?")) return;
        setDeletingId(id);
        try {
            await deletePortfolioEntry(id);
            const updatedEntries = entries.filter(e => e._id !== id);
            setEntries(updatedEntries);
            const newLevel = updatedEntries.length < 10 ? 'Beginner' : updatedEntries.length < 25 ? 'Intermediate' : 'Pro';
            setExperienceLevel(newLevel);
            toast.success("Deleted successfully");
        } catch {
            toast.error("Failed to delete");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) return (
        <div className="h-64 flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
        </div>
    );

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl space-y-8">
            {/* Header */}
            <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                        My Portfolio
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">
                        LinkedIn-style showcase of your past work.
                    </p>
                </div>
                <Button
                    onClick={() => setShowModal(true)}
                    className="gradient-primary border-0 rounded-xl font-bold gap-2 shadow-lg hover:opacity-90"
                >
                    <Plus size={18} /> Add Work
                </Button>
            </motion.div>

            {/* Experience Level Banner */}
            <motion.div variants={item} className={`rounded-2xl p-5 border ${config.border} ${config.bg} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-full" />
                <div className="flex items-center gap-4 z-10 relative">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center text-2xl shadow-lg`}>
                        {config.emoji}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xl font-black ${config.textColor}`}>{config.label}</span>
                            <span className={`text-xs font-black px-3 py-1 rounded-full bg-gradient-to-r ${config.color} text-white shadow-sm`}>
                                {entries.length} {entries.length === 1 ? 'Work' : 'Works'}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium mt-0.5">{config.description}</p>
                    </div>
                    {/* Hype eligibility badge */}
                    {experienceLevel === 'Beginner' && (
                        <div className="hidden sm:flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-4 py-2 rounded-xl">
                            <Zap size={16} className="text-orange-500 fill-orange-500" />
                            <span className="text-xs font-black text-orange-600 uppercase tracking-widest">Hype Eligible!</span>
                        </div>
                    )}
                </div>

                {/* Progress bar to next level */}
                {experienceLevel !== 'Pro' && (
                    <div className="mt-4 relative z-10">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">
                            <span>Progress to {experienceLevel === 'Beginner' ? 'Intermediate' : 'Pro'}</span>
                            <span className={config.textColor}>
                                {entries.length}/{experienceLevel === 'Beginner' ? 10 : 25}
                            </span>
                        </div>
                        <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full bg-gradient-to-r ${config.color} rounded-full`}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (entries.length / (experienceLevel === 'Beginner' ? 10 : 25)) * 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                )}

                {/* Hype alert for beginner - mobile */}
                {experienceLevel === 'Beginner' && (
                    <div className="flex sm:hidden items-center gap-2 mt-3 bg-orange-500/10 border border-orange-500/30 px-3 py-1.5 rounded-xl">
                        <Zap size={14} className="text-orange-500 fill-orange-500" />
                        <span className="text-xs font-black text-orange-600">You're Hype Eligible!</span>
                    </div>
                )}
            </motion.div>

            {/* Portfolio Grid */}
            {entries.length === 0 ? (
                <motion.div variants={item} className="glass-card text-center py-20">
                    <Layers size={48} className="text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-muted-foreground mb-2">No work added yet</h3>
                    <p className="text-sm text-muted-foreground/70 mb-6">Start showcasing your skills — add your first project!</p>
                    <Button onClick={() => setShowModal(true)} className="gradient-primary border-0 font-bold gap-2">
                        <Plus size={16} /> Add First Work
                    </Button>
                </motion.div>
            ) : (
                <motion.div variants={item} className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
                    {entries.map((entry) => (
                        <motion.div
                            key={entry._id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: deletingId === entry._id ? 0.4 : 1, scale: 1 }}
                            className="glass-card group relative overflow-hidden hover:border-primary/40 transition-all"
                        >
                            {/* Category badge */}
                            <span className="absolute top-4 left-4 z-10 text-[10px] font-black px-2.5 py-1 rounded-lg bg-primary/90 text-white uppercase tracking-widest">
                                {entry.category}
                            </span>
                            <button
                                onClick={() => handleDelete(entry._id)}
                                disabled={deletingId === entry._id}
                                className="absolute top-4 right-4 z-10 w-7 h-7 rounded-lg bg-destructive/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                            >
                                {deletingId === entry._id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                            </button>

                            {/* Image Gallery */}
                            {entry.images.length > 0 ? (
                                <div
                                    className="relative h-48 overflow-hidden rounded-xl mb-4 cursor-pointer"
                                    onClick={() => { setLightboxEntry(entry); setLightboxIdx(0); }}
                                >
                                    <img
                                        src={entry.images[0]}
                                        alt={entry.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    {entry.images.length > 1 && (
                                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                                            +{entry.images.length - 1} photos
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-28 rounded-xl mb-4 bg-secondary/50 flex items-center justify-center">
                                    <ImagePlus size={28} className="text-muted-foreground/40" />
                                </div>
                            )}

                            <h3 className="text-base font-bold leading-tight mb-2">{entry.title}</h3>
                            {entry.description && (
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{entry.description}</p>
                            )}

                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground font-medium pt-3 border-t border-border/40">
                                {entry.location && <span className="flex items-center gap-1"><MapPin size={10} className="text-primary" /> {entry.location}</span>}
                                {entry.completionYear && <span className="flex items-center gap-1"><Calendar size={10} className="text-primary" /> {entry.completionYear}</span>}
                                {entry.duration && <span className="flex items-center gap-1"><Clock size={10} className="text-primary" /> {entry.duration}</span>}
                                {entry.clientName && <span className="flex items-center gap-1"><UserIcon size={10} className="text-primary" /> {entry.clientName}</span>}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* ADD WORK MODAL */}
            <AnimatePresence>
                {showModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setShowModal(false); resetForm(); }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-black" style={{ fontFamily: "var(--font-heading)" }}>
                                            Add Past Work
                                        </h2>
                                        <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 rounded-xl hover:bg-secondary transition-colors">
                                            <X size={18} />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Title */}
                                        <div>
                                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">
                                                Title *
                                            </label>
                                            <Input
                                                value={form.title}
                                                onChange={e => setForm({ ...form, title: e.target.value })}
                                                placeholder="e.g. Italian Marble Flooring – Pune Villa"
                                                className="rounded-xl"
                                                required
                                            />
                                        </div>

                                        {/* Category */}
                                        <div>
                                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">Category</label>
                                            <select
                                                value={form.category}
                                                onChange={e => setForm({ ...form, category: e.target.value })}
                                                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                                            >
                                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">Description</label>
                                            <textarea
                                                value={form.description}
                                                onChange={e => setForm({ ...form, description: e.target.value })}
                                                placeholder="Describe the work done, materials used, challenges solved..."
                                                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary min-h-[80px] resize-none"
                                            />
                                        </div>

                                        {/* Row: Year + Duration */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">Year</label>
                                                <Input
                                                    type="number"
                                                    value={form.completionYear}
                                                    onChange={e => setForm({ ...form, completionYear: e.target.value })}
                                                    min={1990}
                                                    max={CURRENT_YEAR}
                                                    className="rounded-xl"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">Duration</label>
                                                <Input
                                                    value={form.duration}
                                                    onChange={e => setForm({ ...form, duration: e.target.value })}
                                                    placeholder="e.g. 2 weeks"
                                                    className="rounded-xl"
                                                />
                                            </div>
                                        </div>

                                        {/* Row: Location + Client */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground block">Location</label>
                                                <div className="flex gap-2">
                                                    <button 
                                                        type="button"
                                                        onClick={() => setForm(prev => ({ ...prev, location: "Mumbai, Maharashtra" }))}
                                                        className="text-[10px] font-bold text-primary hover:underline bg-primary/5 px-1.5 py-0.5 rounded"
                                                    >
                                                        Quick: Mumbai
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={handleDetectLocation}
                                                        disabled={detectLoading}
                                                        className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline disabled:opacity-50"
                                                    >
                                                        {detectLoading ? <Loader2 size={10} className="animate-spin" /> : <Navigation size={10} />}
                                                        Auto-Detect
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <Input
                                                    value={form.location}
                                                    onChange={e => setForm({ ...form, location: e.target.value })}
                                                    placeholder="e.g. Mumbai"
                                                    className="rounded-xl pl-9"
                                                />
                                                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                            </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">Client Name</label>
                                                <Input
                                                    value={form.clientName}
                                                    onChange={e => setForm({ ...form, clientName: e.target.value })}
                                                    placeholder="e.g. Mr. Sharma"
                                                    className="rounded-xl"
                                                />
                                            </div>
                                        </div>

                                        {/* Image Upload */}
                                        <div>
                                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">Photos (max 5)</label>
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="border-2 border-dashed border-primary/30 hover:border-primary/60 bg-primary/5 rounded-xl h-24 flex flex-col items-center justify-center cursor-pointer transition-all group"
                                            >
                                                <ImagePlus size={20} className="text-primary mb-1 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-bold text-muted-foreground">Click to browse images</span>
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                            {previewUrls.length > 0 && (
                                                <div className="flex gap-2 mt-2 flex-wrap">
                                                    {previewUrls.map((url, i) => (
                                                        <img
                                                            key={i}
                                                            src={url}
                                                            alt=""
                                                            className="w-14 h-14 rounded-lg object-cover border border-border"
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full gradient-primary border-0 rounded-xl py-6 font-bold text-base shadow-lg"
                                        >
                                            {submitting ? (
                                                <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Uploading...</span>
                                            ) : (
                                                <span className="flex items-center gap-2"><Plus size={16} /> Save to Portfolio</span>
                                            )}
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* LIGHTBOX */}
            <AnimatePresence>
                {lightboxEntry && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                        onClick={() => setLightboxEntry(null)}
                    >
                        <button className="absolute top-4 right-4 text-white/70 hover:text-white" onClick={() => setLightboxEntry(null)}>
                            <X size={28} />
                        </button>
                        <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
                            <img
                                src={lightboxEntry.images[lightboxIdx]}
                                alt={lightboxEntry.title}
                                className="w-full max-h-[80vh] object-contain rounded-2xl"
                            />
                            {lightboxEntry.images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setLightboxIdx(i => (i - 1 + lightboxEntry.images.length) % lightboxEntry.images.length)}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/80"
                                    ><ChevronLeft size={20} /></button>
                                    <button
                                        onClick={() => setLightboxIdx(i => (i + 1) % lightboxEntry.images.length)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/80"
                                    ><ChevronRight size={20} /></button>
                                    <div className="text-center text-white/60 text-xs mt-2">
                                        {lightboxIdx + 1} / {lightboxEntry.images.length}
                                    </div>
                                </>
                            )}
                            <p className="text-white font-bold text-center mt-3">{lightboxEntry.title}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default MyPortfolio;
