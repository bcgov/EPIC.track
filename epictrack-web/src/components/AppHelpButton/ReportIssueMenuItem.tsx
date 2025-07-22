import { REPORT_ISSUE_LINKS } from "constants/application-constant";
import { HelpMenuItem } from "./HelpMenuItem";

export const ReportIssueMenuItem = () => {
  const handleClick = () => {
    window.open(REPORT_ISSUE_LINKS.JSM_PORTAL, "_blank");
  };

  return <HelpMenuItem onClick={handleClick}>Report an Issue</HelpMenuItem>;
};
