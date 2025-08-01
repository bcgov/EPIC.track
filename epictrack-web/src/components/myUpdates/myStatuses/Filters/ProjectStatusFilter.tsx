import { useContext, useMemo } from "react";
import FilterSelect from "../../../shared/filterSelect/FilterSelect";
import { MyStatusesContext } from "../MyStatusContext";
import { isActiveOptions } from "../../constants";

export const ProjectStatusFilter = () => {
  const { setSearchOptions, searchOptions } = useContext(MyStatusesContext);

  const statusesOptions = isActiveOptions;

  const value = useMemo(() => {
    return statusesOptions.filter((option) =>
      searchOptions.project_is_active.includes(String(option.value))
    );
  }, [searchOptions.project_is_active, statusesOptions]);

  return (
    <FilterSelect
      options={statusesOptions}
      variant="inline-standalone"
      placeholder={"Project Status"}
      filterAppliedCallback={(value) => {
        if (!value) return;
        setSearchOptions((prev) => ({
          ...prev,
          project_is_active: value as string[],
        }));
      }}
      filterClearedCallback={() => {
        setSearchOptions((prev) => ({
          ...prev,
          project_is_active: [],
        }));
      }}
      value={value}
      name="projectStatus"
      isMulti
      info={true}
      isSearchable={false}
    />
  );
};
