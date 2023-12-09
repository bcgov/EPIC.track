import { useContext, useEffect, useState } from "react";
import FilterSelect from "../../shared/filterSelect/FilterSelect";
import { OptionType } from "../../shared/filterSelect/type";
import workService from "../../../services/workService/workService";
import { MyWorkplansContext } from "../MyWorkPlanContext";

export const WorkTypeFilter = () => {
  const { setSearchOptions } = useContext(MyWorkplansContext);

  const [options, setOptions] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const response = await workService.getWorkTypes();
      const types = response.data.map((type) => ({
        label: type.name,
        value: type.id.toString(),
      }));
      setOptions(types);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  return (
    <FilterSelect
      options={options}
      variant="inline"
      placeholder="Work Type"
      filterAppliedCallback={(value) => {
        if (!value) return;

        setSearchOptions((prev) => ({
          ...prev,
          work_types: value as string[],
        }));
      }}
      name="workType"
      isMulti
      info={true}
      isLoading={loading}
    />
  );
};
