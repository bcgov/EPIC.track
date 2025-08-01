import { useContext, useMemo } from "react";
import FilterSelect from "../../../shared/filterSelect/FilterSelect";
import { MyIssuesContext } from "../MyIssuesContext";

export const IssueStateFilter = () => {
  const { setSearchOptions, searchOptions } = useContext(MyIssuesContext);

  const stateOptions = useMemo(
    () => [
      { label: "Active", value: "is_active:true" },
      { label: "Inactive", value: "is_active:false" },
      { label: "High Profile", value: "is_high_priority:true" },
      { label: "Resolved", value: "is_resolved:true" },
    ],
    []
  );

  const value = useMemo(() => {
    return stateOptions.filter((option) => {
      return searchOptions.issue_state.includes(String(option.value));
    });
  }, [searchOptions.issue_state, stateOptions]);

  return (
    <FilterSelect
      options={stateOptions}
      variant="inline-standalone"
      placeholder={"Issue State"}
      filterAppliedCallback={(value) => {
        if (!value) return;
        setSearchOptions((prev) => ({
          ...prev,
          issue_state: value as string[],
        }));
      }}
      filterClearedCallback={() => {
        setSearchOptions((prev) => ({
          ...prev,
          issue_state: [],
        }));
      }}
      value={value}
      name="issueState"
      isMulti
      info={true}
      isSearchable={false}
    />
  );
};
