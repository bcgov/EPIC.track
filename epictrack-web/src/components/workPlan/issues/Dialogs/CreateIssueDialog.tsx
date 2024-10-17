import React from "react";
import TrackDialog from "../../../shared/TrackDialog";
import { IssuesContext } from "../IssuesContext";
import CreateIssue from "../Forms/CreateIssue";

const CreateIssueDialog = () => {
  const { createIssueFormIsOpen, setCreateIssueFormIsOpen } =
    React.useContext(IssuesContext);

  return (
    <TrackDialog
      open={createIssueFormIsOpen}
      dialogTitle={"Add Issue"}
      disableEscapeKeyDown
      fullWidth
      maxWidth="sm"
      okButtonText="Save"
      formId="issue-form"
      onClose={() => setCreateIssueFormIsOpen(false)}
      onCancel={() => setCreateIssueFormIsOpen(false)}
      isActionsRequired
    >
      <CreateIssue />
    </TrackDialog>
  );
};

export default CreateIssueDialog;
