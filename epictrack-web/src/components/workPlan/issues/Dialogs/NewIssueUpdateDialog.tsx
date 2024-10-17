import React from "react";
import TrackDialog from "../../../shared/TrackDialog";
import { IssuesContext } from "../IssuesContext";
import NewIssueUpdate from "../Forms/NewIssueUpdate";

const NewIssueUpdateDialog = () => {
  const { newIssueUpdateFormIsOpen, setNewIssueUpdateFormIsOpen } =
    React.useContext(IssuesContext);

  return (
    <TrackDialog
      open={newIssueUpdateFormIsOpen}
      dialogTitle={"Update Description"}
      disableEscapeKeyDown
      fullWidth
      maxWidth="sm"
      okButtonText="Save"
      formId="issue-form"
      onClose={() => {
        setNewIssueUpdateFormIsOpen(false);
      }}
      onCancel={() => {
        setNewIssueUpdateFormIsOpen(false);
      }}
      isActionsRequired
    >
      <NewIssueUpdate />
    </TrackDialog>
  );
};

export default NewIssueUpdateDialog;
