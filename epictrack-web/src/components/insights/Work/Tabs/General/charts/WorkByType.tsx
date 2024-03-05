import React, { useState } from "react";
import { Grid } from "@mui/material";
import { ETCaption1, ETCaption3, GrayBox } from "components/shared";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { getChartColor } from "components/insights/utils";
import PieChartSkeleton from "./PieChartSkeleton";
import { useGetWorksByTypeQuery } from "services/rtkQuery/insights";
import { WorkByType } from "models/insights";
import { showNotification } from "components/shared/notificationProvider";
import { COMMON_ERROR_MESSAGE } from "constants/application-constant";

const WorkByTypeChart = () => {
  const {
    data: chartData,
    error,
    isLoading: isChartLoading,
  } = useGetWorksByTypeQuery();

  if (isChartLoading || !chartData) {
    return <PieChartSkeleton />;
  }

  // TODO: handle error
  if (error) {
    showNotification(COMMON_ERROR_MESSAGE, { type: "error" });
    return <div>Error</div>;
  }

  const formatData = (data: WorkByType[]) => {
    if (!data) return [];
    return data.map((item) => {
      return {
        name: item.work_type,
        value: item.count,
        id: item.work_type_id,
      };
    });
  };

  return (
    <GrayBox>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <ETCaption1 bold>WORK BY TYPE</ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption3>
            The proportion of active Works categorized by their type
          </ETCaption3>
        </Grid>
        <Grid item xs={12} container justifyContent={"center"}>
          <PieChart width={600} height={300}>
            <Pie
              data={formatData(chartData)}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label
              isAnimationActive={false}
            >
              {formatData(chartData).map((entry, index) => (
                <Cell key={`cell-${entry.id}`} fill={getChartColor(index)} />
              ))}
            </Pie>
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              iconSize={16}
              wrapperStyle={{
                fontSize: "16px",
              }}
            />
            <Tooltip />
          </PieChart>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default WorkByTypeChart;
