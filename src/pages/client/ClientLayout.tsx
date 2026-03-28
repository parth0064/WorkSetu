import { Outlet } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";

const ClientLayout = () => {
  return (
    <DashboardLayout role="client">
      <Outlet />
    </DashboardLayout>
  );
};

export default ClientLayout;
