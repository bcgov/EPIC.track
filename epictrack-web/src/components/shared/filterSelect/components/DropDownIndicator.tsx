import React from "react";
import { components, DropdownIndicatorProps } from "react-select";
import { Palette } from "../../../../styles/theme";
import { IconProps } from "../../../icons/type";
import Icons from "../../../icons";

const ExpandIcon: React.FC<IconProps> = Icons["ExpandIcon"];

const DropdownIndicator = (props: DropdownIndicatorProps) => {
  return (
    <components.DropdownIndicator {...props}>
      <ExpandIcon
        fill={
          props.hasValue ? Palette.primary.accent.light : Palette.neutral.dark
        }
      />
    </components.DropdownIndicator>
  );
};

export default DropdownIndicator;
