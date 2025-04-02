import { useCallback, useEffect, useMemo } from "react";

import FilterSelect from "./FilterSelect";
import { TableFilterProps } from "./type";

const makeTableFilter =
  <SelectProps extends object>(
    Component: React.ComponentType<SelectProps>
  ): React.FC<TableFilterProps> =>
  ({ header, column, ...props }: TableFilterProps) => {
    const filterAppliedCallback = useCallback(
      (selectedOptions: string[] | string) => {
        header.column.setFilterValue(selectedOptions);
      },
      [header]
    );

    const filterClearedCallback = useCallback(
      (value: [] | string) => {
        header.column.setFilterValue(value);
      },
      [header]
    );

    const toOptionType = (option: any) => {
      if (typeof option === "object") {
        return { label: option.text, value: option.value };
      }
      return { label: option, value: option };
    };
    const options = useMemo(() => {
      let filterOptions = column.columnDef.filterSelectOptions;
      filterOptions = filterOptions.map(
        (
          option:
            | string
            | {
                text: string;
                value: any;
              }
        ) => toOptionType(option)
      );
      return filterOptions;
    }, [column]);

    const handleValues = (value: string | string[]) => {
      if (!value) return value;
      if (Array.isArray(value)) {
        return value.map((val) => {
          return toOptionType(val);
        });
      }
      return toOptionType(value);
    };

    useEffect(() => {
      column.setFilterValue(column.getFilterValue());
    }, [column]);

    return (
      <Component
        {...(props as SelectProps)}
        options={options}
        filterAppliedCallback={filterAppliedCallback}
        filterClearedCallback={filterClearedCallback}
        defaultValue={handleValues(column.getFilterValue())}
      />
    );
  };

const TableFilter = makeTableFilter(FilterSelect);
export default TableFilter;
