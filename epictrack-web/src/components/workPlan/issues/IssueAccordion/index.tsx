import { FC, useMemo, useState } from "react";
import { Grid } from "@mui/material";
import ETAccordion from "components/shared/accordion/Accordion";
import ETAccordionDetails from "components/shared/accordion/components/AccordionDetails";
import ETAccordionSummary from "components/shared/accordion/components/AccordionSummary";
import { Palette } from "../../../../styles/theme";
import Icons from "../../../icons/index";
import { IconProps } from "../../../icons/type";
import { WorkIssue } from "../../../../models/Issue";
import IssueSummary from "./Summary";
import IssueDetails from "./Details";
import { StalenessEnum } from "constants/application-constant";

const ExpandIcon: FC<IconProps> = Icons["ExpandIcon"];

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
  const [expanded, setExpanded] = useState<boolean>(defaultOpen);

  const iconStyles = useMemo(() => {
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
              borderRadius: "4px",
              padding: "2px",
              width: "20px",
              height: "20px",
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
