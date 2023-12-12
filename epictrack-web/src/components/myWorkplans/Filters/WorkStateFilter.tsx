import { useContext } from "react";
import { WORK_STATE } from "../../shared/constants";
import FilterSelect from "../../shared/filterSelect/FilterSelect";
import { MyWorkplansContext } from "../MyWorkPlanContext";

export const WorkStateFilter = () => {
  const { setSearchOptions } = useContext(MyWorkplansContext);

  const options = Object.values(WORK_STATE).map((state) => ({
    label: state.label,
    value: state.value,
  }));

  return (
    <FilterSelect
      options={options}
      variant="inline"
      placeholder="Work State"
      filterAppliedCallback={(value) => {
        if (!value) return;

        setSearchOptions((prev) => ({
          ...prev,
          work_states: value as string[],
        }));
      }}
      name="workState"
      isMulti
      info={true}
      defaultValue={[
        {
          label: WORK_STATE.IN_PROGRESS.label,
          value: WORK_STATE.IN_PROGRESS.value,
        },
      ]}
    />
  );
};
