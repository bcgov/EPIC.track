import React from "react";
import { Grid } from "@mui/material";
import { ETCaption1, ETCaption3, GrayBox } from "components/shared";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BAR_COLOR } from "components/insights/utils";
import PieChartSkeleton from "components/insights/PieChartSkeleton";
import { WorkByNation } from "models/insights";
import { useGetWorksByNationQuery } from "services/rtkQuery/workInsights";
import { showNotification } from "components/shared/notificationProvider";
import { COMMON_ERROR_MESSAGE } from "constants/application-constant";
import BarChartSkeleton from "components/insights/BarChartSkeleton";

const WorkByNationChart = () => {
  const { data, error, isLoading: isChartLoading } = useGetWorksByNationQuery();

  const formatData = (data?: WorkByNation[]) => {
    if (!data) return [];
    return data.map((item) => {
      return {
        nation: item.first_nation,
        count: item.count,
      };
    });
  };

  if (isChartLoading) {
    return <BarChartSkeleton />;
  }

  if (error) {
    showNotification(COMMON_ERROR_MESSAGE, { type: "error" });
    return <div>Error</div>;
  }

  const chartData = formatData(data);

  return (
    <GrayBox sx={{ height: "100%" }}>
      <Grid container spacing={1} sx={{ height: "100%" }}>
        <Grid item xs={12}>
          <ETCaption1 bold>WORK BY NATION</ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption3>
            The number of active Works a Nation is associated with
          </ETCaption3>
        </Grid>
        <Grid item xs={12} container justifyContent={"center"}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart layout="vertical" data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="nation" type="category" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill={BAR_COLOR} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default WorkByNationChart;
