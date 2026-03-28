import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { DesignProvider } from "@/contexts/DesignContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
// Signup removed, now unified in Login
import RoleSelection from "./pages/RoleSelection";
import NotFound from "./pages/NotFound";
import WalletPage from "./pages/WalletPage";

// Layouts
import WorkerLayout from "./pages/worker/WorkerLayout";
import ClientLayout from "./pages/client/ClientLayout";
import ConstructorLayout from "./pages/constructor/ConstructorLayout";

// Worker Pages
import WorkerHome from "./pages/worker/WorkerHome";
import FindWork from "./pages/worker/FindWork";
import MyWork from "./pages/worker/MyWork";
import AddWork from "./pages/worker/AddWork";
import WorkerProfile from "./pages/worker/WorkerProfile";
import EarningsExpenses from "./pages/worker/EarningsExpenses";
import MyPortfolio from "./pages/worker/MyPortfolio";
import WorkerProjectDetail from "./pages/worker/WorkerProjectDetail";

// Client Pages
import ClientHome from "./pages/client/ClientHome";
import MyJobs from "./pages/client/MyJobs";
import PostJobPage from "./pages/client/PostJobPage";
import JobDetailsPage from "./pages/client/JobDetailsPage";
import FindWorkers from "./pages/client/FindWorkers";
import ClientProfile from "./pages/client/ClientProfile";

// Constructor Pages
import ConstructorHome from "./pages/constructor/ConstructorHome";
import ProjectsList from "./pages/constructor/ProjectsList";
import ProjectDetailsPage from "./pages/constructor/ProjectDetailsPage";
import HireWorkersPage from "./pages/constructor/HireWorkersPage";
import ConstructorProfile from "./pages/constructor/ConstructorProfile";
import WorkerPublicProfile from "./pages/constructor/WorkerPublicProfile";

const queryClient = new QueryClient();



const App = () => (
  <DesignProvider>
    <ThemeProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Login />} />
                <Route path="/role-select" element={<RoleSelection />} />

                {/* Worker Routes */}
                <Route path="/dashboard/worker" element={<WorkerLayout />}>
                  <Route index element={<WorkerHome />} />
                  <Route path="find-work" element={<FindWork />} />
                  <Route path="my-work" element={<MyWork />} />
                  <Route path="add-work" element={<AddWork />} />
                  <Route path="portfolio" element={<MyPortfolio />} />
                  <Route path="profile" element={<WorkerProfile />} />
                  <Route path="wallet" element={<WalletPage />} />
                  <Route path="finances" element={<EarningsExpenses />} />
                  <Route path="projects/:id" element={<WorkerProjectDetail />} />
                </Route>

                {/* Client (Homeowner) Routes */}
                <Route path="/dashboard/client" element={<ClientLayout />}>
                  <Route index element={<ClientHome />} />
                  <Route path="jobs" element={<MyJobs />} />
                  <Route path="jobs/:id" element={<JobDetailsPage />} />
                  <Route path="post-job" element={<PostJobPage />} />
                  <Route path="workers" element={<FindWorkers />} />
                  <Route path="profile" element={<ClientProfile />} />
                  <Route path="wallet" element={<WalletPage />} />
                </Route>

                {/* Constructor Routes */}
                <Route path="/dashboard/constructor" element={<ConstructorLayout />}>
                  <Route index element={<ConstructorHome />} />
                  <Route path="projects" element={<ProjectsList />} />
                  <Route path="projects/:id" element={<ProjectDetailsPage />} />
                  <Route path="hire" element={<HireWorkersPage />} />
                  <Route path="workers/:workerId" element={<WorkerPublicProfile />} />
                  <Route path="profile" element={<ConstructorProfile />} />
                  <Route path="wallet" element={<WalletPage />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
  </DesignProvider>
);

export default App;
