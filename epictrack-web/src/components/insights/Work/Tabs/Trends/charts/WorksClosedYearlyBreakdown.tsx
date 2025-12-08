import { Grid } from "@mui/material";
import { useInsightsContext } from "components/insights/InsightsContext";
import PieChartSkeleton from "components/insights/PieChartSkeleton";
import { useTableFilterContext } from "components/insights/TableFilterContext";
import { getChartColor } from "components/insights/utils";
import { ETCaption1, ETCaption3, GrayBox } from "components/shared";
import { showNotification } from "components/shared/notificationProvider";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useGetWorkClosureBreakdownQuery } from "services/rtkQuery/workInsights";

const WorksClosedYearlyBreakdown = () => {
  const { isUserInsights, staffId } = useInsightsContext();
  const { columnFilters } = useTableFilterContext();

  const {
    data: chartData,
    error,
    isLoading: isChartLoading,
  } = useGetWorkClosureBreakdownQuery(
    {
      columnFilters,
      staffId: isUserInsights ? staffId : undefined,
    },
    { skip: columnFilters.length === 0 },
  );

  if (error) {
    showNotification("Could not load yearly closed Works data", {
      duration: 3000,
      type: "error",
    });
  }

  if (isChartLoading || !chartData) {
    return <PieChartSkeleton loading={isChartLoading} />;
  }

  return (
    <GrayBox sx={{ height: "100%" }}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <ETCaption1 bold>YEARLY WORK STATE CLOSURE BREAKDOWN</ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption3>
            The proportion of Work closures categorized by their work state
          </ETCaption3>
        </Grid>
        <Grid item xs={12} container justifyContent={"center"}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="work_state"
                isAnimationActive={false}
                label
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
                  maxWidth: "190px",
                  overflow: "scroll",
                }}
                formatter={(_, entry) => {
                  const payload = entry.payload as any;
                  return `${payload.year} - ${payload.work_state}`;
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

export default WorksClosedYearlyBreakdown;
