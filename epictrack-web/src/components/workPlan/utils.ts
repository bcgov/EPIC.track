import { ROLES } from "../../constants/application-constant";
import { useContext } from "react";
import { useAppSelector } from "hooks";
import { WorkplanContext } from "./WorkPlanContext";

// Get the active team members
export const useActiveTeam = () => {
  const { team } = useContext(WorkplanContext);
  return team?.filter((member) => member.is_active) || [];
};

// Check if the current user is a team member
export const useIsTeamMember = () => {
  const { team } = useContext(WorkplanContext);
  const { email } = useAppSelector((state) => state.user.userDetail);
  return team?.some((member) => member.staff.email === email) || false;
};

// Check if the current user has a specific role in the active team
export const useUserHasRole = () => {
  const activeTeam = useActiveTeam();
  const { email } = useAppSelector((state) => state.user.userDetail);
  const rolesArray = [
    ROLES.RESPONSIBLE_EPD,
    ROLES.TEAM_LEAD,
    ROLES.TEAM_CO_LEAD,
  ];
  return activeTeam.some(
    (member) =>
      member.staff.email === email && rolesArray.includes(member.role.name)
  );
};
