import React from "react";
import { Skeleton, Grid } from "@mui/material";
import { GrayBox } from "components/shared";

const PieChartSkeleton = () => {
  return (
    <GrayBox sx={{ height: "100%" }}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Skeleton variant="text" width="100%" height={24} />
        </Grid>
        <Grid item xs={12}>
          <Skeleton variant="text" width="100%" height={24} />
        </Grid>
        <Grid
          item
          xs={12}
          container
          justifyContent={"center"}
          sx={{ marginTop: "2em" }}
        >
          <Grid container justifyContent="center">
            <Grid item>
              <Skeleton variant="circular" width={200} height={200} />
            </Grid>
            <Grid item style={{ marginLeft: 16 }}>
              <Skeleton variant="rectangular" width={200} height={20} />
              <Skeleton
                variant="rectangular"
                width={200}
                height={20}
                style={{ marginTop: 8 }}
              />
              <Skeleton
                variant="rectangular"
                width={200}
                height={20}
                style={{ marginTop: 8 }}
              />
              <Skeleton
                variant="rectangular"
                width={200}
                height={20}
                style={{ marginTop: 8 }}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default PieChartSkeleton;
