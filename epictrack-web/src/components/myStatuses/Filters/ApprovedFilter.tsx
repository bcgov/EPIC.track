import { useContext, useMemo } from "react";
import FilterSelect from "../../shared/filterSelect/FilterSelect";
import { MyStatusesContext } from "../MyStatusContext";
import { OptionType } from "components/shared/filterSelect/type";

export const ApprovedFilter = () => {
  const { setSearchOptions, searchOptions } = useContext(MyStatusesContext);

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
        setSearchOptions((prev) => ({ ...prev, is_approved: value }));
      }}
      filterClearedCallback={() => {
        setSearchOptions((prev) => ({
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
