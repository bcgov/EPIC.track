import { FC, useContext, useMemo } from "react";
import FilterSelect from "../../shared/filterSelect/FilterSelect";
import { MyStatusesContext } from "../myStatuses/MyStatusContext";
import { StalenessEnum } from "constants/application-constant";
import { OptionType } from "components/shared/filterSelect/type";

const stalenessOptions: OptionType[] = [
  {
    label: "Stale",
    value: StalenessEnum.CRITICAL,
  },
  {
    label: "Warning",
    value: StalenessEnum.WARN,
  },
  {
    label: "Fresh",
    value: StalenessEnum.GOOD,
  },
];

interface StalenessFilterProps {
  searchOptions?: any;
  setSearchOptions?: React.Dispatch<React.SetStateAction<any>>;
}

export const StalenessFilter: FC<StalenessFilterProps> = ({
  searchOptions: propSearchOptions,
  setSearchOptions: propSetSearchOptions,
}) => {
  const context = useContext(MyStatusesContext);
  const searchOptions = propSearchOptions ?? context.searchOptions;
  const setSearchOptions = propSetSearchOptions ?? context.setSearchOptions;

  const value = useMemo(() => {
    return stalenessOptions.filter((option) =>
      searchOptions.staleness.includes(String(option.value)),
    );
  }, [searchOptions.staleness]);

  return (
    <FilterSelect
      options={stalenessOptions}
      variant="inline-standalone"
      placeholder="Staleness"
      filterAppliedCallback={(value) => {
        if (!value) return;
        setSearchOptions((prev) => ({ ...prev, staleness: value as string[] }));
      }}
      filterClearedCallback={() => {
        setSearchOptions((prev) => ({
          ...prev,
          staleness: [],
        }));
      }}
      value={value}
      name="staleness"
      isMulti
      info={true}
      isSearchable={false}
    />
  );
};
