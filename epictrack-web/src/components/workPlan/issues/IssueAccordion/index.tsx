import React from "react";
import { Grid } from "@mui/material";
import ETAccordion from "../../../shared/accordion/Accordion";
import ETAccordionSummary from "../../../shared/accordion/components/AccordionSummary";
import { Palette } from "../../../../styles/theme";
import ETAccordionDetails from "../../../shared/accordion/components/AccordionDetails";
import Icons from "../../../icons/index";
import { IconProps } from "../../../icons/type";
import { WorkIssue } from "../../../../models/Issue";
import IssueSummary from "./Summary";
import IssueDetails from "./Details";
import { StalenessEnum } from "constants/application-constant";

const ExpandIcon: React.FC<IconProps> = Icons["ExpandIcon"];

const IssueAccordion = ({
  issue,
  staleness,
  defaultOpen = false,
  onInteraction = () => {
    return;
  },
}: {
  issue: WorkIssue;
  staleness?: string;
  defaultOpen?: boolean;
  onInteraction?: () => void;
}) => {
  const [expanded, setExpanded] = React.useState<boolean>(defaultOpen);

  const iconStyles = React.useMemo(() => {
    switch (staleness) {
      case StalenessEnum.CRITICAL:
        return {
          fill: Palette.error.dark,
          background: Palette.error.bg.light,
        };
      case StalenessEnum.WARN:
        return {
          fill: Palette.secondary.dark,
          background: Palette.secondary.bg.light,
        };
      case StalenessEnum.INACTIVE:
        return {
          fill: Palette.neutral.main,
          background: Palette.neutral.bg.main,
        };
      case StalenessEnum.RESOLVED:
        return {
          fill: Palette.neutral.main,
          background: Palette.neutral.bg.main,
        };
      default:
        return {
          fill: Palette.success.dark,
          background: Palette.success.bg.light,
        };
    }
  }, [staleness]);

  return (
    <ETAccordion
      data-cy="issue-accordion"
      expanded={expanded}
      onChange={() => {
        setExpanded(!expanded);
        if (!expanded) {
          onInteraction();
        }
      }}
    >
      <ETAccordionSummary
        expanded={expanded}
        expandIcon={
          <ExpandIcon
            data-cy={`${issue.id}-expand-icon`}
            className=""
            style={{
              ...iconStyles,
              width: "20",
              height: "20",
            }}
          />
        }
      >
        <IssueSummary issue={issue} />
      </ETAccordionSummary>
      <ETAccordionDetails
        expanded={expanded}
        sx={{
          pt: "24px",
        }}
      >
        <Grid container spacing={2}>
          <IssueDetails issue={issue} />
        </Grid>
      </ETAccordionDetails>
    </ETAccordion>
  );
};

export default IssueAccordion;
