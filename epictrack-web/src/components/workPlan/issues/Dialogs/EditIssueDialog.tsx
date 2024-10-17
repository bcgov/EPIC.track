import React from "react";
import TrackDialog from "../../../shared/TrackDialog";
import { IssuesContext } from "../IssuesContext";
import EditIssue from "../Forms/EditIssue";

const EditIssueDialog = () => {
  const { editIsssueFormIsOpen, setEditIssueFormIsOpen } =
    React.useContext(IssuesContext);

  return (
    <TrackDialog
      open={editIsssueFormIsOpen}
      dialogTitle={"Update Issue"}
      disableEscapeKeyDown
      fullWidth
      maxWidth="sm"
      okButtonText="Save"
      formId="issue-form"
      onClose={() => {
        setEditIssueFormIsOpen(false);
      }}
      onCancel={() => {
        setEditIssueFormIsOpen(false);
      }}
      isActionsRequired
    >
      <EditIssue />
    </TrackDialog>
  );
};

export default EditIssueDialog;
