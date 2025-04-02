import { useAppSelector } from "../hooks";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import { hasPermission } from "../components/shared/restricted";

const AuthGate = ({ allowed }: { allowed: string[] }) => {
  const { roles } = useAppSelector((state) => state.user.userDetail);
  const location = useLocation();

  return hasPermission({ roles, allowed }) ? (
    <Outlet />
  ) : (
    <Navigate to="/unauthorized" state={{ from: location }} replace />
  );
};

export default AuthGate;
