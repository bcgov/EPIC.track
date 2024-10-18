import React from "react";
import { createTheme } from "@mui/material";
import {
  MET_Header_Font_Weight_Bold,
  MET_Header_Font_Weight_Regular,
} from "./constants";
import { CheckboxRegular, CheckboxChecked } from "../components/icons/checkbox";

export const Palette = {
  neutral: {
    main: "#6D7274",
    dark: "#313132",
    light: "#858A8C",
    accent: {
      light: "#C2C4C5",
      dark: "#494949",
    },
    bg: {
      main: "#F2F2F2",
      dark: "#DBDCDC",
      light: "#F9F9FB",
    },
    "300": "#B2B5B6",
  },
  primary: {
    main: "#036",
    light: "#38598A",
    dark: "#00264D",
    accent: {
      main: "#1A5A96",
      light: "#0070E0",
    },
    bg: {
      main: "#D6EBFF",
      dark: "#85C2FF",
      light: "#F0F8FF",
    },
  },
  secondary: {
    main: "#FCBA19",
    dark: "#674901",
    light: "#FDD166",
    bg: {
      light: "#FEEEC5",
      main: "FEDD8C",
    },
  },
  success: {
    main: "#2E8540",
    dark: "#236430",
    light: "#70CD83",
    bg: {
      light: "#D6F1DC",
    },
  },
  error: {
    main: "#D8292F",
    dark: "#A31E22",
    light: "#E57074",
    bg: {
      light: "#FCEDEE",
    },
  },
  white: "#FFFFFF",
  black: "#000000",
  purple: "#4006AC",
  hover: {
    light: "#4C81AF",
  },
};

export const BaseTheme = createTheme({
  palette: {
    neutral: {
      main: Palette.neutral.main,
      dark: Palette.neutral.dark,
      light: Palette.neutral.light,
    },
    primary: {
      main: Palette.primary.main,
      light: Palette.primary.light,
      dark: Palette.primary.dark,
      contrastText: Palette.white,
    },
    secondary: {
      main: Palette.secondary.main,
      dark: Palette.secondary.dark,
      light: Palette.secondary.light,
      contrastText: Palette.black,
    },
    error: {
      main: Palette.error.main,
      dark: Palette.error.dark,
      light: Palette.error.light,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          "&>:not(:first-of-type)": {
            marginLeft: "16px",
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ ownerState, theme }) => ({
          ...(ownerState.maxWidth === "md" && {
            maxWidth: "680px",
          }),
          ...(ownerState.maxWidth === "lg" && {
            maxWidth: "832px",
          }),
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          boxShadow: "none",
          fontWeight: MET_Header_Font_Weight_Bold,
          fontFamily: "BCSans",
          padding: "0.75rem 1rem",
          ...(ownerState.size === "medium" && {
            fontSize: "0.875rem",
            lineHeight: "1rem",
            height: "2.5rem",
          }),
          ...(ownerState.size === "large" && {
            fontSize: "1rem",
            lineHeight: "1.5rem",
            height: "3rem",
          }),
          ...((ownerState.variant === "contained" &&
            ownerState.color === "primary" && {
              "&:hover": {
                backgroundColor: Palette.primary.light,
                boxShadow: "none",
              },
              "&:active": {
                backgroundColor: Palette.primary.dark,
              },
              "&:disabled": {
                backgroundColor: Palette.neutral.light,
                color: Palette.white,
              },
            }) ||
            (ownerState.color === "secondary" && {
              "&:hover": {
                backgroundColor: Palette.secondary.light,
                boxShadow: "none",
              },
              "&:active": {
                backgroundColor: Palette.secondary.dark,
                color: Palette.white,
              },
              "&:disabled": {
                backgroundColor: Palette.neutral.light,
                color: Palette.white,
              },
            })),
          ...(ownerState.variant === "outlined" &&
            ownerState.color === "primary" && {
              background: Palette.white,
              border: `2px solid ${Palette.primary.main}`,
              "&:hover": {
                backgroundColor: Palette.primary.main,
                border: `2px solid ${Palette.primary.main}`,
                color: Palette.white,
                boxShadow: "none",
              },
              "&:active": {
                backgroundColor: Palette.primary.dark,
                color: Palette.white,
              },
              "&:disabled": {
                border: `2px solid ${Palette.neutral.light}`,
                backgroundColor: Palette.white,
                color: Palette.neutral.light,
              },
            }),
          ...(ownerState.variant === "text" &&
            ownerState.color === "primary" && {
              background: Palette.white,
              border: `2px solid ${Palette.white}`,
              color: Palette.primary.accent.main,
              borderRadius: "4px",
              "&:hover": {
                backgroundColor: Palette.neutral.bg.main,
                border: `2px solid ${Palette.neutral.bg.main}`,
                boxShadow: "none",
              },
              "&:active": {
                backgroundColor: Palette.white,
                border: `2px solid ${Palette.primary.accent.light}`,
              },
              "&:disabled": {
                border: `2px solid ${Palette.white}`,
                backgroundColor: Palette.white,
                color: Palette.neutral.light,
              },
            }),
        }),
      },
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiRadio: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          "&.Mui-checked": {
            color: Palette.primary.accent.main,
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          "&.MuiOutlinedInput-root": {
            backgroundColor: Palette.white,
            "&.Mui-disabled": {
              backgroundColor: Palette.neutral.bg.dark,
            },
            "& fieldset": {
              border: `2px solid ${Palette.neutral.accent.light}`,
            },
            "&:hover fieldset": {
              borderColor: Palette.primary.accent.light,
            },
            "&.Mui-focused fieldset": {
              borderColor: Palette.primary.accent.light,
            },
            "&.Mui-disabled fieldset": {
              borderColor: Palette.neutral.accent.light,
            },
          },
        },
      },
    },
    MuiCheckbox: {
      defaultProps: {
        disableRipple: true,
        icon: <CheckboxRegular />,
        checkedIcon: <CheckboxChecked />,
      },
      styleOverrides: {
        root: {
          "&.Mui-disabled svg": {
            fill: `${Palette.neutral.bg.dark} !important`,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          border: 0,
        },
      },
      defaultProps: {
        size: "small",
      },
    },
    MuiLink: {
      defaultProps: {
        color: Palette.primary.accent.main,
      },
    },
    MuiFormLabel: {
      defaultProps: {
        focused: false,
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: Palette.neutral.accent.dark,
          color: Palette.white,
          borderRadius: "4px",
          padding: "4px 8px",
          fontSize: "0.75rem",
          maxWidth: "300px",
          margin: "2px",
          overflowWrap: "break-word",
          fontWeight: MET_Header_Font_Weight_Regular,
          lineHeight: "1rem",
          textAlign: "center",
        },
        tooltipArrow: {
          backgroundColor: Palette.neutral.accent.dark,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: "1rem",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        "*": {
          scrollbarWidth: "thin",
          scrollbarColor: "#B7B7B7 transparent",
          "&::-webkit-scrollbar": {
            width: 6,
            height: 6,
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: 6,
            backgroundColor: "#B7B7B7",
            minHeight: 24,
            minWidth: 24,
          },
          "&::-webkit-scrollbar-thumb:focus": {
            backgroundColor: "#adadad",
          },
          "&::-webkit-scrollbar-thumb:active": {
            backgroundColor: "#adadad",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#adadad",
          },
          "&::-webkit-scrollbar-corner": {
            backgroundColor: "transparent",
          },
        },
      },
    },
  },
  typography: {
    fontFamily: '"BCSans",·"Noto·Sans",·Verdana,·Arial,·sans-serif',
    h1: {
      fontWeight: MET_Header_Font_Weight_Regular,
      fontSize: "2rem",
      lineHeight: "1.5rem",
    },
    h2: {
      fontWeight: MET_Header_Font_Weight_Regular,
      fontSize: "1.75rem",
      lineHeight: "1.4rem",
      letterSpacing: "-1.12px",
    },
    h3: {
      fontSize: "1.5rem",
      lineHeight: "1.3rem",
      fontWeight: MET_Header_Font_Weight_Regular,
    },
    h4: {
      fontSize: "1.25rem",
      lineHeight: "1.6rem",
      fontWeight: MET_Header_Font_Weight_Regular,
    },
    subtitle1: {
      fontSize: "1.125rem",
      lineHeight: "1.3rem",
      fontWeight: MET_Header_Font_Weight_Regular,
    },
    caption: {
      fontWeight: MET_Header_Font_Weight_Regular,
      fontSize: "0.8125rem",
      lineHeight: "1.2rem",
    },
    body1: {
      fontWeight: MET_Header_Font_Weight_Regular,
      fontSize: "1rem",
      lineHeight: "1.5rem",
    },
    button: {
      fontWeight: 700,
      fontSize: "1.125rem",
      textTransform: "none",
    },
  },
});
