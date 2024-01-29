import React from "react";
import Select from "react-select";
import Menu from "./components/Menu";
import Option from "./components/Option";
import MultiValue from "./components/MultiValueContainer";
import { OptionType, SelectProps } from "./type";
import { Palette } from "../../../styles/theme";
import SingleValue from "./components/SingleValueContainer";
import DropdownIndicator from "./components/DropDownIndicator";
import { MET_Header_Font_Weight_Regular } from "../../../styles/constants";

const INPUT_SIZE = "0.875rem";
const FilterSelect = (props: SelectProps) => {
  const { name, isMulti, defaultValue } = props;
  const standardDefault = isMulti ? [] : "";
  const [options, setOptions] = React.useState<OptionType[]>([]);
  const [selectedOptions, setSelectedOptions] = React.useState<any>();
  const [selectValue, setSelectValue] = React.useState<any>(
    defaultValue ?? standardDefault
  );
  const [menuIsOpen, setMenuIsOpen] = React.useState<boolean>(
    !!props.menuIsOpen
  );
  const selectRef = React.useRef<any | null>(null);

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
        const options = [...(props.options?.map((o: any) => o.value) || [])];
        setSelectedOptions([selectAllOption.value, ...options]);
      }
    } else {
      if (isOptionSelected(option)) {
        setSelectedOptions(
          selectedOptions.filter(
            (o: string) => o !== option.value && o !== selectAllOption.value
          )
        );
      } else {
        let value = [...selectedOptions, option.value];
        value = Array.from(new Set<string>(value));
        setSelectedOptions(value || []);
      }
    }
  };

  const applyFilters = () => {
    if (props.filterAppliedCallback) {
      props.filterAppliedCallback(selectedOptions);
    }
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
    if (props.filterClearedCallback) {
      props.filterClearedCallback(isMulti ? [] : "");
    }
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
    let filterOptions = props.options as OptionType[];
    if (isMulti) filterOptions = [selectAllOption, ...filterOptions];
    setOptions(filterOptions);
  }, [props.options]);

  const isSearchable = () => {
    if (props.isSearchable !== undefined) return props.isSearchable;

    if (selectValue instanceof Array) {
      return selectValue.length === 0;
    }

    return !selectValue;
  };

  return (
    <Select
      value={selectValue}
      placeholder={props.placeholder || "Filter"}
      onMenuClose={onCancel}
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
        option: (base, provided) => ({
          ...base,
          whiteSpace: "normal",
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "flex",
          alignItems: "center",
          padding: ".5rem .75rem .5rem 0px",
          fontWeight: "normal",
          fontSize: "1rem",
          maxWidth: props.maxWidth ?? "100%",
          background: provided.isFocused
            ? Palette.neutral.bg.main
            : "transparent",
          color: provided.isSelected
            ? Palette.primary.accent.main
            : Palette.neutral.accent.dark,
          cursor: provided.isFocused ? "pointer" : "default",
        }),
        control: (base, props) => ({
          ...base,
          background: props.hasValue ? Palette.primary.bg.light : Palette.white,
          borderWidth: "2px",
          borderStyle: props.hasValue ? "none" : "solid",
          borderColor:
            props.isFocused || props.menuIsOpen
              ? Palette.primary.accent.light
              : Palette.neutral.accent.light,
          boxShadow: "none",
          ...(props.selectProps.filterProps?.variant === "bar" && {
            borderColor: props.isFocused
              ? Palette.primary.accent.light
              : "transparent",
          }),
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
          fontWeight: MET_Header_Font_Weight_Regular,
          color: Palette.neutral.light,
          fontSize: INPUT_SIZE,
          lineHeight: "1rem",
          ...(props.selectProps.filterProps?.variant == "bar" && {
            color: Palette.primary.accent.main,
            fontWeight: 700,
          }),
        }),
        menuPortal: (base, props) => ({
          ...base,
          zIndex: 2,
          marginTop: "4px",
        }),
        input: (base, props) => ({
          ...base,
          fontWeight: "400",
          fontSize: INPUT_SIZE,
        }),
      }}
      isClearable={false}
      menuPortalTarget={document.body}
      controlShouldRenderValue={props.controlShouldRenderValue}
      isLoading={props.isLoading}
      loadingMessage={() => "Loading..."}
      isDisabled={props.isDisabled}
      isSearchable={isSearchable()}
    />
  );
};

export default FilterSelect;
