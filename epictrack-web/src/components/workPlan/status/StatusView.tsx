import React from "react";
import NoDataEver from "../../shared/NoDataEver";
import TrackDialog from "../../shared/TrackDialog";
import StatusForm from "./StatusForm";
import { WorkplanContext } from "../WorkPlanContext";

const StatusView = () => {
  const { status } = React.useContext(WorkplanContext);
  const [showStatusForm, setShowStatusForm] = React.useState<boolean>(false);

  const onAddButtonClickHandler = () => {
    setShowStatusForm(true);
  };

  const onCancelHandler = () => {
    setShowStatusForm(false);
  };

  return (
    <>
      {status.length === 0 && (
        <NoDataEver
          title="You don't have any Statuses yet"
          subTitle="Create your first Status"
          addNewButtonText="Add Status"
          onAddNewClickHandler={() => onAddButtonClickHandler()}
        />
      )}
      <TrackDialog
        open={showStatusForm}
        dialogTitle="Add Issue"
        disableEscapeKeyDown
        fullWidth
        maxWidth="sm"
        okButtonText="Add"
        formId="status-form"
        onCancel={() => onCancelHandler()}
        isActionsRequired
      >
        <StatusForm />
      </TrackDialog>
    </>
  );
};

export default StatusView;
