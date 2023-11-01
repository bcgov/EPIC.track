import React from "react";
import { WorkplanContext } from "../WorkPlanContext";
import NoDataEver from "../../shared/NoDataEver";
import TrackDialog from "../../shared/TrackDialog";
import IssuesForm from "./IssuesForm";
import { IssuesContext } from "./IssuesContext";

const IssuesView = () => {
  const { issues } = React.useContext(WorkplanContext);
  const { showIssuesForm, setShowIssuesForm } = React.useContext(IssuesContext);

  const onAddButtonClickHandler = () => {
    setShowIssuesForm(true);
  };

  const onCancelHandler = () => {
    setShowIssuesForm(false);
  };

  if (issues.length === 0) {
    return (
      <NoDataEver
        title="You don't have any Issues yet"
        subTitle="Start adding your Issues"
        addNewButtonText="Add Issue"
        onAddNewClickHandler={() => onAddButtonClickHandler()}
      />
    );
  }

  return (
    <>
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
