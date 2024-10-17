import { useContext, useEffect, useMemo, useState } from "react";
import FilterSelect from "../../shared/filterSelect/FilterSelect";
import { OptionType } from "../../shared/filterSelect/type";
import workService from "../../../services/workService/workService";
import { MyWorkplansContext } from "../MyWorkPlanContext";
import { sort } from "utils";
export const WorkTypeFilter = () => {
  const { setSearchOptions, searchOptions } = useContext(MyWorkplansContext);

  const [options, setOptions] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const response = await workService.getWorkTypes();
      const sortedResponse = sort(response.data, "sort_order");
      const types = sortedResponse.map((type) => ({
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

  const value = useMemo(() => {
    return options.filter((option) =>
      searchOptions.work_types.includes(String(option.value))
    );
  }, [searchOptions.work_types, options]);

  return (
    <FilterSelect
      value={value}
      options={options}
      variant="inline-standalone"
      placeholder="Work Type"
      filterAppliedCallback={(value) => {
        if (!value) return;

        setSearchOptions((prev) => ({
          ...prev,
          work_types: value as string[],
        }));
      }}
      filterClearedCallback={() => {
        setSearchOptions((prev) => ({
          ...prev,
          work_types: [],
        }));
      }}
      name="workType"
      isMulti
      info={true}
      isLoading={loading}
    />
  );
};
