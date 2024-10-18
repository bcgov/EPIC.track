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
  MET_Header_Font_Family,
  MET_Header_Font_Weight_Bold,
  MET_Header_Font_Weight_Regular,
} from "../../styles/constants";
import { useAppSelector } from "../../hooks";
import { Link, LinkProps, Path } from "react-router-dom";
import { Palette } from "../../styles/theme";

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
    <Tooltip
      title={rest.tooltip as string}
      disableHoverListener={!rest.enableTooltip}
    >
      <Typography
        color={color}
        sx={{
          ...sx,
          fontWeight: bold
            ? MET_Header_Font_Weight_Bold
            : MET_Header_Font_Weight_Regular,
          fontFamily: MET_Header_Font_Family,
          ...(rest.enableEllipsis && useStyle.textEllipsis),
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

export const ETParagraph = React.forwardRef(
  (
    { bold, color, children, sx, ...rest }: HeaderProps,
    ref: React.ForwardedRef<HTMLDivElement>
  ) => {
    return (
      <div ref={ref}>
        <Tooltip
          title={rest.tooltip as string}
          disableHoverListener={!rest.enableTooltip}
        >
          <Typography
            color={color}
            sx={{
              fontWeight: bold
                ? MET_Header_Font_Weight_Bold
                : MET_Header_Font_Weight_Regular,
              fontFamily: MET_Header_Font_Family,
              ...sx,
              ...(rest.enableEllipsis && useStyle.textEllipsis),
            }}
            variant="body1"
            {...rest}
          >
            {children}
          </Typography>
        </Tooltip>
      </div>
    );
  }
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
        ...sx,
        fontWeight: bold
          ? MET_Header_Font_Weight_Bold
          : MET_Header_Font_Weight_Regular,
        fontFamily: MET_Header_Font_Family,
        letterSpacing: "0.39px",
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
      align="left"
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
  ...rest
}: LinkHeaderProps) => {
  if (disabled) {
    return <ETParagraph bold={bold}>{children}</ETParagraph>;
  }

  return (
    <ETLink onClick={rest.onClick} {...rest}>
      <Tooltip
        title={rest.tooltip as string}
        disableHoverListener={!rest.enableTooltip}
      >
        <ETParagraph
          bold={bold}
          {...rest}
          sx={{
            ...(rest.enableEllipsis && useStyle.textEllipsis),
          }}
          color={Palette.primary.accent.main}
        >
          {children}
        </ETParagraph>
      </Tooltip>
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

export const ETFormLabel = (props: FormLabelBaseProps & FormLabelOwnProps) => {
  return (
    <FormLabel
      required={props.required}
      sx={{
        fontSize: "16px",
        fontWeight: "bold",
        lineHeight: "1.5rem",
        color: Palette.neutral.dark,
        "& .MuiFormLabel-asterisk": {
          color: Palette.error.main,
        },
      }}
    >
      {props.children}
    </FormLabel>
  );
};

export const ETFormLabelWithCharacterLimit = (
  props: FormLabelWithCharacterCountProps
) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <FormLabel
        required={props.required}
        sx={{
          fontSize: "16px",
          fontWeight: "bold",
          lineHeight: "1.5rem",
          color: Palette.neutral.dark,
          "& .MuiFormLabel-asterisk": {
            color: Palette.error.main,
          },
        }}
      >
        {props.children}
      </FormLabel>
      <ETParagraph
        sx={{
          color: Palette.neutral.light,
        }}
      >
        {props.maxCharacterLength - props.characterCount}/
        {props.maxCharacterLength} character left
      </ETParagraph>
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
        ...sx,
        lineHeight: "21px",
        fontSize: "14px",
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
        padding: "16px 24px",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export const ETPreviewText = ({ bold, children, sx, ...rest }: HeaderProps) => {
  return (
    <Typography
      sx={{
        ...sx,
        fontSize: "14px",
        fontStyle: "normal",
        lineHeight: "21px",
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
    borderRadius: "4px",
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
