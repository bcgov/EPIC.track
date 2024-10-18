import { useContext, useMemo } from "react";
import { WORK_STATE } from "../../shared/constants";
import FilterSelect from "../../shared/filterSelect/FilterSelect";
import { DEFAULT_WORK_STATE, MyWorkplansContext } from "../MyWorkPlanContext";

export const WorkStateFilter = () => {
  const { setSearchOptions, searchOptions } = useContext(MyWorkplansContext);

  const options = Object.values(WORK_STATE).map((state) => ({
    label: state.label,
    value: state.value,
  }));

  const value = useMemo(() => {
    return options.filter((option) =>
      searchOptions.work_states.includes(String(option.value))
    );
  }, [searchOptions.work_states, options]);

  return (
    <FilterSelect
      value={value}
      options={options}
      variant="inline-standalone"
      placeholder="Work State"
      filterAppliedCallback={(value) => {
        if (!value) return;

        setSearchOptions((prev) => ({
          ...prev,
          work_states: value as string[],
        }));
      }}
      filterClearedCallback={() => {
        setSearchOptions((prev) => ({
          ...prev,
          work_states: [],
        }));
      }}
      name="workState"
      isMulti
      info={true}
    />
  );
};
