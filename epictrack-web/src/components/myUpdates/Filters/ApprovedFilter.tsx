import { FC, useContext, useMemo } from "react";
import FilterSelect from "../../shared/filterSelect/FilterSelect";
import { OptionType } from "components/shared/filterSelect/type";
import { MyStatusesContext } from "../myStatuses/MyStatusContext";

interface ApprovedFilterProps {
  searchOptions?: any;
  setSearchOptions?: React.Dispatch<React.SetStateAction<any>>;
}

export const ApprovedFilter: FC<ApprovedFilterProps> = ({
  searchOptions: propSearchOptions,
  setSearchOptions: propSetSearchOptions,
}) => {
  const context = useContext(MyStatusesContext);
  const searchOptions = propSearchOptions ?? context.searchOptions;
  const setSearchOptions = propSetSearchOptions ?? context.setSearchOptions;

  const isApprovedOptions: OptionType[] = useMemo(
    () => [
      {
        label: "Approved",
        value: "true",
      },
      {
        label: "Needs Approval",
        value: "false",
      },
    ],
    []
  );

  const value = useMemo(() => {
    return isApprovedOptions.filter((option) =>
      searchOptions.is_approved.includes(String(option.value))
    );
  }, [searchOptions.is_approved, isApprovedOptions]);

  return (
    <FilterSelect
      options={isApprovedOptions}
      variant="inline-standalone"
      placeholder={"Approval"}
      filterAppliedCallback={(value) => {
        if (!value) return;
        setSearchOptions((prev: any) => ({
          ...prev,
          is_approved: value as string[],
        }));
      }}
      filterClearedCallback={() => {
        setSearchOptions((prev: any) => ({
          ...prev,
          is_approved: [],
        }));
      }}
      value={value}
      name="isApproved"
      isMulti
      info={true}
      isSearchable={false}
      controlShouldRenderValue={true}
    />
  );
};
