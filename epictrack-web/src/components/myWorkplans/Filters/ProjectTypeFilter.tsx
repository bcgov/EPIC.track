import { useEffect, useState } from "react";
import projectService from "../../../services/projectService/projectService";
import FilterSelect from "../../shared/filterSelect/FilterSelect";
import { OptionType } from "../../shared/filterSelect/type";

export const ProjectTypeFilter = () => {
  const [options, setOptions] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const response = await projectService.getProjectTypes();
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
      placeholder="Project Type"
      filterAppliedCallback={() => {
        return;
      }}
      name="projectType"
      isMulti
      info={true}
      isLoading={loading}
    />
  );
};
