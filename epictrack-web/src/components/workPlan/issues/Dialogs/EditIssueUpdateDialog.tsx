import React from "react";
import TrackDialog from "../../../shared/TrackDialog";
import { IssuesContext } from "../IssuesContext";
import EditIssueUpdate from "../Forms/EditIssueUpdate";

const EditIssueUpdateDialog = ({
  headingCaption = "",
}: {
  headingCaption?: string;
}) => {
  const { editIssueUpdateFormIsOpen, setEditIssueUpdateFormIsOpen } =
    React.useContext(IssuesContext);

  return (
    <TrackDialog
      open={editIssueUpdateFormIsOpen}
      dialogTitle={"Edit Description"}
      disableEscapeKeyDown
      fullWidth
      maxWidth="sm"
      okButtonText="Save"
      formId="issue-form"
      onClose={() => {
        setEditIssueUpdateFormIsOpen(false);
      }}
      onCancel={() => {
        setEditIssueUpdateFormIsOpen(false);
      }}
      isActionsRequired
      subHeading={headingCaption}
    >
      <EditIssueUpdate />
    </TrackDialog>
  );
};

export default EditIssueUpdateDialog;
