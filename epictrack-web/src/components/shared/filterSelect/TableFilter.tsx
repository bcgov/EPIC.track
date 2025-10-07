import { useCallback, useEffect, useMemo } from "react";
import FilterSelect from "./FilterSelect";
import { TableFilterProps } from "./type";

const makeTableFilter =
  <SelectProps extends object>(
    Component: React.ComponentType<SelectProps>,
  ): React.FC<TableFilterProps> =>
  ({ header, column, ...props }: TableFilterProps) => {
    const setFilter = useCallback(
      (
        value:
          | { value: any; label: string }[]
          | { value: any; label: string }
          | string[]
          | string,
      ) => {
        if (Array.isArray(value)) {
          column.setFilterValue(
            value.map((v) => (typeof v === "object" ? v.value : v)),
          );
        } else if (typeof value === "object" && value !== null) {
          column.setFilterValue([value.value]);
        } else if (value) {
          column.setFilterValue([value]);
        } else {
          column.setFilterValue([]);
        }
      },
      [column],
    );

    const toOptionType = (option: any) => {
      if (typeof option === "object") {
        return { label: option.text ?? option.label, value: option.value };
      }
      return { label: String(option), value: option };
    };

    const options = useMemo(() => {
      const rawOptions = column.columnDef?.filterSelectOptions ?? [];
      return rawOptions.map(toOptionType);
    }, [column]);

    const defaultValue = useMemo(() => {
      const raw = column.getFilterValue();
      if (!raw) return [];
      if (Array.isArray(raw)) return raw.map(toOptionType);
      return [toOptionType(raw)];
    }, [column]);

    useEffect(() => {
      // Ensure initial value is set in correct format
      if (!Array.isArray(column.getFilterValue())) {
        column.setFilterValue([]);
      }
    }, [column]);

    return (
      <Component
        {...(props as SelectProps)}
        options={options}
        filterAppliedCallback={setFilter}
        filterClearedCallback={() => setFilter([])}
        defaultValue={defaultValue}
      />
    );
  };

export const TableFilter = makeTableFilter(FilterSelect);
