import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const AddWork = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const portfolio = [
    { title: "Granite Flooring - Pune Villa", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80" },
    { title: "Mural Masonry - Mumbai", image: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=300&q=80" },
    { title: "Kitchen tiling - Nashik", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80" },
  ];

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Portfolio work added successfully!");
    }, 1000);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={item}>
        <h1 className="text-3xl font-black mb-1" style={{ fontFamily: "var(--font-heading)" }}>{t("addWork")}</h1>
        <p className="text-muted-foreground text-sm font-medium">Upload photos to showcase your work quality.</p>
      </motion.div>

      <div className="grid md:grid-cols-[1fr_1.5fr] gap-8">
        {/* Upload Form */}
        <motion.div variants={item} className="glass-card flex flex-col items-start gap-4 h-fit">
          <h3 className="text-xl font-bold border-b border-border w-full pb-3" style={{ fontFamily: "var(--font-heading)" }}>New Portfolio Item</h3>
          
          <form className="w-full space-y-5" onSubmit={handleUpload}>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Title</label>
              <Input 
                placeholder="e.g. Italian Marble Flooring" 
                className="bg-background/50 border-border focus:border-primary py-5 rounded-xl text-sm transition-all shadow-inner"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Description</label>
              <textarea 
                className="flex w-full rounded-xl border border-input bg-background/50 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-inner min-h-[100px] resize-none"
                placeholder="Describe the work done..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Upload Images</label>
              <div className="border-2 border-dashed border-primary/20 hover:border-primary/50 bg-primary/5 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <ImagePlus size={20} className="text-primary" />
                </div>
                <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground">Click to browse or drag drop</span>
              </div>
            </div>

            <Button disabled={loading} type="submit" className="w-full gradient-primary border-0 rounded-xl py-6 font-bold mt-2 shadow-lg focus:scale-95 active:scale-95 transition-all">
              {loading ? "Uploading..." : "Save Work"}
            </Button>
          </form>
        </motion.div>

        {/* Existing Portfolio */}
        <motion.div variants={item} className="glass-card">
          <h3 className="text-xl font-bold mb-6" style={{ fontFamily: "var(--font-heading)" }}>{t("portfolio")}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {portfolio.map((p, i) => (
              <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden shadow-md border-2 border-white/10 hover:border-primary/50 transition-all cursor-pointer">
                <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-700 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <p className="text-sm font-bold text-white leading-tight drop-shadow-md">{p.title}</p>
                  <Button size="sm" variant="ghost" className="text-xs font-bold w-fit mt-2 bg-white/20 text-white hover:bg-white hover:text-black">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
};

export default AddWork;
