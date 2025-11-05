import { useContext } from "react";
import { AssigneeToggle } from "components/myWorkplans/Filters/AssigneeToggle";
import { MyIssuesContext } from "../MyIssuesContext";

const IssuesAssigneeToggle = () => {
  const { searchOptions, setSearchOptions, totalIssues, loadingIssues } =
    useContext(MyIssuesContext);

  return (
    <AssigneeToggle
      searchOptions={searchOptions}
      setSearchOptions={setSearchOptions}
      total={totalIssues}
      loading={loadingIssues}
      label="Issues"
    />
  );
};

export default IssuesAssigneeToggle;
