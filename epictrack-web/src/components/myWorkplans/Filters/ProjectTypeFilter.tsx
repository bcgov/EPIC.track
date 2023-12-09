import { useContext, useEffect, useState } from "react";
import projectService from "../../../services/projectService/projectService";
import FilterSelect from "../../shared/filterSelect/FilterSelect";
import { OptionType } from "../../shared/filterSelect/type";
import { MyWorkplansContext } from "../MyWorkPlanContext";

export const ProjectTypeFilter = () => {
  const { setSearchOptions } = useContext(MyWorkplansContext);

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
      filterAppliedCallback={(value) => {
        if (!value) return;

        setSearchOptions((prev) => ({
          ...prev,
          project_types: value as string[],
        }));
      }}
      name="projectType"
      isMulti
      info={true}
      isLoading={loading}
    />
  );
};
