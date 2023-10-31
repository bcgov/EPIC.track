import React from "react";
import { WorkplanContext } from "../WorkPlanContext";
import NoDataEver from "../../shared/NoDataEver";
import TrackDialog from "../../shared/TrackDialog";
import StatusForm from "./StatusForm";

const StatusView = () => {
  const ctx = React.useContext(WorkplanContext);
  const status = React.useMemo(() => ctx.status, [ctx.status]);
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
          title="You don't have any Issues yet"
          subTitle="Start adding your Issues"
          addNewButtonText="Add Issue"
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
