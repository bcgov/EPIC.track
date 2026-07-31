import React from "react";
import { createTheme } from "@mui/material";
import {
  MET_Header_Font_Family,
  MET_Header_Font_Weight_Bold,
  MET_Header_Font_Weight_Regular,
} from "./constants";
import * as tokens from "./designTokens";
import { CheckboxRegular, CheckboxChecked } from "../components/icons/checkbox";

/**
 * Every colour in the app resolves from B.C. Design System tokens.
 *
 * `Palette` is imported directly by ~126 files, so it stays as the public
 * surface - but its values and the MUI theme below now both read from
 * `designTokens`, so the two can no longer disagree. The `accent`/`bg`
 * sub-objects have no equivalent slot in MUI's palette type, which is why
 * `Palette` exists at all.
 *
 * Naming note: `.main` is the solid/icon colour, `.dark` is text or an icon on
 * the matching `.bg.light` tint, and `.bg.dark` is a border. Those roles come
 * from how the app already used them, not from the key names.
 */
export const Palette = {
  neutral: {
    main: tokens.typographyColorSecondary,
    dark: tokens.typographyColorPrimary,
    light: tokens.surfaceColorBorderMedium,
    accent: {
      light: tokens.surfaceColorBorderDefault,
      dark: tokens.surfaceColorBorderDark,
    },
    bg: {
      main: tokens.surfaceColorFormsDisabled,
      dark: tokens.surfaceColorBorderDefault,
      light: tokens.surfaceColorBackgroundLightGray,
    },
  },
  primary: {
    main: tokens.surfaceColorPrimaryDefault,
    light: tokens.surfaceColorPrimaryHover,
    dark: tokens.surfaceColorPrimaryPressed,
    accent: {
      main: tokens.typographyColorLink,
      light: tokens.surfaceColorBorderActive,
    },
    bg: {
      main: tokens.trackSurfaceColorRowSelected,
      light: tokens.surfaceColorBackgroundLightBlue,
    },
  },
  secondary: {
    main: tokens.supportBorderColorWarning,
    dark: tokens.trackSupportTextColorWarning,
    light: tokens.trackSurfaceColorWarningHover,
    bg: {
      light: tokens.supportSurfaceColorWarning,
    },
  },
  success: {
    main: tokens.iconsColorSuccess,
    dark: tokens.trackSupportTextColorSuccess,
    light: tokens.trackIconsColorSuccessLight,
    bg: {
      light: tokens.supportSurfaceColorSuccess,
    },
  },
  error: {
    main: tokens.supportBorderColorDanger,
    dark: tokens.trackSupportTextColorDanger,
    light: tokens.trackIconsColorDangerLight,
    bg: {
      light: tokens.supportSurfaceColorDanger,
    },
  },
  white: tokens.surfaceColorBackgroundWhite,
  black: tokens.typographyColorPrimary,
};

/** Shared focus ring. The theme sets `disableRipple`, so this is the only
 *  affordance keyboard users get. */
const focusVisibleOutline = {
  outline: `2px solid ${tokens.surfaceColorBorderActive}`,
  outlineOffset: "2px",
};

const disabledSurface = {
  backgroundColor: tokens.surfaceColorPrimaryDisabled,
  color: tokens.typographyColorDisabled,
};

/**
 * Per-variant button styling.
 *
 * This used to be a chain of spreads joined with `||` where the secondary branch
 * was gated on colour but *not* on variant, so `variant="outlined"` or `"text"`
 * with `color="secondary"` picked up the contained-secondary rules and skipped
 * its own - a disabled outlined-secondary button rendered as a filled grey block.
 * Every branch is now gated on both, and each variant has its own disabled state.
 */
const buttonVariantStyles = (
  variant: string | undefined,
  color: string | undefined,
) => {
  const isPrimary = color === "primary" || color === undefined;
  const isSecondary = color === "secondary";
  if (!isPrimary && !isSecondary) return {};

  if (variant === "contained") {
    return {
      color: isPrimary
        ? tokens.typographyColorPrimaryInvert
        : tokens.trackSupportTextColorWarning,
      "&:hover": {
        backgroundColor: isPrimary
          ? Palette.primary.light
          : Palette.secondary.light,
        boxShadow: "none",
      },
      "&:active": {
        backgroundColor: isPrimary
          ? Palette.primary.dark
          : Palette.secondary.dark,
        color: tokens.typographyColorPrimaryInvert,
      },
      "&:disabled": disabledSurface,
    };
  }

  if (variant === "outlined") {
    const border = isPrimary ? Palette.primary.main : Palette.secondary.main;
    return {
      background: Palette.white,
      border: `2px solid ${border}`,
      "&:hover": {
        backgroundColor: isPrimary
          ? Palette.primary.main
          : Palette.secondary.bg.light,
        border: `2px solid ${border}`,
        color: isPrimary ? Palette.white : Palette.secondary.dark,
        boxShadow: "none",
      },
      "&:active": {
        backgroundColor: isPrimary
          ? Palette.primary.dark
          : Palette.secondary.light,
        color: isPrimary ? Palette.white : Palette.secondary.dark,
      },
      // Stays an outline when disabled rather than becoming a filled block.
      "&:disabled": {
        border: `2px solid ${tokens.surfaceColorBorderDefault}`,
        backgroundColor: Palette.white,
        color: tokens.typographyColorDisabled,
      },
    };
  }

  if (variant === "text") {
    return {
      background: Palette.white,
      // A same-colour border keeps the box from resizing on hover/active.
      border: `2px solid ${Palette.white}`,
      color: isPrimary ? Palette.primary.accent.main : Palette.secondary.dark,
      "&:hover": {
        backgroundColor: Palette.neutral.bg.main,
        border: `2px solid ${Palette.neutral.bg.main}`,
        boxShadow: "none",
      },
      "&:active": {
        backgroundColor: Palette.white,
        border: `2px solid ${
          isPrimary ? Palette.primary.accent.light : Palette.secondary.main
        }`,
      },
      "&:disabled": {
        border: `2px solid ${Palette.white}`,
        backgroundColor: Palette.white,
        color: tokens.typographyColorDisabled,
      },
    };
  }

  return {};
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
    // Everything below was previously undefined, so validation, disabled,
    // placeholder and divider states fell through to MUI's own defaults and
    // could not be restyled through the theme at all.
    warning: {
      main: Palette.secondary.main,
      dark: Palette.secondary.dark,
      light: Palette.secondary.bg.light,
    },
    success: {
      main: Palette.success.main,
      dark: Palette.success.dark,
      light: Palette.success.bg.light,
    },
    info: {
      main: Palette.primary.accent.main,
      dark: Palette.primary.dark,
      light: Palette.primary.bg.light,
    },
    text: {
      primary: tokens.typographyColorPrimary,
      secondary: tokens.typographyColorSecondary,
      disabled: tokens.typographyColorDisabled,
    },
    action: {
      active: tokens.typographyColorLink,
      disabled: tokens.typographyColorDisabled,
      disabledBackground: tokens.surfaceColorPrimaryDisabled,
    },
    background: {
      default: tokens.surfaceColorBackgroundWhite,
      paper: tokens.surfaceColorBackgroundWhite,
    },
    divider: tokens.surfaceColorBorderDefault,
  },
  shape: {
    borderRadius: parseInt(tokens.layoutBorderRadiusMedium, 10),
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
    MuiContainer: {
      // Was a raw `@media (max-width: 576px)` in App.scss, which matches no MUI
      // breakpoint - `sm` is 600px.
      styleOverrides: {
        root: ({ theme }) => ({
          [theme.breakpoints.down("sm")]: {
            paddingLeft: 0,
            paddingRight: 0,
          },
        }),
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
        paper: ({ ownerState }) => ({
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
        root: ({ ownerState }) => ({
          boxShadow: "none",
          fontWeight: MET_Header_Font_Weight_Bold,
          padding: "0.75rem 1rem",
          borderRadius: tokens.layoutBorderRadiusMedium,
          ...(ownerState.size === "small" && {
            fontSize: tokens.typographyFontSizeLabel,
            lineHeight: tokens.typographyLineHeightLabel,
            height: "2rem",
          }),
          ...(ownerState.size === "medium" && {
            fontSize: tokens.typographyFontSizeSmallBody,
            lineHeight: "1rem",
            height: "2.5rem",
          }),
          ...(ownerState.size === "large" && {
            fontSize: tokens.typographyFontSizeBody,
            lineHeight: "1.5rem",
            height: "3rem",
          }),
          ...buttonVariantStyles(ownerState.variant, ownerState.color),
          "&.Mui-focusVisible": focusVisibleOutline,
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
      styleOverrides: {
        root: {
          "&.Mui-focusVisible": focusVisibleOutline,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: tokens.layoutBorderRadiusMedium,
          "&.Mui-focusVisible": focusVisibleOutline,
        },
      },
    },
    MuiRadio: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          color: tokens.surfaceColorBorderMedium,
          "&.Mui-checked": {
            color: Palette.primary.accent.main,
          },
          "&.Mui-disabled": {
            color: tokens.typographyColorDisabled,
          },
          "&.Mui-focusVisible": focusVisibleOutline,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          "&.MuiOutlinedInput-root": {
            backgroundColor: Palette.white,
            "&.Mui-disabled": {
              backgroundColor: tokens.surfaceColorFormsDisabled,
            },
            "& fieldset": {
              border: `2px solid ${tokens.surfaceColorBorderDefault}`,
            },
            // Hover and focus were the same colour, so focus was invisible on a
            // hovered field.
            "&:hover fieldset": {
              borderColor: tokens.surfaceColorBorderMedium,
            },
            "&.Mui-focused fieldset": {
              borderColor: tokens.surfaceColorBorderActive,
            },
            "&.Mui-error fieldset": {
              borderColor: tokens.supportBorderColorDanger,
            },
            "&.Mui-disabled fieldset": {
              borderColor: tokens.surfaceColorBorderDefault,
            },
          },
        },
        input: {
          "&::placeholder": {
            color: tokens.typographyColorPlaceholder,
            opacity: 1,
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          "&.Mui-error": {
            color: tokens.typographyColorDanger,
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
            fill: `${tokens.surfaceColorFormsDisabled} !important`,
            // The unchecked box is drawn with `stroke`, so a fill-only rule left
            // disabled unchecked checkboxes looking enabled.
            stroke: `${tokens.surfaceColorBorderDefault} !important`,
          },
          "&.Mui-focusVisible": focusVisibleOutline,
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
      styleOverrides: {
        root: {
          "&:focus-visible": focusVisibleOutline,
        },
      },
    },
    MuiFormLabel: {
      defaultProps: {
        focused: false,
      },
      styleOverrides: {
        root: {
          "&.Mui-error": { color: tokens.typographyColorDanger },
          "&.Mui-disabled": { color: tokens.typographyColorDisabled },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          "&.Mui-focusVisible": focusVisibleOutline,
          "&.Mui-disabled": { color: tokens.typographyColorDisabled },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: tokens.layoutBorderRadiusMedium,
          "&.Mui-focusVisible": focusVisibleOutline,
        },
      },
    },
    MuiAlert: {
      // There were no overrides here, so the raw MUI `<Alert>`s on the report
      // screens rendered in stock MUI colours instead of BC DS ones.
      styleOverrides: {
        root: {
          borderRadius: tokens.layoutBorderRadiusMedium,
        },
        standardSuccess: {
          backgroundColor: Palette.success.bg.light,
          color: Palette.success.dark,
        },
        standardWarning: {
          backgroundColor: Palette.secondary.bg.light,
          color: Palette.secondary.dark,
        },
        standardError: {
          backgroundColor: Palette.error.bg.light,
          color: Palette.error.dark,
        },
        standardInfo: {
          backgroundColor: Palette.primary.bg.light,
          color: Palette.primary.main,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: Palette.neutral.accent.dark,
          color: Palette.white,
          borderRadius: tokens.layoutBorderRadiusMedium,
          padding: "4px 8px",
          fontSize: tokens.typographyFontSizeLabel,
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
          fontSize: tokens.typographyFontSizeBody,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        "*": {
          scrollbarWidth: "thin",
          scrollbarColor: `${tokens.surfaceColorBorderDefault} transparent`,
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
            backgroundColor: tokens.surfaceColorBorderDefault,
            minHeight: 24,
            minWidth: 24,
          },
          "&::-webkit-scrollbar-thumb:focus": {
            backgroundColor: tokens.surfaceColorBorderMedium,
          },
          "&::-webkit-scrollbar-thumb:active": {
            backgroundColor: tokens.surfaceColorBorderMedium,
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: tokens.surfaceColorBorderMedium,
          },
          "&::-webkit-scrollbar-corner": {
            backgroundColor: "transparent",
          },
        },
      },
    },
  },
  typography: {
    fontFamily: MET_Header_Font_Family,
    fontSize: 16,
    // Sizes are unchanged from before this alignment; the line heights and
    // weights come from the BC DS type tokens. h1..h4 hold the design system's
    // h2..h5 sizes, so each one takes its matching upstream line height.
    // Headings are bold, body copy regular.
    h1: {
      fontWeight: MET_Header_Font_Weight_Bold,
      fontSize: tokens.typographyFontSizeH2,
      lineHeight: tokens.typographyLineHeightH2,
    },
    h2: {
      fontWeight: MET_Header_Font_Weight_Bold,
      fontSize: tokens.typographyFontSizeH3,
      lineHeight: tokens.typographyLineHeightH3,
    },
    h3: {
      fontWeight: MET_Header_Font_Weight_Bold,
      fontSize: tokens.typographyFontSizeH4,
      lineHeight: tokens.typographyLineHeightH4,
    },
    h4: {
      fontWeight: MET_Header_Font_Weight_Bold,
      fontSize: tokens.typographyFontSizeH5,
      lineHeight: tokens.typographyLineHeightH5,
    },
    h5: {
      fontWeight: MET_Header_Font_Weight_Bold,
      fontSize: tokens.typographyFontSizeLargeBody,
      lineHeight: tokens.typographyLineHeightLargeBody,
    },
    h6: {
      fontWeight: MET_Header_Font_Weight_Bold,
      fontSize: tokens.typographyFontSizeBody,
      lineHeight: tokens.typographyLineHeightBody,
    },
    subtitle1: {
      fontWeight: MET_Header_Font_Weight_Regular,
      fontSize: tokens.typographyFontSizeLargeBody,
      lineHeight: tokens.typographyLineHeightLargeBody,
    },
    subtitle2: {
      fontWeight: MET_Header_Font_Weight_Regular,
      fontSize: tokens.typographyFontSizeSmallBody,
      lineHeight: tokens.typographyLineHeightSmallBody,
    },
    body1: {
      fontWeight: MET_Header_Font_Weight_Regular,
      fontSize: tokens.typographyFontSizeBody,
      lineHeight: tokens.typographyLineHeightBody,
    },
    body2: {
      fontWeight: MET_Header_Font_Weight_Regular,
      fontSize: tokens.typographyFontSizeSmallBody,
      lineHeight: tokens.typographyLineHeightSmallBody,
    },
    caption: {
      fontWeight: MET_Header_Font_Weight_Regular,
      fontSize: tokens.trackTypographyFontSizeCaption,
      lineHeight: tokens.trackTypographyLineHeightCaption,
    },
    overline: {
      fontWeight: MET_Header_Font_Weight_Regular,
      fontSize: tokens.typographyFontSizeLabel,
      lineHeight: tokens.typographyLineHeightLabel,
    },
    button: {
      // Matches the medium button, which is the default size. This used to say
      // 1.125rem while the MuiButton override re-set every size, so the variant
      // only ever applied to size="small".
      fontWeight: MET_Header_Font_Weight_Bold,
      fontSize: tokens.typographyFontSizeSmallBody,
      lineHeight: tokens.typographyLineHeightSmallBody,
      textTransform: "none",
    },
  },
});
