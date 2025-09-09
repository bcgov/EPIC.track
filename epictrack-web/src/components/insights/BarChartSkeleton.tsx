import { FC } from "react";
import { Skeleton, Grid } from "@mui/material";
import { GrayBox } from "components/shared";

interface BarChartSkeletonProps {
  loading?: boolean;
}

const BarChartSkeleton: FC<BarChartSkeletonProps> = ({ loading = true }) => {
  return (
    <GrayBox sx={{ height: "100%" }}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Skeleton
            animation={loading ? "pulse" : false}
            variant="text"
            width="100%"
            height={24}
          />
        </Grid>
        <Grid item xs={12}>
          <Skeleton
            animation={loading ? "pulse" : false}
            variant="text"
            width="100%"
            height={24}
          />
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
              <Skeleton
                animation={loading ? "pulse" : false}
                variant="rectangular"
                width={400}
                height={300}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default BarChartSkeleton;
