import React from "react";
import { Button, Grid, Stack } from "@mui/material";
import { WorkIssue } from "../../../../models/Issue";
import { AccordionSummaryItem } from "../../../shared/accordion/components/AccordionSummaryItem";
import { ETChip } from "../../../shared/chip/ETChip";
import { ETParagraph } from "../../../shared";
import moment from "moment";
import {
  MONTH_DAY_YEAR,
  ROLES,
} from "../../../../constants/application-constant";
import { Else, If, Then, When } from "react-if";
import icons from "../../../icons";
import { IconProps } from "../../../icons/type";
import { IssuesContext } from "../IssuesContext";
import { Restricted } from "components/shared/restricted";
import { useUserHasRole } from "../../utils";

const IssueSummary = ({ issue }: { issue: WorkIssue }) => {
  const { setEditIssueFormIsOpen, setIssueToEdit } =
    React.useContext(IssuesContext);

  const EditIcon: React.FC<IconProps> = icons["PencilEditIcon"];
  const userHasRole = useUserHasRole();

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
            <When condition={issue.is_high_priority}>
              <ETChip highPriority label="High Priority" />
            </When>
            <If condition={issue.is_active}>
              <Then>
                <ETChip active label="Active" />
              </Then>
              <Else>
                <ETChip inactive label="Inactive" />
              </Else>
            </If>
          </Stack>
        </AccordionSummaryItem>
      </Grid>
      <Grid item xs container justifyContent={"flex-end"} spacing={2}>
        <Grid item xs={"auto"} container justifyContent={"flex-end"}>
          <AccordionSummaryItem
            title="Start Date"
            content={moment(issue.start_date).format(MONTH_DAY_YEAR)}
            enableTooltip={true}
          />
        </Grid>

        <Grid item xs={"auto"} container justifyContent={"flex-end"}>
          <AccordionSummaryItem title="Actions" enableTooltip={true}>
            <Restricted
              allowed={[ROLES.EDIT]}
              errorProps={{ disabled: true }}
              exception={userHasRole}
            >
              <Button
                variant="text"
                startIcon={<EditIcon />}
                sx={{
                  backgroundColor: "inherit",
                  borderColor: "transparent",
                  textAlign: "start",
                  height: "fit-content",
                  paddingTop: 0,
                  paddingBottom: 0,
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  setIssueToEdit(issue);
                  setEditIssueFormIsOpen(true);
                }}
              />
            </Restricted>
          </AccordionSummaryItem>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default IssueSummary;
