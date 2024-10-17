import { useContext, useEffect, useMemo, useState } from "react";
import FilterSelect from "../../shared/filterSelect/FilterSelect";
import { OptionType } from "../../shared/filterSelect/type";
import { MyWorkplansContext } from "../MyWorkPlanContext";
import RegionService from "../../../services/regionService";
import { REGIONS } from "../../shared/constants";

export const EnvRegionFilter = () => {
  const { setSearchOptions, searchOptions } = useContext(MyWorkplansContext);

  const [options, setOptions] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const response = await RegionService.getRegions(REGIONS.ENV);
      const regions = response.data.map((region) => ({
        label: region.name,
        value: region.id.toString(),
      }));
      setOptions(regions);
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
      searchOptions.regions.includes(String(option.value))
    );
  }, [searchOptions.regions, options]);

  return (
    <FilterSelect
      value={value}
      options={options}
      variant="inline-standalone"
      placeholder="Region"
      filterAppliedCallback={(value) => {
        if (!value) return;

        setSearchOptions((prev) => ({ ...prev, regions: value as string[] }));
      }}
      filterClearedCallback={() => {
        setSearchOptions((prev) => ({
          ...prev,
          regions: [],
        }));
      }}
      name="region"
      isMulti
      info={true}
      isLoading={loading}
    />
  );
};
