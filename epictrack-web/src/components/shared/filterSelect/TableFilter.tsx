import React from "react";

import FilterSelect from "./FilterSelect";
import { SelectProps, TableFilterProps } from "./type";

const makeTableFilter =
  <SelectProps extends object>(
    Component: React.ComponentType<SelectProps>
  ): React.FC<TableFilterProps> =>
  ({ header, column, ...props }: TableFilterProps) => {
    const filterAppliedCallback = React.useCallback(
      (selectedOptions: string[] | string) => {
        header.column.setFilterValue(selectedOptions);
      },
      [header]
    );

    const filterClearedCallback = React.useCallback(
      (value: [] | string) => {
        header.column.setFilterValue(value);
      },
      [header]
    );

    const options = React.useMemo(() => {
      let filterOptions = column.columnDef.filterSelectOptions;
      filterOptions = filterOptions.map((option: string) => ({
        label: option,
        value: option,
      }));
      return filterOptions;
    }, [column]);

    return (
      <Component
        {...(props as SelectProps)}
        options={options}
        filterAppliedCallback={filterAppliedCallback}
        filterClearedCallback={filterClearedCallback}
      />
    );
  };

const TableFilter = makeTableFilter(FilterSelect);
export default TableFilter;
