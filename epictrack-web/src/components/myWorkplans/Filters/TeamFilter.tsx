import { useEffect, useState } from "react";
import FilterSelect from "../../shared/filterSelect/FilterSelect";
import EAOTeamService from "../../../services/eao_team";
import { OptionType } from "../../shared/filterSelect/type";

export const TeamFilter = () => {
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
      placeholder={"Team"}
      filterAppliedCallback={() => {
        return;
      }}
      name="team"
      isMulti
      info={true}
      isLoading={loading}
      isDisabled={loading}
    />
  );
};
