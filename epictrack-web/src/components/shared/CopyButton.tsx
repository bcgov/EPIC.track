import React from "react";
import { IconButton } from "@mui/material";
import { Palette } from "../../styles/theme";
import { showNotification } from "./notificationProvider";
import { IconProps } from "../icons/type";
import Icons from "../icons";

const CopyOutlinedIcon: React.FC<IconProps> = Icons["CopyOutlinedIcon"];
const CopyFilledIcon: React.FC<IconProps> = Icons["CopyFilledIcon"];

const CopyButton = ({ ...props }) => {
  const copyHandler = (text: string) => {
    showNotification("Copied to clipboard", {
      type: "success",
    });
    navigator.clipboard.writeText(text);
  };

  const [hover, setHover] = React.useState<boolean>(false);
  return (
    <IconButton
      onClick={() => copyHandler(props.copyText)}
      sx={{
        width: "32px",
        height: "32px",
        borderRadius: "4px",
        "& .profile-menu-icon ": {
          color: Palette.white,
          fill: Palette.primary.accent.main,
        },
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {hover ? (
        <CopyFilledIcon className="profile-menu-icon" />
      ) : (
        <CopyOutlinedIcon className="profile-menu-icon" />
      )}
    </IconButton>
  );
};

export default CopyButton;
