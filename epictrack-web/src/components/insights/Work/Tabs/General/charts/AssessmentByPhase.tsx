import React from "react";
import { Grid } from "@mui/material";
import { ETCaption1, ETCaption3, GrayBox } from "components/shared";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { getChartColor } from "components/insights/utils";
import { AssessmentByPhase } from "models/insights";
import { useGetAssessmentsByPhaseQuery } from "services/rtkQuery/workInsights";
import { showNotification } from "components/shared/notificationProvider";
import PieChartSkeleton from "components/insights/PieChartSkeleton";
import { useWorkInsightsContext } from "components/insights/Work/WorkInsightsContext";
import { useInsightsContext } from "components/insights/InsightsContext";

const AssessmentByPhaseChart = () => {
  const { columnFilters } = useWorkInsightsContext();
  const { isUserInsights, staffId } = useInsightsContext();
  const {
    data,
    error,
    isLoading: isChartLoading,
  } = useGetAssessmentsByPhaseQuery({
    columnFilters,
    staffId: isUserInsights ? staffId : undefined,
  });

  const formatData = (data?: AssessmentByPhase[]) => {
    if (!data) return [];
    return data.map((item) => {
      return {
        name: item.phase,
        value: item.count,
        id: item.phase_id,
      };
    });
  };

  if (error) {
    showNotification("Could not load Assessments by Phase data", {
      duration: 3000,
      type: "error",
    });
  }

  if (isChartLoading || error) {
    return <PieChartSkeleton loading={isChartLoading} />;
  }

  const chartData = formatData(data);

  return (
    <GrayBox sx={{ height: "100%" }}>
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
                fontSize: "16px",
                maxWidth: "300px",
                overflow: "hidden",
                maxHeight: "350px",
                overflowY: "auto",
              }}
            />
            <Tooltip />
          </PieChart>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default AssessmentByPhaseChart;
