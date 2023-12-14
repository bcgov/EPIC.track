import { useContext } from "react";
import { WORK_STATE } from "../../shared/constants";
import FilterSelect from "../../shared/filterSelect/FilterSelect";
import { DEFAULT_WORK_STATE, MyWorkplansContext } from "../MyWorkPlanContext";

export const WorkStateFilter = () => {
  const { setSearchOptions } = useContext(MyWorkplansContext);

  const options = Object.values(WORK_STATE).map((state) => ({
    label: state.label,
    value: state.value,
  }));

  return (
    <FilterSelect
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
      defaultValue={[
        {
          label: DEFAULT_WORK_STATE.label,
          value: DEFAULT_WORK_STATE.value,
        },
      ]}
    />
  );
};
