import { useState, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage, Lang } from "@/contexts/LanguageContext";
import { 
  Moon, Sun, Menu, X, LayoutDashboard, Briefcase, User, 
  LogOut, Search, PlusCircle, SearchIcon, FolderGit2, ImagePlus, UserPlus 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "worker" | "client" | "constructor";
}


const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const workerNav = [
    { icon: LayoutDashboard, labelKey: "dashboard", path: "/dashboard/worker" },
    { icon: SearchIcon, labelKey: "findWork", path: "/dashboard/worker/find-work" },
    { icon: Briefcase, labelKey: "myWork", path: "/dashboard/worker/my-work" },
    { icon: ImagePlus, labelKey: "addWork", path: "/dashboard/worker/add-work" },
    { icon: User, labelKey: "profile", path: "/dashboard/worker/profile" },
  ];

  const clientNav = [
    { icon: LayoutDashboard, labelKey: "dashboard", path: "/dashboard/client" },
    { icon: Briefcase, labelKey: "myJobs", path: "/dashboard/client/jobs" },
    { icon: PlusCircle, labelKey: "postJob", path: "/dashboard/client/post-job" },
    { icon: SearchIcon, labelKey: "findWorkers", path: "/dashboard/client/workers" },
    { icon: User, labelKey: "profile", path: "/dashboard/client/profile" },
  ];

  const constructorNav = [
    { icon: LayoutDashboard, labelKey: "dashboard", path: "/dashboard/constructor" },
    { icon: FolderGit2, labelKey: "projects", path: "/dashboard/constructor/projects" },
    { icon: UserPlus, labelKey: "hireWorkers", path: "/dashboard/constructor/hire" },
    { icon: User, labelKey: "profile", path: "/dashboard/constructor/profile" },
  ];

  const nav = role === "worker" ? workerNav : role === "client" ? clientNav : constructorNav;


  const NavItems = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {nav.map((item) => {
        const active = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => { navigate(item.path); onNavigate?.(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              active
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <item.icon size={18} />
            {t(item.labelKey)}
            {active && (
              <motion.div
                layoutId="nav-active"
                className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar - Floating style */}
      <aside className="hidden md:flex flex-col w-72 p-4">
        <div className="glass rounded-2xl flex-1 flex flex-col p-5">
          <div className="flex items-center gap-3 mb-8 px-1">
            <img src="/logo.png" alt="WorkSetu Logo" className="w-9 h-9 rounded-xl shadow-lg object-cover" />
            <span className="text-lg font-bold gradient-text" style={{ fontFamily: "var(--font-heading)" }}>WorkSetu</span>
          </div>
          <nav className="flex-1 space-y-1">
            <NavItems />
          </nav>
          <div className="border-t border-border pt-4 mt-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all w-full"
            >
              <LogOut size={18} /> {t("logout")}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-40 md:hidden" />
            <motion.aside
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border z-50 p-4 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between mb-8 px-1">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="WorkSetu Logo" className="w-9 h-9 rounded-xl shadow-lg object-cover" />
                  <span className="text-lg font-bold gradient-text" style={{ fontFamily: "var(--font-heading)" }}>WorkSetu</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-secondary"><X size={20} /></button>
              </div>
              <nav className="flex-1 space-y-1">
                <NavItems onNavigate={() => setSidebarOpen(false)} />
              </nav>
              <div className="border-t border-border pt-4 mt-4">
                <button onClick={() => navigate("/")} className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-destructive w-full">
                  <LogOut size={18} /> {t("logout")}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-secondary">
              <Menu size={20} />
            </button>
            {/* Search */}
            <div className="hidden sm:flex items-center gap-2 bg-secondary/60 rounded-xl px-3 py-2 w-64">
              <Search size={16} className="text-muted-foreground" />
              <input type="text" placeholder={`${t("jobs")}...`} className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted-foreground/50" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              className="text-sm bg-secondary text-secondary-foreground rounded-lg px-2 py-1.5 border-none outline-none cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="hi">हिंदी</option>
              <option value="mr">मराठी</option>
            </select>
            <button onClick={toggle} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground shadow-lg cursor-pointer">
              U
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
