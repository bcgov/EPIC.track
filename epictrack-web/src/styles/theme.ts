import { createTheme } from "@mui/material";
import {
  MET_Header_Font_Weight_Bold,
  MET_Header_Font_Weight_Regular,
} from "./constants";
export const Palette = {
  nuetral: {
    main: "#6D7274",
    dark: "#313132",
    light: "#858A8C",
    accent: {
      light: "#C2C4C5",
    },
    bg: {
      main: "#F2F2F2",
      dark: "#DBDCDC",
      light: "#F9F9FB",
    },
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
  hover: {
    light: "#4C81AF",
  },
  text: {
    primary: "#494949",
  },
};

export const BaseTheme = createTheme({
  palette: {
    neutral: {
      main: Palette.nuetral.main,
      dark: Palette.nuetral.dark,
      light: Palette.nuetral.light,
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
    text: {
      primary: Palette.text.primary,
    },
    error: {
      main: Palette.error.main,
      dark: Palette.error.dark,
      light: Palette.error.light,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          fontWeight: MET_Header_Font_Weight_Bold,
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
              },
              "&:active": {
                backgroundColor: Palette.primary.dark,
              },
              "&:disabled": {
                backgroundColor: Palette.nuetral.light,
                color: Palette.white,
              },
            }) ||
            (ownerState.color === "secondary" && {
              "&:hover": {
                backgroundColor: Palette.secondary.light,
              },
              "&:active": {
                backgroundColor: Palette.secondary.dark,
                color: Palette.white,
              },
              "&:disabled": {
                backgroundColor: Palette.nuetral.light,
                color: Palette.white,
              },
            })),
          ...(ownerState.variant === "outlined" &&
            ownerState.color === "primary" && {
              background: Palette.white,
              border: `2px solid ${Palette.primary.main}`,
              "&:hover": {
                backgroundColor: Palette.primary.main,
                color: Palette.white,
              },
              "&:active": {
                backgroundColor: Palette.primary.dark,
                color: Palette.white,
              },
              "&:disabled": {
                border: `2px solid ${Palette.nuetral.light}`,
                backgroundColor: Palette.white,
                color: Palette.nuetral.light,
              },
            }),
        }),
      },
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          "&.MuiOutlinedInput-root": {
            "& fieldset": {
              border: `2px solid ${Palette.nuetral.bg.dark}`,
            },
            "&:hover fieldset": {
              borderColor: Palette.primary.accent.light,
            },
            "&.Mui-focused fieldset": {
              borderColor: Palette.primary.accent.light,
            },
          },
        },
      },
    },
    // MuiCheckbox: {
    //   styleOverrides: {
    //     root: {
    //       "&.Mui-checked": {
    //         "& svg": {
    //           fontSize: "10rem",
    //           "& path": {
    //             fill: "#1A5A96",
    //             fillRule: "evenodd",
    //             clipRule: "evenodd",
    //           },
    //         },
    //       },
    //     },
    //   },
    // },
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
      fontSize: "0.8125em",
      lineHeight: "1.2em",
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
