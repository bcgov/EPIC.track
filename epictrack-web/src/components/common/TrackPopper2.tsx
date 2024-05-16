import { Theme, Tooltip, TooltipProps, styled } from "@mui/material";

export const TrackPopper2 = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} componentsProps={{ tooltip: { className: className } }} />
))(`
        color: lightblue;
        background-color: green;
        font-size: 1.5em;
`);
