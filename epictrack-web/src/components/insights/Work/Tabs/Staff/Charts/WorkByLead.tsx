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
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WorkByLead } from "models/insights";
import BarChartSkeleton from "components/insights/BarChartSkeleton";
import { BAR_COLOR } from "components/insights/utils";

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
    <GrayBox sx={{ height: "100%" }}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <ETCaption1 bold>WORK BY LEAD</ETCaption1>
        </Grid>
        <Grid item xs={12} container justifyContent={"center"}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              layout="vertical"
              data={formatData(chartData)}
              margin={{
                left: 40, // Increase left margin if names are getting cut off
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
              <Bar dataKey="value" fill={BAR_COLOR} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default WorkByLeadChart;
