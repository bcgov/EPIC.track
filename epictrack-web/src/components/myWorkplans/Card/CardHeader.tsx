import { Grid } from "@mui/material";
import { Palette } from "../../../styles/theme";
import { ETCaption1 } from "../../shared";
import { CardProps } from "./type";

const CardHeader = ({ workplan }: CardProps) => {
  return (
    <Grid
      container
      sx={{
        backgroundColor: Palette.neutral.bg.light,
        borderBottom: `1px solid var(--neutral-background-dark, #DBDCDC)`,
        padding: "12px 24px",
        alignItems: "center",
      }}
      justifyContent="space-between"
    >
      <Grid item>
        <ETCaption1 bold color={Palette.primary.main}>
          {workplan.title}
        </ETCaption1>
      </Grid>
      <Grid item>
        <ETCaption1
          bold
          sx={{
            color: Palette.success.dark,
            backgroundColor: Palette.success.bg.light,
            padding: "4px 8px",
            borderRadius: "4px",
          }}
        >
          {workplan.is_active ? "Active" : "Inactive"}
        </ETCaption1>
      </Grid>
    </Grid>
  );
};

export default CardHeader;
