import React from "react";
import Select, { SelectInstance } from "react-select";
import Menu from "./components/Menu";
import Option from "./components/Option";
import MultiValue from "./components/MultiValueContainer";
import { OptionType, SelectProps } from "./type";
import { Palette } from "../../../styles/theme";
import SingleValue from "./components/SingleValueContainer";
import DropdownIndicator from "./components/DropDownIndicator";

const FilterSelect = (props: SelectProps) => {
  const { name, isMulti, header, column } = props;
  const [options, setOptions] = React.useState<OptionType[]>([]);
  const [selectedOptions, setSelectedOptions] = React.useState<any>();
  const [selectValue, setSelectValue] = React.useState<any>(isMulti ? [] : "");
  const [menuIsOpen, setMenuIsOpen] = React.useState<boolean>(
    !!props.menuIsOpen
  );
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

  const isOptionSelected = (o: OptionType) =>
    isMulti ? selectedOptions.includes(o.value) : selectedOptions === o.value;

  React.useEffect(() => {
    setSelectValue(isMulti ? [] : "");
  }, []);
  React.useEffect(() => {
    const currentValues = isMulti
      ? selectValue.map((v: OptionType) => v.value)
      : selectValue.value;
    setSelectedOptions(currentValues);
  }, [menuIsOpen]);

  const handleChange = (newValue: any, actionMeta: any) => {
    if (!isMulti) {
      if (isOptionSelected(newValue)) {
        setSelectedOptions("");
      } else {
        setSelectedOptions(newValue.value);
      }
      return;
    }
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
          selectedOptions.filter(
            (o: string) => o !== option.value && o !== selectAllOption.value
          )
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
    if (isMulti) {
      const value = options.filter((o: OptionType) =>
        selectedOptions.includes(o.value)
      );
      setSelectValue(value);
    } else {
      const value = options.find(
        (o: OptionType) => o.value === selectedOptions
      );
      setSelectValue(value);
    }
    setMenuIsOpen(false);
    selectRef.current?.blur();
  };

  const clearFilters = () => {
    setSelectedOptions([]);
    setSelectValue(isMulti ? [] : "");
    header.column.setFilterValue(isMulti ? [] : "");
    selectRef.current?.clearValue();
  };

  const onCancel = () => {
    const currentValues = isMulti
      ? selectValue.map((v: OptionType) => v.value)
      : selectValue.value;
    setSelectedOptions(currentValues || isMulti ? [] : "");
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

    if (isMulti) filterOptions = [selectAllOption, ...filterOptions];

    setOptions(filterOptions);
  }, [column]);

  return (
    <Select
      value={selectValue}
      placeholder={props.placeholder || "Filter"}
      name={name}
      options={options}
      isMulti={isMulti}
      onChange={handleChange}
      components={{
        Option,
        Menu,
        MultiValue,
        SingleValue,
        IndicatorSeparator: () => null,
        DropdownIndicator,
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
          display: "flex",
          alignItems: "center",
          padding: ".5rem .75rem .5rem 0px",
          fontWeight: "normal",
          fontSize: "1rem",
          background: props.isFocused ? Palette.neutral.bg.main : "transparent",
          color: props.isSelected
            ? Palette.primary.accent.main
            : Palette.neutral.accent.dark,
          cursor: props.isFocused ? "pointer" : "default",
        }),
        control: (base, props) => ({
          ...base,
          background: props.hasValue ? Palette.primary.bg.light : Palette.white,
          borderWidth: "2px",
          borderStyle: props.hasValue ? "none" : "solid",
          borderColor: props.isFocused
            ? Palette.primary.accent.light
            : Palette.neutral.accent.light,
          boxShadow: "none",
        }),
        menu: (base, props) => ({
          ...base,
          position: "relative",
          marginBlock: "0px",
          border: `1px solid ${Palette.neutral.accent.light}`,
          borderRadius: "4px",
        }),
        placeholder: (base, props) => ({
          ...base,
          fontWeight: "normal",
        }),
        menuPortal: (base, props) => ({
          ...base,
          zIndex: 2,
          marginTop: "4px",
        }),
        input: (base, props) => ({
          ...base,
          fontWeight: "400",
        }),
      }}
      isClearable={false}
      menuPortalTarget={document.body}
    />
  );
};

export default FilterSelect;
