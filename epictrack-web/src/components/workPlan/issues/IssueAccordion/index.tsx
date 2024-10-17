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

const ExpandIcon: React.FC<IconProps> = Icons["ExpandIcon"];

const IssueAccordion = ({
  issue,
  defaultOpen = true,
  onInteraction = () => {
    return;
  },
}: {
  issue: WorkIssue;
  defaultOpen?: boolean;
  onInteraction?: () => void;
}) => {
  const [expanded, setExpanded] = React.useState<boolean>(defaultOpen);

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
            sx={{
              fill: Palette.primary.main,
              cursor: "pointer",
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
