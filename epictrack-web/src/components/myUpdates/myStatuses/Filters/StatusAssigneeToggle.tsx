import { useContext } from "react";
import { MyStatusesContext } from "../MyStatusContext";
import { AssigneeToggle } from "components/myWorkplans/Filters/AssigneeToggle";

const StatusAssigneeToggle = () => {
  const { searchOptions, setSearchOptions, totalStatuses, loadingStatuses } =
    useContext(MyStatusesContext);

  return (
    <AssigneeToggle
      searchOptions={searchOptions}
      setSearchOptions={setSearchOptions}
      total={totalStatuses}
      loading={loadingStatuses}
      label="Statuses"
    />
  );
};

export default StatusAssigneeToggle;
