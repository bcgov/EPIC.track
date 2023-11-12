import React from "react";
import { Grid, Skeleton } from "@mui/material";

export const PreviewSkeleton = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Skeleton variant="rectangular" height={50} width="100%" />
      </Grid>
      <Grid item xs={6}>
        <Skeleton variant="rectangular" height={50} width="100%" />
      </Grid>
      <Grid item xs={12}>
        <Skeleton variant="rectangular" height={200} width="100%" />
      </Grid>
    </Grid>
  );
};
