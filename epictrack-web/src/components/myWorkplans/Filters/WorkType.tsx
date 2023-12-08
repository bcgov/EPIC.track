import { useEffect, useState } from "react";
import FilterSelect from "../../shared/filterSelect/FilterSelect";
import { OptionType } from "../../shared/filterSelect/type";
import workService from "../../../services/workService/workService";

export const WorkTypeFilter = () => {
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
      filterAppliedCallback={() => {
        return;
      }}
      name="workType"
      isMulti
      info={true}
      isLoading={loading}
    />
  );
};
