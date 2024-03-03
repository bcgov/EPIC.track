import React from "react";
import {
  Box,
  BoxProps,
  Stack,
  SxProps,
  Grid,
  GridProps,
  Link,
  Collapse,
} from "@mui/material";
import { ETDescription } from "components/shared";
import { Palette } from "styles/theme";

type InsightsAccordionProps = {
  children: React.ReactNode;
  expanded?: boolean;
  sx?: SxProps;
  onClick?: () => void;
};
export const InsightsAccordion = ({
  children,
  expanded = false,
  onClick = () => {
    return;
  },
  sx,
}: InsightsAccordionProps) => {
  return (
    <InsightsAccordionProvider expanded={expanded} onClick={onClick}>
      <Stack
        direction="column"
        spacing={0}
        sx={{
          ...sx,
          border: `1px solid ${Palette.neutral.bg.dark}`,
          paddingBottom: "24px",
        }}
      >
        {children}
      </Stack>
    </InsightsAccordionProvider>
  );
};

export const InsightsAccordionSummary = ({ children, ...rest }: GridProps) => {
  const { onClick, expanded } = useInsightsAccordionContext();
  return (
    <Grid
      container
      height="56px"
      direction="row"
      justifyContent={"flex-start"}
      alignItems={"center"}
      sx={{
        backgroundColor: Palette.neutral.bg.light,
        borderBottom: `1px solid ${Palette.neutral.bg.dark}`,
        padding: "0 24px 0 24px",
      }}
      {...rest}
    >
      <Grid item xs>
        {children}
      </Grid>
      <Grid item xs={3} container justifyContent={"flex-end"}>
        <ETDescription>
          <Link
            onClick={(e) => {
              e.preventDefault();
              onClick && onClick();
            }}
            sx={{
              cursor: "pointer",
            }}
          >
            {expanded ? "Show Less" : "Show More"}
          </Link>
        </ETDescription>
      </Grid>
    </Grid>
  );
};

export const InsightsAccordionDetails = ({ children, ...rest }: BoxProps) => {
  return (
    <Box
      {...rest}
      sx={{
        padding: "24px 24px 0 24px",
      }}
    >
      {children}
    </Box>
  );
};

export const InsightsAccordionCollapsableDetails = ({
  children,
  ...rest
}: BoxProps) => {
  const { expanded } = useInsightsAccordionContext();

  const { sx, ...otherProps } = rest;
  return (
    <Box
      sx={{
        ...sx,
        padding: "0 24px 0 24px",
      }}
      {...otherProps}
    >
      <Collapse in={expanded}>{children}</Collapse>
    </Box>
  );
};

type InsightsAccordionContextProps = {
  expanded: boolean;
  onClick?: () => void;
};

type InsightsAccordionProvidedProps = {
  children: React.ReactNode;
  expanded: boolean;
  onClick: () => void;
};

const InsightsAccordionContext = React.createContext<
  InsightsAccordionContextProps | undefined
>(undefined);

export const useInsightsAccordionContext = () => {
  const context = React.useContext(InsightsAccordionContext);
  if (!context) {
    throw new Error(
      "useInsightsAccordionContext must be used within an InsightsAccordionProvider"
    );
  }
  return context;
};

export const InsightsAccordionProvider = ({
  children,
  expanded = false,
  onClick = () => {
    return;
  },
}: InsightsAccordionProvidedProps) => {
  // Provide the necessary values to the context
  const contextValue: InsightsAccordionContextProps = {
    expanded,
    onClick,
  };

  return (
    <InsightsAccordionContext.Provider value={contextValue}>
      {children}
    </InsightsAccordionContext.Provider>
  );
};
