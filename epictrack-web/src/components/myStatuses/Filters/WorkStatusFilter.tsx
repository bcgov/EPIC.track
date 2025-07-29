import { useContext, useMemo } from "react";
import FilterSelect from "../../shared/filterSelect/FilterSelect";
import { MyStatusesContext } from "../MyStatusContext";
import { isActiveOptions } from "../constants";

export const WorkStatusFilter = () => {
  const { setSearchOptions, searchOptions } = useContext(MyStatusesContext);

  const statusesOptions = isActiveOptions;

  const value = useMemo(() => {
    return statusesOptions.filter((option) => {
      return searchOptions.work_is_active.includes(String(option.value));
    });
  }, [searchOptions.work_is_active, statusesOptions]);

  return (
    <FilterSelect
      options={statusesOptions}
      variant="inline-standalone"
      placeholder={"Work Status"}
      filterAppliedCallback={(value) => {
        if (!value) return;
        setSearchOptions((prev) => ({
          ...prev,
          work_is_active: value as string[],
        }));
      }}
      filterClearedCallback={() => {
        setSearchOptions((prev) => ({
          ...prev,
          work_is_active: [],
        }));
      }}
      value={value}
      name="workStatus"
      isMulti
      info={true}
      isSearchable={false}
    />
  );
};
