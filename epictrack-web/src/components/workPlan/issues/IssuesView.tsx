import React from "react";
import AddIcon from "@mui/icons-material/Add";
import NoDataEver from "../../shared/NoDataEver";
import TrackDialog from "../../shared/TrackDialog";
import IssuesForm from "./IssuesForm";
import { IssuesContext } from "./IssuesContext";
import IssuesViewSkeleton from "./IssuesViewSkeleton";
import { Else, If, Then } from "react-if";
import IssueAccordion from "./IssueAccordion";
import { WorkIssue, WorkIssueUpdate } from "../../../models/Issue";
import { Button, Grid } from "@mui/material";

const IssuesView = () => {
  // const { issues } = React.useContext(WorkplanContext);

  const mockIssueUpdate: WorkIssueUpdate = {
    id: 1,
    description:
      "The project has been the subject of media attention due to opposition to the project from the union representing the terminal workers and environmental non-profits.",
    work_issue_id: 1,
    is_active: false,
    is_deleted: false,
  };
  const mockIssue: WorkIssue = {
    id: 1,
    title: "Union in opposition to the project",
    start_date: "",
    expected_resolution_date: "",
    is_active: true,
    is_high_priority: false,
    is_deleted: false,
    work_id: 1,
    approved_by: "somebody",
    created_by: "somebody",
    created_at: new Date().toISOString(),
    updated_by: "somebody",
    updated_at: new Date().toISOString(),
    updates: [mockIssueUpdate],
  };

  const issues = [mockIssue];

  const { showIssuesForm, setShowIssuesForm, isIssuesLoading } =
    React.useContext(IssuesContext);

  const onAddButtonClickHandler = () => {
    setShowIssuesForm(true);
  };

  const onCancelHandler = () => {
    setShowIssuesForm(false);
  };

  if (isIssuesLoading) {
    return <IssuesViewSkeleton />;
  }

  return (
    <>
      <If condition={issues.length === 0}>
        <Then>
          <NoDataEver
            title="You don't have any Issues yet"
            subTitle="Start adding your Issues"
            addNewButtonText="Add Issue"
            onAddNewClickHandler={() => onAddButtonClickHandler()}
          />
        </Then>
        <Else>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={() => onAddButtonClickHandler()}
                startIcon={<AddIcon />}
              >
                Issue
              </Button>
            </Grid>
            {issues.map((issue) => (
              <Grid item xs={12}>
                <IssueAccordion issue={issue} />
              </Grid>
            ))}
          </Grid>
        </Else>
      </If>
      <TrackDialog
        open={showIssuesForm}
        dialogTitle="Add Issue"
        disableEscapeKeyDown
        fullWidth
        maxWidth="sm"
        okButtonText="Add"
        formId="issue-form"
        onCancel={() => onCancelHandler()}
        isActionsRequired
      >
        <IssuesForm />
      </TrackDialog>
    </>
  );
};

export default IssuesView;
