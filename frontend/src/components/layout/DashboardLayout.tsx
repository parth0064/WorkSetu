import { useState, useEffect, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage, Lang } from "@/contexts/LanguageContext";
import { 
  Moon, Sun, Menu, X, LayoutDashboard, Briefcase, User, 
  LogOut, Search, PlusCircle, SearchIcon, FolderGit2, ImagePlus, UserPlus,
  Wallet, PieChart as PieChartIcon, Bell, Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getWallet } from "@/services/walletService";
import { getNotifications, markAsRead } from "@/services/notificationService";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "worker" | "client" | "contractor";
}


const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, loading } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchBalance = async () => {
    if (!user) return;
    try {
      const walletData = await getWallet();
      if (walletData?.data) {
        setBalance(walletData.data.balance);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await getNotifications();
      setNotifications(data.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    fetchBalance();
    fetchNotifications();
    
    const interval = setInterval(() => {
        fetchBalance();
        fetchNotifications();
    }, 30000); 
    return () => clearInterval(interval);
  }, [user?.id]); 

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-xl animate-pulse">
            <img src="/logo.png" alt="WorkSetu" className="w-8 h-8 object-cover rounded-xl" />
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // navigate effect will redirect to /login
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleRead = async (id: string, relatedId?: string) => {
    try {
        await markAsRead(id);
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        if (relatedId) {
            navigate(`/dashboard/${role}/jobs/${relatedId}`);
            setShowNotifications(false);
        }
    } catch (error) {
        console.error("Error marking read:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const workerNav = [
    { icon: LayoutDashboard, labelKey: "dashboard", path: "/dashboard/worker" },
    { icon: SearchIcon, labelKey: "findWork", path: "/dashboard/worker/find-work" },
    { icon: Briefcase, labelKey: "myWork", path: "/dashboard/worker/my-work" },
    { icon: Layers, labelKey: "myPortfolio", path: "/dashboard/worker/portfolio" },
    { icon: Wallet, labelKey: "wallet", path: "/dashboard/worker/wallet" },
    { icon: PieChartIcon, labelKey: "finances", path: "/dashboard/worker/finances" },
    { icon: User, labelKey: "profile", path: "/dashboard/worker/profile" },
  ];

  const clientNav = [
    { icon: LayoutDashboard, labelKey: "dashboard", path: "/dashboard/client" },
    { icon: Briefcase, labelKey: "myJobs", path: "/dashboard/client/jobs" },
    { icon: PlusCircle, labelKey: "postJob", path: "/dashboard/client/post-job" },
    { icon: SearchIcon, labelKey: "findWorkers", path: "/dashboard/client/workers" },
    { icon: Wallet, labelKey: "wallet", path: "/dashboard/client/wallet" },
    { icon: User, labelKey: "profile", path: "/dashboard/client/profile" },
  ];

  const contractorNav = [
    { icon: LayoutDashboard, labelKey: "dashboard", path: "/dashboard/contractor" },
    { icon: FolderGit2, labelKey: "projects", path: "/dashboard/contractor/projects" },
    { icon: UserPlus, labelKey: "hireWorkers", path: "/dashboard/contractor/hire" },
    { icon: Wallet, labelKey: "wallet", path: "/dashboard/contractor/wallet" },
    { icon: User, labelKey: "profile", path: "/dashboard/contractor/profile" },
  ];

  const nav = role === "worker" ? workerNav : role === "client" ? clientNav : contractorNav;


  const NavItems = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="space-y-2 mt-4">
      {nav.map((item) => {
        // Use startsWith for non-root paths so sub-routes (e.g. /projects/:id) keep parent highlighted
        const isRoot = item.path === `/dashboard/${role}`;
        const active = isRoot
          ? location.pathname === item.path
          : location.pathname.startsWith(item.path);
        return (
          <button
            key={item.path}
            onClick={() => { navigate(item.path); onNavigate?.(); }}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all duration-300 relative group overflow-hidden ${
              active
                ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-[0_8px_30px_-5px_var(--primary)] ring-1 ring-primary/30"
                : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
            }`}
          >
            {/* Sweep hover effect for non-active */}
            {!active && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out z-0" />
            )}

            <div className="flex items-center gap-4 z-10">
              <div className={`p-2 rounded-xl transition-all duration-300 ${active ? 'bg-white/20 shadow-inner' : 'bg-transparent group-hover:bg-background shadow-sm'}`}>
                <item.icon size={18} className={active ? "text-white" : "group-hover:text-primary"} />
              </div>
              <span className="mt-[2px]">{t(item.labelKey)}</span>
            </div>
            
            {/* Active state pulsing dot indicator */}
            <div className="z-10 w-6 flex justify-end">
              {active && (
                <motion.div
                  layoutId="nav-active"
                  className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar - Premium Hackathon Style */}
      <aside className="hidden lg:flex flex-col w-[300px] p-4 h-screen sticky top-0">
        <div className="relative rounded-[2rem] flex-1 flex flex-col p-6 overflow-hidden bg-card border border-primary/10 shadow-[20px_0_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-[20px_0_40px_-15px_rgba(0,0,0,0.3)]">
          {/* Aesthetic background glows */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute top-1/2 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-3 mb-8 px-2">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-md animate-pulse" />
              <img src="/logo.png" alt="WorkSetu Logo" className="relative w-12 h-12 rounded-2xl shadow-xl object-cover ring-2 ring-primary/20" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-foreground leading-none" style={{ fontFamily: "var(--font-heading)" }}>WorkSetu</span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/70 mt-1">Platform</span>
            </div>
          </div>
          
          <div className="relative z-10 flex-1 overflow-y-auto w-full no-scrollbar px-1">
            <NavItems />
          </div>

          <div className="relative z-10 border-t border-border/50 pt-6 mt-4 px-1">
            <div className="glass-card mb-4 p-4 border border-primary/20 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-50" />
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black shadow-inner">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black truncate text-foreground">{user?.name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-80">{role}</p>
                  </div>
                </div>
            </div>

            <button
              onClick={handleLogout}
              className="group flex items-center justify-between px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full border border-transparent hover:border-destructive/20"
            >
              <span className="flex items-center gap-3"><LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-card/95 backdrop-blur-xl border-r border-primary/10 z-50 p-6 flex flex-col lg:hidden shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="WorkSetu Logo" className="w-10 h-10 rounded-xl shadow-lg object-cover ring-1 ring-primary/20" />
                  <span className="text-xl font-black tracking-tighter text-foreground" style={{ fontFamily: "var(--font-heading)" }}>WorkSetu</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl bg-secondary/50 hover:bg-secondary text-muted-foreground"><X size={20} /></button>
              </div>
              
              <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar">
                <NavItems onNavigate={() => setSidebarOpen(false)} />
              </div>
              
              <div className="relative z-10 pt-6 mt-4 border-t border-border/50">
                <button onClick={handleLogout} className="flex items-center justify-center gap-3 p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-destructive bg-destructive/10 hover:bg-destructive/20 w-full transition-colors">
                  <LogOut size={16} /> Sign Out
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
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-secondary">
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

            {/* Notifications Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors relative"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-lg ring-1 ring-background">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl z-50 p-2 glass"
                  >
                    <div className="flex items-center justify-between p-3 border-b border-border mb-2">
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Recent Alerts</span>
                        {unreadCount > 0 && <span className="text-[10px] text-primary font-bold cursor-pointer hover:underline">Mark all read</span>}
                    </div>
                    {notifications.length > 0 ? (
                        <div className="space-y-1">
                            {notifications.map((n) => (
                                <div 
                                    key={n._id}
                                    onClick={() => handleRead(n._id, n.relatedId)}
                                    className={`p-3 rounded-xl cursor-pointer transition-all hover:bg-secondary group relative border border-transparent ${!n.read ? 'bg-primary/5 border-primary/10' : ''}`}
                                >
                                    {!n.read && <div className="absolute top-4 left-1 w-1 h-1 bg-primary rounded-full" />}
                                    <p className="text-xs font-medium text-foreground pr-2 leading-snug">{n.message}</p>
                                    <span className="text-[9px] text-muted-foreground opacity-60 mt-1 block">
                                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <p className="text-xs text-muted-foreground font-medium italic">No new alerts.</p>
                        </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div 
              onClick={() => navigate(`/dashboard/${role}/wallet`)}
              className="hidden md:flex items-center gap-2 bg-secondary/80 hover:bg-secondary px-3 py-1.5 rounded-xl cursor-pointer transition-colors border border-border/50"
            >
              <Wallet size={14} className="text-primary" />
              <span className="text-xs font-bold">₹{balance?.toLocaleString() ?? "..." }</span>
            </div>
            <div 
              onClick={() => navigate(`/dashboard/${role}/profile`)}
              className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground shadow-lg cursor-pointer overflow-hidden group"
            >
              {user?.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                />
              ) : (
                <span>{user?.name?.charAt(0) || "U"}</span>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
