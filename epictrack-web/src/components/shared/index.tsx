import React from "react";

import { Typography, FormLabel, Grid, SxProps } from "@mui/material";
import {
  MET_Header_Font_Family,
  MET_Header_Font_Weight_Bold,
  MET_Header_Font_Weight_Regular,
} from "../../styles/constants";
import { useAppSelector } from "../../hooks";
import { styled } from "@mui/system";
import { Link, LinkProps } from "react-router-dom";
import { Palette } from "../../styles/theme";

interface HeaderProps {
  sx?: SxProps;
  color?: string;
  bold?: boolean;
  children?: React.ReactNode | string;
  [prop: string]: unknown;
}

interface PageContainerProps {
  children?: React.ReactNode | string;
  [prop: string]: unknown;
  sx?: SxProps;
}

export const ETPageContainer = (props: PageContainerProps) => {
  const state = useAppSelector((state) => state.uiState);
  return (
    <Grid
      {...props}
      sx={{
        ...props.sx,
        padding: `${state.showEnvBanner ? "9" : "7"}rem 2rem 1rem 2.5rem`,
        justifyContent: "flex-start",
        alignItems: "flex-start",
      }}
    >
      {props.children}
    </Grid>
  );
};
export const ETHeading1 = ({ bold, children, sx, ...rest }: HeaderProps) => {
  return (
    <Typography
      sx={{
        ...sx,
        fontWeight: bold
          ? MET_Header_Font_Weight_Bold
          : MET_Header_Font_Weight_Regular,
        fontFamily: MET_Header_Font_Family,
      }}
      variant="h1"
      {...rest}
    >
      {children}
    </Typography>
  );
};
export const ETHeading2 = ({ bold, children, sx, ...rest }: HeaderProps) => {
  return (
    <Typography
      sx={{
        ...sx,
        fontWeight: bold
          ? MET_Header_Font_Weight_Bold
          : MET_Header_Font_Weight_Regular,
        fontFamily: MET_Header_Font_Family,
      }}
      variant="h2"
      {...rest}
    >
      {children}
    </Typography>
  );
};
export const ETHeading3 = ({ bold, children, sx, ...rest }: HeaderProps) => {
  return (
    <Typography
      sx={{
        ...sx,
        fontWeight: bold
          ? MET_Header_Font_Weight_Bold
          : MET_Header_Font_Weight_Regular,
        fontFamily: MET_Header_Font_Family,
      }}
      variant="h3"
      {...rest}
    >
      {children}
    </Typography>
  );
};
export const ETHeading4 = ({
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
        fontWeight: bold
          ? MET_Header_Font_Weight_Bold
          : MET_Header_Font_Weight_Regular,
        fontFamily: MET_Header_Font_Family,
      }}
      variant="h4"
      {...rest}
    >
      {children}
    </Typography>
  );
};

export const ETSubhead = ({
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
        fontWeight: bold
          ? MET_Header_Font_Weight_Bold
          : MET_Header_Font_Weight_Regular,
        fontFamily: MET_Header_Font_Family,
      }}
      variant="subtitle1"
      {...rest}
    >
      {children}
    </Typography>
  );
};

export const ETParagraph = ({
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
        lineHeight: "1.5rem",
        fontWeight: bold
          ? MET_Header_Font_Weight_Bold
          : MET_Header_Font_Weight_Regular,
        fontFamily: MET_Header_Font_Family,
      }}
      variant="body1"
      {...rest}
    >
      {children}
    </Typography>
  );
};

export const ETCaption1 = ({
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
        fontWeight: bold
          ? MET_Header_Font_Weight_Bold
          : MET_Header_Font_Weight_Regular,
        fontFamily: MET_Header_Font_Family,
      }}
      variant="caption"
      {...rest}
    >
      {children}
    </Typography>
  );
};

export const ETCaption2 = ({
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
        fontSize: "0.875rem",
        lineHeight: "1.2rem",
        fontWeight: bold
          ? MET_Header_Font_Weight_Bold
          : MET_Header_Font_Weight_Regular,
        fontFamily: MET_Header_Font_Family,
      }}
      variant="caption"
      {...rest}
    >
      {children}
    </Typography>
  );
};

export const ETCaption3 = ({
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
        fontSize: "0.75em",
        lineHeight: "1.3em",
        fontWeight: bold
          ? MET_Header_Font_Weight_Bold
          : MET_Header_Font_Weight_Regular,
        fontFamily: MET_Header_Font_Family,
      }}
      variant="caption"
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

export const ETLink = (props: LinkProps) => (
  <Link
    style={{
      color: Palette.primary.main,
    }}
    {...props}
  />
);
