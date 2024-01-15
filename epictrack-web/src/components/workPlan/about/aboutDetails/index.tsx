import { Grid } from "@mui/material";
import ProjectDetails from "./ProjectDetails";
import WorkDetails from "./WorkDetails";

const AboutDetials = () => {
  return (
    <Grid container direction={"row"} spacing={4}>
      <Grid item xs={6}>
        <ProjectDetails />
      </Grid>
      <Grid item xs={6}>
        <WorkDetails />
      </Grid>
    </Grid>
  );
};

export default AboutDetials;
