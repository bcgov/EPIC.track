import { Tooltip, TooltipProps, styled } from "@mui/material";
import { Palette } from "styles/theme";

const TrackTooltipMinWidth = 316;
type TrackPopperProps = {
  body: React.ReactNode;
  children: React.ReactElement;
} & Partial<TooltipProps>;
export const TrackTooltip = styled(
  ({ className, body, ...props }: TrackPopperProps) => (
    <Tooltip
      componentsProps={{ tooltip: { className: className } }}
      title={body}
      {...props}
    />
  )
)(
  ({ theme }) => `
        background-color: ${theme.palette.background.paper};
        color: ${Palette.neutral.accent.dark};
        margin: 0;
        padding: 0;
        box-shadow: ${theme.shadows[2]};        
        min-width: ${TrackTooltipMinWidth}px;
        z-index: ${theme.zIndex.tooltip};
`
);
