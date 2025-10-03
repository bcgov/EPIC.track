import { Grid } from "@mui/material";
import { ETCaption1, ETCaption3, GrayBox } from "components/shared";
import { useGetWorksByTeamQuery } from "services/rtkQuery/workInsights";
import { showNotification } from "components/shared/notificationProvider";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { getChartColor } from "components/insights/utils";
import PieChartSkeleton from "components/insights/PieChartSkeleton";
import type { WorkByTeam } from "models/insights";
import { useInsightsContext } from "components/insights/InsightsContext";
import { useTableFilterContext } from "components/insights/TableFilterContext";

const WorkByTeamChart = () => {
  const { isUserInsights, staffId } = useInsightsContext();

  const { columnFilters } = useTableFilterContext();
  const {
    data: chartData,
    error,
    isLoading: isChartLoading,
  } = useGetWorksByTeamQuery({
    columnFilters,
    staffId: isUserInsights ? staffId : undefined,
  });

  if (error) {
    showNotification("Could not load Works by Team data", {
      duration: 3000,
      type: "error",
    });
  }

  if (isChartLoading || !chartData) {
    return <PieChartSkeleton loading={isChartLoading} />;
  }

  const formatData = (data: WorkByTeam[]) => {
    if (!data) return [];
    return data.map((item) => {
      return {
        name: item.eao_team,
        value: item.count,
        id: item.eao_team_id,
      };
    });
  };

  return (
    <GrayBox sx={{ height: "100%" }}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <ETCaption1 bold>WORK BY TEAM</ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption3>The proportion of active Works by each team</ETCaption3>
        </Grid>
        <Grid item xs={12} container justifyContent={"center"}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
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
          </ResponsiveContainer>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default WorkByTeamChart;
