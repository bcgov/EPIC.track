import React from "react";
import Select, { SelectInstance } from "react-select";
import Menu from "./components/Menu";
import Option from "./components/Option";
import MultiValue from "./components/MultiValueContainer";
import { OptionType, SelectProps } from "./type";
import { Palette } from "../../../styles/theme";

const FilterSelect = (props: SelectProps) => {
  const { name, isMulti, header, column } = props;
  const [options, setOptions] = React.useState<OptionType[]>([]);
  const [selectedOptions, setSelectedOptions] = React.useState<any[]>([]);
  const [menuIsOpen, setMenuIsOpen] = React.useState<boolean>(false);
  const selectRef = React.useRef<SelectInstance | null>(null);

  const selectAllOption = React.useMemo(
    () => ({
      label: "Select All",
      value: "<SELECT_ALL>",
    }),
    []
  );

  const isSelectAllSelected = () =>
    selectedOptions.includes(selectAllOption.value);

  const isOptionSelected = (o: OptionType) => selectedOptions.includes(o.value);

  const handleChange = (newValue: any, actionMeta: any) => {
    const { option } = actionMeta;
    if (option === undefined) return;

    if (option.value === selectAllOption.value) {
      if (isSelectAllSelected()) {
        setSelectedOptions([]);
      } else {
        setSelectedOptions([
          selectAllOption.value,
          ...column.columnDef.filterSelectOptions,
        ]);
      }
    } else {
      if (isOptionSelected(option)) {
        setSelectedOptions(
          selectedOptions.filter((o: string) => o !== option.value)
        );
      } else {
        let value = [...selectedOptions, newValue.at(-1).value];
        value = Array.from(new Set<string>(value));
        setSelectedOptions(value || []);
      }
    }
  };

  const applyFilters = () => {
    header.column.setFilterValue(selectedOptions);
    if (selectedOptions.length === 0) {
      selectRef.current?.clearValue();
    }
    setMenuIsOpen(false);
    selectRef.current?.blur();
  };

  const clearFilters = () => {
    setSelectedOptions([]);
    header.column.setFilterValue([]);
    selectRef.current?.clearValue();
    setMenuIsOpen(false);
    selectRef.current?.blur();
  };

  const onCancel = () => {
    const currentValues = selectRef.current?.getValue() as any[];
    setSelectedOptions(currentValues || []);
    // header.column.setFilterValue([]);
    setMenuIsOpen(false);
    selectRef.current?.blur();
  };

  React.useEffect(() => {
    let filterOptions = column.columnDef.filterSelectOptions;
    // TODO: Decide whether to do this here, or format the options at cell definition level
    filterOptions = filterOptions.map((option: string) => ({
      label: option,
      value: option,
    }));

    filterOptions = [selectAllOption, ...filterOptions];

    setOptions(filterOptions);
  }, [column]);

  return (
    <Select
      value={header.column.getFilterValue() ?? undefined}
      placeholder="Filter"
      name={name}
      options={options}
      isMulti={isMulti}
      onChange={handleChange}
      components={{
        Option,
        Menu,
        MultiValue,
        IndicatorSeparator: () => null,
      }}
      filterProps={{
        applyFilters,
        clearFilters,
        selectedOptions,
        onCancel,
        variant: props.variant || "inline",
      }}
      menuIsOpen={menuIsOpen}
      closeMenuOnSelect={false}
      hideSelectedOptions={false}
      onFocus={() => setMenuIsOpen(true)}
      onBlur={() => setMenuIsOpen(false)}
      ref={selectRef}
      styles={{
        option: (base, props) => ({
          ...base,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          padding: ".5rem .75rem .5rem 0px",
        }),
        control: (base, props) => ({
          ...base,
          background: props.hasValue ? Palette.primary.bg.light : "initial",
          borderStyle: props.hasValue ? "none" : "solid",
        }),
        menu: (base, props) => ({
          ...base,
          top: "2.35rem",
          marginTop: "4px",
        }),
      }}
      isClearable={false}
    />
  );
};

export default FilterSelect;
