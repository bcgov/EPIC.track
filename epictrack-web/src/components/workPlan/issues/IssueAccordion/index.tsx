import React from "react";
import { Chip, Grid, Stack, SxProps } from "@mui/material";
import ETAccordion from "../../../shared/accordion/Accordion";
import ETAccordionSummary from "../../../shared/accordion/components/AccordionSummary";
import { Palette } from "../../../../styles/theme";
import ETAccordionDetails from "../../../shared/accordion/components/AccordionDetails";
import Icons from "../../../icons/index";
import { IconProps } from "../../../icons/type";
import { WorkIssue } from "../../../../models/Issue";
import { AccordionSummaryItem } from "../../../shared/accordion/components/AccordionSummaryItem";
import {
  ActiveChip,
  HighPriorityChip,
  InactiveChip,
} from "../../../shared/chip/ETChip";
import { ETParagraph } from "../../../shared";
import moment from "moment";
import IssueSummary from "./Summary";
import IssueDetails from "./Details";

const ExpandIcon: React.FC<IconProps> = Icons["ExpandIcon"];

const IssueAccordion = ({ issue }: { issue: WorkIssue }) => {
  const [expanded, setExpanded] = React.useState<boolean>(true);

  return (
    <ETAccordion
      expanded={expanded}
      onChange={(e, expanded) => {
        return;
      }}
    >
      <ETAccordionSummary
        expanded={expanded}
        expandIcon={
          <ExpandIcon
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
