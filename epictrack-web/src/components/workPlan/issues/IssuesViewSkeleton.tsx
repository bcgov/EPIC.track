import { Grid, Skeleton } from "@mui/material";

const IssuesViewSkeleton = () => {
  const HEIGHT = 100;
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Skeleton variant="rectangular" width="100%" height={HEIGHT} />
      </Grid>
      <Grid item xs={12}>
        <Skeleton variant="rectangular" width="100%" height={HEIGHT} />
      </Grid>
    </Grid>
  );
};

export default IssuesViewSkeleton;
