import { Outlet } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";

const WorkerLayout = () => {
  return (
    <DashboardLayout role="worker">
      <Outlet />
    </DashboardLayout>
  );
};

export default WorkerLayout;
