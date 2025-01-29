import { Grid, Skeleton } from "@mui/material";
import { ETPageContainer } from "../shared";

export const WorkPlanSkeleton = () => {
  return (
    <ETPageContainer>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Skeleton variant="rectangular" height={30} />
        </Grid>
        <Grid item xs={12}>
          <Skeleton variant="rectangular" height={30} />
        </Grid>
        <Grid item xs={12}>
          <Skeleton variant="rectangular" height={100} />
        </Grid>
        <Grid item xs={12}>
          <Skeleton variant="rectangular" height={100} />
        </Grid>
      </Grid>
    </ETPageContainer>
  );
};
