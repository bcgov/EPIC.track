import React from "react";
import clsx from "clsx";
import { makeStyles } from "@mui/styles";
import { components, DropdownIndicatorProps } from "react-select";
import { Palette } from "../../../../styles/theme";
import { IconProps } from "../../../icons/type";
import Icons from "../../../icons";

const ExpandIcon: React.FC<IconProps> = Icons["ExpandIcon"];

const useStyles = makeStyles({
  accordionIcon: {
    fill: (props: DropdownIndicatorProps) =>
      props.hasValue ? Palette.primary.accent.light : Palette.neutral.dark,
    cursor: "pointer",
  },
  menuOpen: {
    transform: "rotate(180deg)",
  },
});
const DropdownIndicator = (props: DropdownIndicatorProps) => {
  const classes = useStyles(props);

  return (
    <components.DropdownIndicator
      {...props}
      className={clsx({
        [classes.menuOpen]: props.selectProps.menuIsOpen,
      })}
    >
      <ExpandIcon className={classes.accordionIcon} />
    </components.DropdownIndicator>
  );
};

export default DropdownIndicator;
