import { useContext } from "react";
import { Button, Grid } from "@mui/material";
import { ETHeading3 } from "../../shared";
import { titleStyle } from "../common/styles";
import { Palette } from "../../../styles/theme";
import AboutDetails from "./aboutDetails";
import WorkResources from "./workResources";
import { IconProps } from "components/icons/type";
import Icons from "components/icons";
import { AboutContext } from "./AboutContext";

const AddIcon: React.FC<IconProps> = Icons["AddIcon"];

const AboutContainer = () => {
  const { setShowCreateDialog } = useContext(AboutContext);

  return (
    <Grid container columnSpacing={1.5}>
      <Grid item xs={8}>
        <ETHeading3
          sx={{
            ...titleStyle,
            paddingBottom: 1.5,
          }}
          color={Palette.primary.main}
        >
          Details
        </ETHeading3>
      </Grid>
      <Grid item xs={4}>
        <ETHeading3
          sx={{
            ...titleStyle,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
          color={Palette.primary.main}
        >
          <span>Resources</span>
          <Button
            onClick={() => setShowCreateDialog(true)}
            variant="contained"
            color="primary"
            sx={{
              maxHeight: "20px",
            }}
            startIcon={<AddIcon sx={{ width: "12px", height: "12px" }} />}
          >
            Add Resource
          </Button>
        </ETHeading3>
      </Grid>
      <Grid
        item
        xs={8}
        sx={{
          pt: "2rem",
        }}
      >
        <AboutDetails />
      </Grid>
      <Grid
        item
        xs={4}
        sx={{
          pt: "2rem",
        }}
      >
        <WorkResources />
      </Grid>
    </Grid>
  );
};

export default AboutContainer;
