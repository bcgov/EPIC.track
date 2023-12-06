import { Box, Grid } from "@mui/material";
import CardBody from "./CardBody";
import CardFooter from "./CardFooter";
import CardHeader from "./CardHeader";
import { Palette } from "../../../styles/theme";
import { CardProps } from "./type";

const Card = ({ workplan }: CardProps) => {
  return (
    <Box
      sx={{
        maxWidth: "516px",
        border: `1px solid var(--neutral-background-dark, ${Palette.neutral.bg.dark})`,
        borderRadius: "4px 4px 4px 4px",
      }}
    >
      <CardHeader workplan={workplan} />
      <CardBody workplan={workplan} />
      <CardFooter workplan={workplan} />
    </Box>
  );
};

export default Card;
