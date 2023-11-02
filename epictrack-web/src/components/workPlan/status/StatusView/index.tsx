import React from "react";
import NoDataEver from "../../../shared/NoDataEver";
import { WorkplanContext } from "../../WorkPlanContext";
import { StatusContext } from "../StatusContext";
import StatusOutOfDateBanner from "../StatusOutOfDateBanner";
import RecentStatus from "./RecentStatus";

const StatusView = () => {
  const { statuses } = React.useContext(WorkplanContext);
  const { setShowStatusForm } = React.useContext(StatusContext);

  const onAddButtonClickHandler = () => {
    setShowStatusForm(true);
  };

  return (
    <>
      {statuses.length === 0 && (
        <NoDataEver
          title="You don't have any Statuses yet"
          subTitle="Create your first Status"
          addNewButtonText="Add Status"
          onAddNewClickHandler={() => onAddButtonClickHandler()}
        />
      )}
      {statuses.length > 0 && !statuses[0].approved && (
        <StatusOutOfDateBanner />
      )}
      {statuses.length > 0 && <RecentStatus />}
    </>
  );
};

export default StatusView;
