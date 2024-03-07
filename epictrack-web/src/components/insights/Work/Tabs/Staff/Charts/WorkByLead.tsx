import React from "react";
import { Grid } from "@mui/material";
import { ETCaption1, GrayBox } from "components/shared";
import { useGetWorksByLeadQuery } from "services/rtkQuery/insights";
import { showNotification } from "components/shared/notificationProvider";
import { COMMON_ERROR_MESSAGE } from "constants/application-constant";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WorkByLead } from "models/insights";
import CustomAxisTick from "./CustomAxisTick";
import BarChartSkeleton from "components/insights/BarChartSkeleton";

const WorkByLeadChart = () => {
  const {
    data: chartData,
    error,
    isLoading: isChartLoading,
  } = useGetWorksByLeadQuery();

  if (isChartLoading || !chartData) {
    return <BarChartSkeleton />;
  }

  // TODO: handle error
  if (error) {
    showNotification(COMMON_ERROR_MESSAGE, { type: "error" });
    return <div>Error</div>;
  }

  const formatData = (data: WorkByLead[]) => {
    if (!data) return [];
    return data.map((item) => {
      return {
        name: item.work_lead,
        value: item.count,
        id: item.work_lead_id,
      };
    });
  };

  return (
    <GrayBox>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <ETCaption1 bold>WORK BY LEAD</ETCaption1>
        </Grid>
        <Grid item xs={12} container justifyContent={"center"}>
          <BarChart
            layout="vertical"
            data={formatData(chartData)}
            width={600}
            height={300}
            margin={{
              top: 20,
              right: 30,
              left: 50, // Increase left margin if names are getting cut off
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis
              dataKey="name"
              type="category"
              width={80} // Adjust the width to give more space for text
              tick={<CustomAxisTick width={80} />} // Make sure to pass the width
            />
            <Tooltip />
            <Bar dataKey="value" fill="#82ca9d" barSize={20}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={"#4bacc6"} />
              ))}
            </Bar>
          </BarChart>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default WorkByLeadChart;
