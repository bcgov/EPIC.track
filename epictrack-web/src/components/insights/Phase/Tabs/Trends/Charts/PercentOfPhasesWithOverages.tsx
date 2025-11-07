import { Grid, Box, Tooltip as MuiTooltip } from "@mui/material";
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  ResponsiveContainer,
} from "recharts";
import BarChartSkeleton from "components/insights/BarChartSkeleton";
import { useInsightsContext } from "components/insights/InsightsContext";
import { usePhaseInsightsContext } from "components/insights/Phase/PhaseInsightsContext";
import { useTableFilterContext } from "components/insights/TableFilterContext";
import { BAR_COLOR } from "components/insights/utils";
import { GrayBox, ETCaption1 } from "components/shared";
import { showNotification } from "components/shared/notificationProvider";
import { useGetPercentOfPhasesWithOveragesQuery } from "services/rtkQuery/phaseInsights";

const PercentOfPhasesWithOveragesChart = () => {
  const { columnFilters } = useTableFilterContext();
  const { loadingWorkPhases } = usePhaseInsightsContext();
  const { isUserInsights, staffId } = useInsightsContext();

  const {
    data: chartData,
    error,
    isLoading: isChartLoading,
  } = useGetPercentOfPhasesWithOveragesQuery(
    {
      columnFilters,
      selectedWorkType: "all",
      staffId: isUserInsights ? staffId : undefined,
    },
    { skip: columnFilters.length === 0 },
  );

  if (error) {
    showNotification(
      "Could not load Works by Percent Of Phases With Overages data",
      {
        duration: 3000,
        type: "error",
      },
    );
  }

  if (isChartLoading || loadingWorkPhases || !chartData) {
    return <BarChartSkeleton loading={isChartLoading} />;
  }

  return (
    <GrayBox sx={{ height: "100%" }}>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <MuiTooltip title="Includes Legislated Phases plus Amendment Phases">
            <span>
              <ETCaption1 bold>% OF PHASES WITH OVERAGES</ETCaption1>
            </span>
          </MuiTooltip>
        </Grid>
        <Grid
          item
          xs={12}
          container
          justifyContent={"center"}
          sx={{ flex: 1, minHeight: 350 }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              minHeight: 350,
              overflowY: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pb: 4,
            }}
          >
            {chartData.length > 0 && (
              <ResponsiveContainer
                height={Math.max(chartData.length * 50 + 100, 350)}
                width={"100%"}
              >
                <BarChart
                  layout="vertical"
                  data={chartData}
                  margin={{ left: 80, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    label={{
                      value: "% of Phases with Overage",
                      position: "insideBottom",
                      offset: -5,
                      dy: 20,
                      style: { fontSize: 16 },
                    }}
                  />
                  <YAxis
                    dataKey="phase"
                    type="category"
                    width={40}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value}%`,
                      name,
                    ]}
                  />
                  <Bar
                    dataKey="percent_overage"
                    fill={BAR_COLOR}
                    barSize={20}
                    name="Average Overage"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Box>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default PercentOfPhasesWithOveragesChart;
