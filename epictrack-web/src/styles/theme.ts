import { createTheme } from "@mui/material";
export const Palette = {
  primary: {
    main: "#003366",
    light: "#D6EBFF",
    dark: "#38598A",
    main100: "#85c2ff",
    main200: "#3399ff",
    main300: "#1A5A96",
  },
  secondary: {
    main: "#FCBA19",
    dark: "#fdc63f",
    light: "#fff4d9",
    main100: "#feeec5",
    main200: "#fedd8c",
    main300: "#fdd166",
  },
  success: {
    main: "#2E8540",
    dark: "#236430",
    light: "#d6f1dc",
    main100: "#c2eaca",
    main200: "#99dca6",
    main300: "#70cd83",
  },
  error: {
    main: "#df4d52",
    dark: "#D8292F",
    light: "#fcedee",
    main100: "#f5cacb",
    main200: "#eb9497",
    main300: "#e57074",
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
  },
  typography: {
    fontFamily: '"BCSans",·"Noto·Sans",·Verdana,·Arial,·sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: "1.15rem",
    },
    body1: {
      fontWeight: 500,
      fontSize: "16px",
    },
    button: {
      fontWeight: 700,
      fontSize: "1.125rem",
      textTransform: "none",
    },
  },
});
