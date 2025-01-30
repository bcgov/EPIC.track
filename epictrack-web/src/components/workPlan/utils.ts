import {
  ROLES,
  ISSUES_STALENESS_THRESHOLD,
  StalenessEnum,
} from "../../constants/application-constant";
import moment from "moment";
import dateUtils from "../../utils/dateUtils";
import { useContext } from "react";
import { useAppSelector } from "hooks";
import { WorkplanContext } from "./WorkPlanContext";
import { WorkIssue } from "../../models/Issue";
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

// Helper function to calculate staleness
export const calculateStaleness = (issue: {
  updates: { posted_date: string }[];
  type?: string;
  is_active: boolean;
  is_resolved: boolean;
}) => {
  const now = moment();
  // Check if the issue is inactive or resolved
  if (issue.is_resolved) {
    return StalenessEnum.RESOLVED;
  }
  if (!issue.is_active) {
    return StalenessEnum.INACTIVE;
  }
  // Check if there are no updates
  if (!issue.updates || issue.updates.length === 0) {
    return StalenessEnum.GOOD; // No update, consider it "GOOD"
  }

  // Calculate the difference in days from the latest update
  const diffDays = dateUtils.diff(
    now.toLocaleString(),
    issue.updates[0]?.posted_date,
    "days"
  );

  // Determine the staleness level
  if (diffDays > ISSUES_STALENESS_THRESHOLD.StalenessEnum.CRITICAL) {
    return StalenessEnum.CRITICAL;
  } else if (diffDays > ISSUES_STALENESS_THRESHOLD.StalenessEnum.WARN) {
    return StalenessEnum.WARN;
  } else {
    return StalenessEnum.GOOD;
  }
};

// Helper function to get stalest level in issue list
export const issueListMaxStaleness = (issues: WorkIssue[]): StalenessEnum => {
  const stalenessPriority = [
    StalenessEnum.GOOD,
    StalenessEnum.INACTIVE,
    StalenessEnum.RESOLVED,
    StalenessEnum.WARN,
    StalenessEnum.CRITICAL,
  ];

  // Helper function to get the "highest" staleness
  const getHigherStaleness = (
    a: StalenessEnum,
    b: StalenessEnum
  ): StalenessEnum => {
    return stalenessPriority.indexOf(a) > stalenessPriority.indexOf(b) ? a : b;
  };

  if (issues.length === 0) return StalenessEnum.GOOD; // No issues to check

  const topStaleness = issues.reduce((currentHighest, issue) => {
    const staleness = calculateStaleness(issue);
    return getHigherStaleness(currentHighest, staleness);
  }, StalenessEnum.GOOD); // Start with GOOD as the "lowest" level

  return topStaleness;
};
