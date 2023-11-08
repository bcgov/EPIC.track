import { Box, SxProps, Tooltip } from "@mui/material";
import { ETCaption1, ETParagraph } from "../..";
import { Palette } from "../../../../styles/theme";

interface SummaryItemProps {
  isTitleBold?: boolean;
  title: string;
  content?: string;
  maxLength?: number;
  children?: React.ReactNode;
  enableTooltip?: boolean;
  sx?: SxProps;
}

export const AccordionSummaryItem = (props: SummaryItemProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: "0.5rem",
        flexDirection: "column",
        minHeight: "48px",
        ...props.sx,
      }}
    >
      <ETCaption1
        sx={{
          textTransform: "uppercase",
          color: `${Palette.neutral.main}`,
          letterSpacing: "0.39px !important",
        }}
      >
        {props.title}
      </ETCaption1>
      {props.children && props.children}
      {props.content && (
        <Tooltip
          title={props.content}
          disableHoverListener={!props.enableTooltip}
        >
          <ETParagraph
            bold={props.isTitleBold}
            sx={{
              minHeight: "1.5rem",
              color: `${Palette.neutral.dark}`,
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            {props.content}
          </ETParagraph>
        </Tooltip>
      )}
    </Box>
  );
};
