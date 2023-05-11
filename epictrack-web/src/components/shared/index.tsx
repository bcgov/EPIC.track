import React from "react";

import { Typography, FormLabel, Grid } from "@mui/material";
import { SxProps, styled } from "@mui/system";
import {
  MET_Header_Font_Family,
  MET_Header_Font_Weight,
} from "../../styles/constants";

interface HeaderProps {
  sx?: SxProps;
  color?: string;
  bold?: boolean;
  children?: React.ReactNode | string;
  [prop: string]: unknown;
}

export const EpicTrackPageGridContainer = styled(Grid)(() => ({
  padding: "6em 2em 1em 2em",
  justifyContent: "flex-start",
  alignItems: "flex-start",
}));

export const EpicTrackH1 = ({ bold, children, sx, ...rest }: HeaderProps) => {
  return (
    <Typography
      sx={{
        ...sx,
        fontSize: "1.9375em",
        fontWeight: bold ? "bold" : MET_Header_Font_Weight,
        fontFamily: MET_Header_Font_Family,
      }}
      variant="h2"
      {...rest}
    >
      {children}
    </Typography>
  );
};
export const EpicTrackH2 = ({ bold, children, sx, ...rest }: HeaderProps) => {
  return (
    <Typography
      sx={{
        ...sx,
        fontSize: "1.9rem",
        fontWeight: bold ? "bold" : MET_Header_Font_Weight,
        fontFamily: MET_Header_Font_Family,
      }}
      variant="h2"
      {...rest}
    >
      {children}
    </Typography>
  );
};
export const EpicTrackH3 = ({ bold, children, sx, ...rest }: HeaderProps) => {
  return (
    <Typography
      sx={{
        ...sx,
        fontSize: "1.5rem",
        fontWeight: bold ? "bold" : MET_Header_Font_Weight,
        fontFamily: MET_Header_Font_Family,
      }}
      variant="h3"
      {...rest}
    >
      {children}
    </Typography>
  );
};
export const EpicTrackH4 = ({
  bold,
  color,
  children,
  sx,
  ...rest
}: HeaderProps) => {
  return (
    <Typography
      color={color}
      sx={{
        ...sx,
        fontSize: "1.3rem",
        fontWeight: bold ? "bold" : MET_Header_Font_Weight,
        fontFamily: MET_Header_Font_Family,
      }}
      variant="h4"
      {...rest}
    >
      {children}
    </Typography>
  );
};

export const EpicTrackH5 = ({
  bold,
  color,
  children,
  sx,
  ...rest
}: HeaderProps) => {
  return (
    <Typography
      color={color}
      sx={{
        ...sx,
        fontSize: "1rem",
        fontWeight: bold ? "bold" : MET_Header_Font_Weight,
        fontFamily: MET_Header_Font_Family,
      }}
      variant="h5"
      {...rest}
    >
      {children}
    </Typography>
  );
};

export const TrackLabel = styled(FormLabel)(() => ({
  fontSize: "16px",
  fontWeight: "bold",
}));
