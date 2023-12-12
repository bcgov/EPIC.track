import { useContext, useEffect, useState } from "react";
import FilterSelect from "../../shared/filterSelect/FilterSelect";
import EAOTeamService from "../../../services/eao_team";
import { OptionType } from "../../shared/filterSelect/type";
import { MyWorkplansContext } from "../MyWorkPlanContext";

export const TeamFilter = () => {
  const { setSearchOptions } = useContext(MyWorkplansContext);

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
      variant="inline-standalone"
      placeholder={"Team"}
      filterAppliedCallback={(value) => {
        if (!value) return;

        setSearchOptions((prev) => ({ ...prev, teams: value as string[] }));
      }}
      name="team"
      isMulti
      info={true}
      isLoading={loading}
      isDisabled={loading}
    />
  );
};
