import { Grid } from "@mui/material";
import { useAppSelector } from "../../hooks";
import { Palette } from "../../styles/theme";

const TopFilters = () => {
  const state = useAppSelector((state) => state.uiState);
  return (
    <Grid
      sx={{
        backgroundColor: Palette.neutral.bg.light,
        height: "128px",
        marginTop: `${state.showEnvBanner ? "7" : "4.5"}rem`,
        padding: "24px 40px 16px 40px",
      }}
    ></Grid>
  );
};

export default TopFilters;
