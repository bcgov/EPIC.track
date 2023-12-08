import { WORK_STATE } from "../../shared/constants";
import FilterSelect from "../../shared/filterSelect/FilterSelect";

export const WorkStateFilter = () => {
  const options = Object.values(WORK_STATE).map((state) => ({
    label: state,
    value: state,
  }));

  return (
    <FilterSelect
      options={options}
      variant="inline"
      placeholder="Work State"
      filterAppliedCallback={() => {
        return;
      }}
      name="workState"
      isMulti
      info={true}
    />
  );
};
