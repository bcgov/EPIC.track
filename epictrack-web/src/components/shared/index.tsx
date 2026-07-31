import React from "react";

import {
  Typography,
  FormLabel,
  Grid,
  SxProps,
  Tooltip,
  FormLabelOwnProps,
  FormLabelBaseProps,
  Box,
  styled,
  IconButton,
} from "@mui/material";
import {
  MET_Header_Font_Weight_Bold,
  MET_Header_Font_Weight_Regular,
} from "../../styles/constants";
import { useAppSelector } from "../../hooks";
import { Link, LinkProps, Path } from "react-router-dom";
import { Palette } from "../../styles/theme";
import * as tokens from "../../styles/designTokens";

interface HeaderProps {
  sx?: any;
  color?: string;
  bold?: boolean;
  children?: React.ReactNode | string;
  [prop: string]: unknown;
  enableTooltip?: boolean;
  enableEllipsis?: boolean;
}

interface LinkHeaderProps extends HeaderProps {
  to: string | Partial<Path>;
  onClick?: (eventArg?: any) => void;
  disabled?: boolean;
}

interface PageContainerProps {
  children?: React.ReactNode | string;
  [prop: string]: unknown;
  sx?: SxProps;
}

type FormLabelWithCharacterCountProps = {
  characterCount: number;
  maxCharacterLength: number;
} & FormLabelBaseProps &
  FormLabelOwnProps;

const useStyle = {
  textEllipsis: {
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
};

/**
 * The theme's typography variants carry the weight for each variant - headings
 * bold, body copy regular - so `bold` is only applied when a caller asks for it
 * explicitly. Returning `undefined` leaves the variant's own weight in place.
 */
const weightFor = (bold?: boolean) =>
  bold === undefined
    ? undefined
    : bold
      ? MET_Header_Font_Weight_Bold
      : MET_Header_Font_Weight_Regular;

/**
 * Shared form label styling. `ETFormLabel` and `ETFormLabelWithCharacterLimit`
 * used to restate this identically.
 */
const formLabelStyles = {
  fontSize: tokens.typographyFontSizeBody,
  fontWeight: MET_Header_Font_Weight_Bold,
  lineHeight: tokens.typographyLineHeightBody,
  color: Palette.neutral.dark,
  "& .MuiFormLabel-asterisk": {
    color: Palette.error.main,
  },
  "&.Mui-error": {
    color: tokens.typographyColorDanger,
  },
  "&.Mui-disabled": {
    color: tokens.typographyColorDisabled,
  },
};

export const ETPageContainer = (props: PageContainerProps) => {
  const state = useAppSelector((state) => state.uiState);
  return (
    <Grid
      {...props}
      sx={{
        pt: state.showEnvBanner ? "9rem" : "7rem",
        pb: "1rem",
        pl: { xs: "0.75rem", sm: "2.5rem" },
        pr: { xs: "0.75rem", sm: "2rem" },
        justifyContent: "flex-start",
        alignItems: "flex-start",
        ...props.sx,
      }}
    >
      {props.children}
    </Grid>
  );
};
export const ETReportContainer = (props: PageContainerProps) => {
  const state = useAppSelector((state) => state.uiState);
  return (
    <Grid
      {...props}
      sx={{
        padding: `${state.showEnvBanner ? "6" : "4"}rem 0rem 1rem 0rem`,
        justifyContent: "flex-start",
        alignItems: "flex-start",
        ...props.sx,
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
        fontWeight: weightFor(bold),
        ...sx,
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
        fontWeight: weightFor(bold),
        ...sx,
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
        fontWeight: weightFor(bold),
        ...sx,
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
  enableTooltip,
  enableEllipsis,
  ...rest
}: HeaderProps) => {
  return (
    <Tooltip
      title={rest.tooltip as string}
      disableHoverListener={!enableTooltip}
    >
      <Typography
        color={color}
        sx={{
          fontWeight: weightFor(bold),
          ...sx,
          ...(enableEllipsis && useStyle.textEllipsis),
        }}
        variant="h4"
        {...rest}
      >
        {children}
      </Typography>
    </Tooltip>
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
        fontWeight: weightFor(bold),
        ...sx,
      }}
      variant="subtitle1"
      {...rest}
    >
      {children}
    </Typography>
  );
};

export const ETParagraph = React.forwardRef(
  (
    {
      bold,
      color,
      children,
      sx,
      enableTooltip,
      enableEllipsis,
      ...rest
    }: HeaderProps,
    ref: React.ForwardedRef<HTMLDivElement>,
  ) => {
    return (
      <Tooltip
        title={rest.tooltip as string}
        disableHoverListener={!enableTooltip}
      >
        <Typography
          ref={ref}
          color={color}
          sx={{
            fontWeight: weightFor(bold),
            ...sx,
            ...(enableEllipsis && useStyle.textEllipsis),
          }}
          variant="body1"
          {...rest}
        >
          {children}
        </Typography>
      </Tooltip>
    );
  },
);

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
        fontWeight: weightFor(bold),
        letterSpacing: "0.39px",
        ...sx,
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
      align="left"
      sx={{
        // The design system's small-body size. Stays on the `caption` variant so
        // this keeps rendering as an inline <span>; `body2` would make it a <p>.
        fontSize: tokens.typographyFontSizeSmallBody,
        lineHeight: tokens.typographyLineHeightSmallBody,
        fontWeight: weightFor(bold),
        ...sx,
      }}
      variant="caption"
      {...rest}
    >
      {children}
    </Typography>
  );
};

export const ETGridTitle = ({
  bold = false,
  color,
  children,
  sx,
  disabled = false,
  enableTooltip,
  enableEllipsis,
  ...rest
}: LinkHeaderProps) => {
  // The disabled variant keeps its tooltip and ellipsis; it previously fell back
  // to a bare ETParagraph and lost both.
  const title = (
    <Tooltip
      title={rest.tooltip as string}
      disableHoverListener={!enableTooltip}
    >
      <ETParagraph
        bold={bold}
        {...rest}
        sx={{
          ...(enableEllipsis && useStyle.textEllipsis),
        }}
        color={
          disabled
            ? tokens.typographyColorDisabled
            : Palette.primary.accent.main
        }
      >
        {children}
      </ETParagraph>
    </Tooltip>
  );

  if (disabled) {
    return title;
  }

  return (
    <ETLink onClick={rest.onClick} {...rest}>
      {title}
    </ETLink>
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
        // The design system's label size. This was `0.75em`, which compounds
        // against the parent, so 12px was not guaranteed.
        fontSize: tokens.typographyFontSizeLabel,
        lineHeight: tokens.typographyLineHeightLabel,
        fontWeight: weightFor(bold),
        ...sx,
      }}
      variant="caption"
      {...rest}
    >
      {children}
    </Typography>
  );
};

export const ETFormLabel = ({
  children,
  sx,
  ...rest
}: FormLabelBaseProps & FormLabelOwnProps) => {
  return (
    // `rest` is forwarded so `htmlFor`, `error` and `disabled` reach the label;
    // only `required` and `children` used to get through.
    <FormLabel {...rest} sx={{ ...formLabelStyles, ...sx }}>
      {children}
    </FormLabel>
  );
};

export const ETFormLabelWithCharacterLimit = ({
  characterCount,
  maxCharacterLength,
  children,
  ...rest
}: FormLabelWithCharacterCountProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "baseline",
      }}
    >
      <ETFormLabel {...rest}>{children}</ETFormLabel>
      <ETCaption3
        sx={{
          margin: 0,
          color: Palette.neutral.light,
        }}
      >
        {maxCharacterLength - characterCount}/{maxCharacterLength} characters
        left
      </ETCaption3>
    </Box>
  );
};

export const ETLink = (props: LinkProps) => (
  <Link
    style={{
      ...props.style,
      color: Palette.primary.accent.main,
      textDecoration: "none",
    }}
    {...props}
  />
);

export const ETDescription = ({
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
        fontWeight: weightFor(bold),
        ...sx,
      }}
      variant="body2"
      {...rest}
    >
      {children}
    </Typography>
  );
};

interface GrayBoxProps {
  children?: React.ReactNode | string;
  [prop: string]: unknown;
  sx?: SxProps;
}

export const GrayBox = ({ children, sx, ...rest }: GrayBoxProps) => {
  return (
    <Box
      {...rest}
      sx={{
        backgroundColor: Palette.neutral.bg.light,
        padding: { xs: "12px", sm: "16px 24px" },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

/** Same styling as ETDescription; kept as a separate export for its callers. */
export const ETPreviewText = (props: HeaderProps) => (
  <ETDescription {...props} />
);

export const ETPreviewBox = ({ children, sx, ...rest }: HeaderProps) => {
  return (
    <Box
      {...rest}
      sx={{
        color: Palette.neutral.light,
        border: `1px dashed ${Palette.success.light}`,
        padding: "8px",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export const IButton = styled(IconButton)({
  "& .icon": {
    fill: Palette.primary.accent.main,
  },
  "&:hover": {
    backgroundColor: Palette.neutral.bg.main,
    borderRadius: tokens.layoutBorderRadiusMedium,
  },
  "&.Mui-disabled": {
    pointerEvents: "auto",
    "& .icon": {
      fill: Palette.neutral.light,
    },
  },
  "&.Mui-disabled:hover": {
    backgroundColor: "transparent",
  },
});
