import React, { useEffect, useState } from "react";
import { Grid, Skeleton } from "@mui/material";
import { ETCaption1, ETCaption3, GrayBox } from "components/shared";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { getChartColor } from "components/insights/utils";
import { getWorkByType } from "services/insightService";
import { PieChartData } from "models/insights";
import PieChartSkeleton from "./PieChartSkeleton";
import { showNotification } from "components/shared/notificationProvider";
import { COMMON_ERROR_MESSAGE } from "constants/application-constant";

const WorkByType = () => {
  const [chartData, setChartData] = useState<PieChartData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await getWorkByType();
      if (response) {
        const data = response.data.map((item) => {
          return {
            name: item.work_type,
            value: item.count,
          };
        });
        setChartData(data);
        setLoading(false);
      }
    } catch (error) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <PieChartSkeleton />;
  }

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
          <PieChart width={500} height={300}>
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
                <Cell key={`cell-${index}`} fill={getChartColor(index)} />
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

export default WorkByType;
