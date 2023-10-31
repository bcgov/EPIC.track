import React from "react";
import NoDataEver from "../../shared/NoDataEver";
import { WorkplanContext } from "../WorkPlanContext";
import { StatusContext } from "./StatusContext";

const StatusView = () => {
  const { statuses } = React.useContext(WorkplanContext);
  const { setShowStatusForm } = React.useContext(StatusContext);

  const onAddButtonClickHandler = () => {
    setShowStatusForm(true);
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
    </>
  );
};

export default StatusView;
