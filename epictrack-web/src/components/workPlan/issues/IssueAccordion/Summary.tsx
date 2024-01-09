import React from "react";
import { Grid, Stack } from "@mui/material";
import { WorkIssue } from "../../../../models/Issue";
import { AccordionSummaryItem } from "../../../shared/accordion/components/AccordionSummaryItem";
import {
  ActiveChip,
  HighPriorityChip,
  InactiveChip,
} from "../../../shared/chip/ETChip";
import { ETParagraph } from "../../../shared";
import moment from "moment";
import { MONTH_DAY_YEAR } from "../../../../constants/application-constant";

const IssueSummary = ({ issue }: { issue: WorkIssue }) => {
  return (
    <Grid
      container
      columnSpacing={3}
      sx={{
        pt: "1rem",
        pb: "1rem",
        pl: "1em",
      }}
      alignItems={"flex-start"}
    >
      <Grid item xs lg="auto">
        <AccordionSummaryItem title="Issue" enableTooltip={true}>
          <Stack spacing={2} direction={"row"}>
            <ETParagraph data-cy="issue-title">{issue.title}</ETParagraph>
            {issue.is_high_priority && (
              <HighPriorityChip label="High Priority" />
            )}
          </Stack>
        </AccordionSummaryItem>
      </Grid>
      <Grid item xs container justifyContent={"flex-end"} spacing={2}>
        <Grid item xs={"auto"} container justifyContent={"flex-end"}>
          <AccordionSummaryItem
            title="Last Update"
            content={moment(issue.updated_at).format(MONTH_DAY_YEAR)}
            enableTooltip={true}
            sx={{
              ml: "12px",
            }}
          />
        </Grid>

        <Grid item xs={"auto"} container justifyContent={"flex-end"}>
          <AccordionSummaryItem
            title="Status"
            enableTooltip={true}
            sx={{
              ml: "12px",
            }}
          >
            {issue.is_active ? (
              <ActiveChip label="Active" />
            ) : (
              <InactiveChip label="Inactive" />
            )}
          </AccordionSummaryItem>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default IssueSummary;
