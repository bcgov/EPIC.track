import React, { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import { ETCaption1, ETCaption3, GrayBox } from "components/shared";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { getChartColor } from "components/insights/utils";
import { PieChartData } from "models/insights";
import { showNotification } from "components/shared/notificationProvider";
import { COMMON_ERROR_MESSAGE } from "constants/application-constant";
import { getAssessmentByPhase } from "services/insightService";
import PieChartSkeleton from "./PieChartSkeleton";

const AssessmentByPhase = () => {
  const [chartData, setChartData] = useState<PieChartData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await getAssessmentByPhase();
      if (response) {
        console.log(response.data);
        const data = response.data.map((item) => {
          return {
            name: item.phase,
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
          <ETCaption1 bold>ASSESSMENT BY PHASE</ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption3>
            The proportion of active Assessments categorized by which Phase they
            are in
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

export default AssessmentByPhase;
