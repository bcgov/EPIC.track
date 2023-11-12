import React from "react";
import AddIcon from "@mui/icons-material/Add";
import NoDataEver from "../../shared/NoDataEver";
import TrackDialog from "../../shared/TrackDialog";
import IssuesForm from "./IssuesForm";
import { IssuesContext } from "./IssuesContext";
import IssuesViewSkeleton from "./IssuesViewSkeleton";
import { Else, If, Then } from "react-if";
import IssueAccordion from "./IssueAccordion";
import { Button, Grid } from "@mui/material";
import { WorkplanContext } from "../WorkPlanContext";

const IssuesView = () => {
  const { issues } = React.useContext(WorkplanContext);
  const {
    showIssuesForm,
    setShowIssuesForm,
    isIssuesLoading,
    setIssueToEdit,
    issueToEdit,
  } = React.useContext(IssuesContext);

  const onAddButtonClickHandler = () => {
    setShowIssuesForm(true);
  };

  const onCancelHandler = () => {
    setShowIssuesForm(false);
    setIssueToEdit(null);
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
            {issues.map((issue, index) => (
              <Grid item xs={12}>
                <IssueAccordion issue={issue} defaultOpen={index === 0} />
              </Grid>
            ))}
          </Grid>
        </Else>
      </If>
      <TrackDialog
        open={showIssuesForm}
        dialogTitle={issueToEdit ? "Edit Issue" : "Add Issue"}
        disableEscapeKeyDown
        fullWidth
        maxWidth="sm"
        okButtonText="Save"
        formId="issue-form"
        onCancel={() => onCancelHandler()}
        onClose={() => onCancelHandler()}
        isActionsRequired
      >
        <IssuesForm />
      </TrackDialog>
    </>
  );
};

export default IssuesView;
