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
import { WorkplanContext } from "components/workPlan/WorkPlanContext";
import { useAppSelector } from "hooks";

const IssueSummary = ({ issue }: { issue: WorkIssue }) => {
  const { setEditIssueFormIsOpen, setIssueToEdit } =
    React.useContext(IssuesContext);

  // These are used in conjunction with /restricted/index.tsx for permission control.
  const { team } = React.useContext(WorkplanContext);
  const activeTeam = team?.filter((member) => member.is_active);
  const { email } = useAppSelector((state) => state.user.userDetail);
  const isTeamMember = team?.some((member) => member.staff.email === email);
  const rolesArray = [
    ROLES.RESPONSIBLE_EPD,
    ROLES.TEAM_LEAD,
    ROLES.TEAM_CO_LEAD,
  ];
  const userHasRole = activeTeam?.some(
    (member) =>
      member.staff.email === email && rolesArray.includes(member.role.name)
  );

  const EditIcon: React.FC<IconProps> = icons["PencilEditIcon"];
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
              allowed={[ROLES.EXTENDED_EDIT]}
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
