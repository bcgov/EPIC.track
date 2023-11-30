import { Grid } from "@mui/material";
import { Palette } from "../../../styles/theme";

const CardBody = () => {
  return (
    <Grid
      container
      sx={{
        width: "516",
        backgroundColor: Palette.white,
        borderTop: `1px solid var(--neutral-background-dark, #DBDCDC)`,
        padding: "16px 24px",
        alignItems: "center",
      }}
      justifyContent="space-between"
    ></Grid>
  );
};

export default CardBody;
