import { useContext, useEffect, useMemo, useState } from "react";
import projectService from "../../../services/projectService/projectService";
import FilterSelect from "../../shared/filterSelect/FilterSelect";
import { OptionType } from "../../shared/filterSelect/type";
import { MyWorkplansContext } from "../MyWorkPlanContext";

export const ProjectTypeFilter = () => {
  const { setSearchOptions, searchOptions } = useContext(MyWorkplansContext);

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

  const value = useMemo(() => {
    return options.filter((option) =>
      searchOptions.project_types.includes(String(option.value))
    );
  }, [searchOptions.project_types, options]);

  return (
    <FilterSelect
      value={value}
      options={options}
      variant="inline-standalone"
      placeholder="Project Type"
      filterAppliedCallback={(value) => {
        if (!value) return;

        setSearchOptions((prev) => ({
          ...prev,
          project_types: value as string[],
        }));
      }}
      filterClearedCallback={() => {
        setSearchOptions((prev) => ({
          ...prev,
          project_types: [],
        }));
      }}
      name="projectType"
      isMulti
      info={true}
      isLoading={loading}
    />
  );
};
