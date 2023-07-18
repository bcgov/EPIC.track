import { createTheme } from "@mui/material";
import { MET_Header_Font_Weight_Regular } from "./constants";
export const Palette = {
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
      light: "#F0F8FF",
    },
  },
  secondary: {
    main: "#FCBA19",
    dark: "#e4a203",
    light: "#fdc63f",
    accent: {
      main: "#fdd166",
      light: "#FEDD8C",
    },
    bg: {
      main: "#FEEEC5",
      light: "#fff4d9",
    },
  },
  success: {
    main: "#2E8540",
    dark: "#236430",
    light: "#3cae54",
    accent: {
      main: "#70cd83",
      light: "#99dca6",
    },
    bg: {
      main: "#c2eaca",
      light: "#d6f1dc",
    },
  },
  error: {
    main: "#D8292F",
    dark: "#a31e22",
    light: "#df4d52",
    accent: {
      main: "#e57074",
      light: "#eb9497",
    },
    bg: {
      main: "#f5cacb",
      light: "#fcedee",
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
  action: {
    active: "#1A5A96",
  },
  info: {
    main: "#707070",
  },
};

export const BaseTheme = createTheme({
  palette: {
    primary: {
      main: Palette.primary.main,
      light: Palette.primary.light,
      dark: Palette.primary.dark,
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: Palette.secondary.main,
      dark: Palette.secondary.dark,
      light: Palette.secondary.light,
      contrastText: "#000000",
    },
    text: {
      primary: Palette.text.primary,
    },
    error: {
      main: Palette.error.main,
      dark: Palette.error.dark,
      light: Palette.error.light,
    },
    action: {
      active: Palette.action.active,
    },
    info: {
      main: Palette.info.main,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          height: "40px",
        },
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
      defaultProps: {
        size: "small",
      },
    },
    MuiLink: {
      defaultProps: {
        color: Palette.action.active,
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
