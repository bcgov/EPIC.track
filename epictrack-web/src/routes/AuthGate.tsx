import { useAppSelector } from "../hooks";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import { hasPermission } from "../components/shared/restricted";

interface AuthGateProps {
  allowed: string[];
  elevatedAllowed?: number[];
}

const AuthGate = ({ allowed, elevatedAllowed = [] }: AuthGateProps) => {
  const { roles } = useAppSelector((state) => state.user.userDetail);
  const elevatedRoles = useAppSelector((state) => state.user.elevatedRoles);
  const elevatedRolesStatus = useAppSelector(
    (state) => state.user.elevatedRolesStatus,
  );
  const location = useLocation();
  // only wait on the fetch if this route actually checks elevated roles
  const waitingOnElevatedRoles =
    elevatedAllowed.length > 0 &&
    (elevatedRolesStatus === "loading" || elevatedRolesStatus === "idle");

  if (waitingOnElevatedRoles) {
    return null; // or a spinner
  }

  return hasPermission({ roles, allowed, elevatedRoles, elevatedAllowed }) ? (
    <Outlet />
  ) : (
    <Navigate to="/unauthorized" state={{ from: location }} replace />
  );
};

export default AuthGate;
