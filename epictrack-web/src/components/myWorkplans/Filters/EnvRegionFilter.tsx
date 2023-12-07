import { useEffect, useState } from "react";
import FilterSelect from "../../shared/filterSelect/FilterSelect";
import EAOTeamService from "../../../services/eao_team";
import { OptionType } from "../../shared/filterSelect/type";

export const EnvRegionFilter = () => {
  const [options, setOptions] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const response = await EAOTeamService.getEaoTeams();
      const teams = response.data.map((team) => ({
        label: team.name,
        value: team.id.toString(),
      }));
      setOptions(teams);
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
      placeholder="Region"
      filterAppliedCallback={() => {
        return;
      }}
      name="region"
      isMulti
      info={true}
      isLoading={loading}
    />
  );
};
