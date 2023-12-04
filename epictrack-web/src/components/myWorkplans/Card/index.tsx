import { Box } from "@mui/material";
import CardBody from "./CardBody";
import CardFooter from "./CardFooter";
import CardHeader from "./CardHeader";
import { Palette } from "../../../styles/theme";

const Card = () => {
  return (
    <Box
      sx={{
        width: "516px",
        border: `1px solid var(--neutral-background-dark, ${Palette.neutral.bg.dark})`,
        borderRadius: "4px 4px 4px 4px",
      }}
    >
      <CardHeader />
      <CardBody />
      <CardFooter />
    </Box>
  );
};

export default Card;
