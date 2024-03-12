import React from "react";
import { Grid } from "@mui/material";
import { ETCaption1, GrayBox } from "components/shared";
import { useGetWorksByStaffQuery } from "services/rtkQuery/insights";
import { showNotification } from "components/shared/notificationProvider";
import { COMMON_ERROR_MESSAGE } from "constants/application-constant";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WorkByStaff } from "models/insights";
import BarChartSkeleton from "components/insights/BarChartSkeleton";

const WorkByStaffChart = () => {
  const {
    data: chartData,
    error,
    isLoading: isChartLoading,
  } = useGetWorksByStaffQuery();

  if (isChartLoading || !chartData) {
    return <BarChartSkeleton />;
  }

  // TODO: handle error
  if (error) {
    showNotification(COMMON_ERROR_MESSAGE, { type: "error" });
    return <div>Error</div>;
  }

  const formatData = (data: WorkByStaff[]) => {
    if (!data) return [];
    return data.map((item) => {
      return {
        name: item.staff,
        value: item.count,
        id: item.staff_id,
      };
    });
  };

  return (
    <GrayBox>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <ETCaption1 bold>WORK BY STAFF</ETCaption1>
        </Grid>
        <Grid item xs={12} container justifyContent={"center"}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              layout="vertical"
              data={formatData(chartData)}
              margin={{
                left: 30, // Increase left margin if names are getting cut off
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                width={40} // Adjust the width to give more space for text
                tick={{ fontSize: 12 }} // Make sure to pass the width
              />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" barSize={20}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={"#4bacc6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default WorkByStaffChart;
