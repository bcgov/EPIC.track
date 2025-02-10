import React from "react";
import AddIcon from "@mui/icons-material/Add";
import NoDataEver from "../../shared/NoDataEver";
import { IssuesContext } from "./IssuesContext";
import IssuesViewSkeleton from "./IssuesViewSkeleton";
import { When } from "react-if";
import IssueAccordion from "./IssueAccordion";
import { Box, Button, Grid } from "@mui/material";
import { WorkplanContext } from "../WorkPlanContext";
import { WorkIssue } from "../../../models/Issue";
import IssueDialogs from "./Dialogs";
import { Restricted, hasPermission } from "components/shared/restricted";
import { useAppSelector } from "hooks";
import { ROLES, StalenessEnum } from "constants/application-constant";
import { issueListMaxStaleness, calculateStaleness } from "../utils";
import WarningBox from "../../shared/warningBox";

const IssuesView = () => {
  const { issues, team } = React.useContext(WorkplanContext) as {
    issues: WorkIssue[];
    team: { staff: { email: string } }[];
  };

  const { isIssuesLoading, setCreateIssueFormIsOpen } =
    React.useContext(IssuesContext);

  const { roles, email } = useAppSelector((state) => state.user.userDetail);
  const canCreate = hasPermission({ roles, allowed: [ROLES.CREATE] });
  const isTeamMember = team?.some((member) => member.staff.email === email);

  const sortIssues = (issues: WorkIssue[]): WorkIssue[] => {
    return [...issues].sort((a, b) => {
      if (a.is_resolved !== b.is_resolved) {
        return a.is_resolved ? 1 : -1; // Unresolved items come first
      }
      if (a.start_date > b.start_date) {
        return -1;
      }
      if (a.start_date < b.start_date) {
        return 1;
      }
      return 0;
    });
  };

  const mapIssues = (issues: WorkIssue[]) => {
    return issues.map((currentIssue, index) => {
      const staleness = calculateStaleness(currentIssue);
      return (
        <Grid key={`accordion-${currentIssue.id}`} item xs={12}>
          <IssueAccordion issue={currentIssue} staleness={staleness} />
        </Grid>
      );
    });
  };

  const sortedIssues = sortIssues(issues);

  if (isIssuesLoading) {
    return <IssuesViewSkeleton />;
  }

  const maxStaleness = issueListMaxStaleness(issues);

  return (
    <>
      <When condition={issues.length === 0}>
        <NoDataEver
          title="You don't have any Issues yet"
          subTitle="Start adding your Issues"
          addNewButtonText="Add Issue"
          onAddNewClickHandler={() => setCreateIssueFormIsOpen(true)}
          addButtonProps={{
            disabled: !canCreate && !isTeamMember,
          }}
        />
      </When>
      <When
        condition={
          maxStaleness === StalenessEnum.CRITICAL ||
          maxStaleness === StalenessEnum.WARN
        }
      >
        <Box sx={{ paddingBottom: "16px" }}>
          <WarningBox
            title="One of the Work issues is out of date"
            subTitle="Please provide an update where needed"
            isTitleBold={true}
          />
        </Box>
      </When>
      <When condition={issues.length > 0}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Restricted
              allowed={[ROLES.CREATE]}
              exception={isTeamMember}
              errorProps={{ disabled: true }}
            >
              <Button
                variant="contained"
                onClick={() => setCreateIssueFormIsOpen(true)}
                startIcon={<AddIcon />}
              >
                Issue
              </Button>
            </Restricted>
          </Grid>
          {mapIssues(sortedIssues)}
        </Grid>
      </When>
      <IssueDialogs />
    </>
  );
};

export default IssuesView;
