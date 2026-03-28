import { Outlet } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";

const ConstructorLayout = () => {
  return (
    <DashboardLayout role="constructor">
      <Outlet />
    </DashboardLayout>
  );
};

export default ConstructorLayout;
