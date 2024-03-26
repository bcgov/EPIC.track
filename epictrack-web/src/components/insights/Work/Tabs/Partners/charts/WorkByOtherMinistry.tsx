import React from "react";
import { Grid } from "@mui/material";
import { ETCaption1, ETCaption3, GrayBox } from "components/shared";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getChartColor } from "components/insights/utils";
import { WorkByMinistry } from "models/insights";
import { useGetWorkByMinistryQuery } from "services/rtkQuery/workInsights";
import { showNotification } from "components/shared/notificationProvider";
import { COMMON_ERROR_MESSAGE } from "constants/application-constant";
import PieChartSkeleton from "components/insights/PieChartSkeleton";

const WorkByOtherMinistryChart = () => {
  const {
    data,
    error,
    isLoading: isChartLoading,
  } = useGetWorkByMinistryQuery();

  const formatData = (data?: WorkByMinistry[]) => {
    if (!data) return [];
    return data.map((item) => {
      return {
        name: item.ministry,
        value: item.count,
        id: item.ministry_id,
      };
    });
  };

  if (isChartLoading) {
    return <PieChartSkeleton />;
  }

  if (error) {
    showNotification(COMMON_ERROR_MESSAGE, { type: "error" });
    return <div>Error</div>;
  }

  const chartData = formatData(data);

  return (
    <GrayBox sx={{ height: "100%" }}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <ETCaption1 bold>WORK BY OTHER MINISTRY</ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption3>
            The proportion of active Works categorized by the involvement of
            other ministries
          </ETCaption3>
        </Grid>
        <Grid item xs={12} container justifyContent={"center"}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart width={600} height={300}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label
                isAnimationActive={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${entry.id}`} fill={getChartColor(index)} />
                ))}
              </Pie>
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                iconSize={16}
                wrapperStyle={{
                  fontSize: "12px",
                  maxWidth: "200px", // Add this line to limit the width of the legend
                  overflow: "hidden",
                }}
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default WorkByOtherMinistryChart;
