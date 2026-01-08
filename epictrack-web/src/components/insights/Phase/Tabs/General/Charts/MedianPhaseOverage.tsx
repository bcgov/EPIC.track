import { Grid, Box, Tooltip as MuiTooltip } from "@mui/material";
import BarChartSkeleton from "components/insights/BarChartSkeleton";
import { useInsightsContext } from "components/insights/InsightsContext";
import { usePhaseInsightsContext } from "components/insights/Phase/PhaseInsightsContext";
import { useTableFilterContext } from "components/insights/TableFilterContext";
import { BAR_COLOR } from "components/insights/utils";
import { GrayBox, ETCaption1, ETCaption2 } from "components/shared";
import { showNotification } from "components/shared/notificationProvider";
import { TooltipProps } from "recharts";
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  ResponsiveContainer,
  ErrorBar,
} from "recharts";
import { useGetPhasesByMedianOverageQuery } from "services/rtkQuery/phaseInsights";

const MedianPhaseOverageChart = () => {
  const { viewUnderage: isUnderageToggled } = usePhaseInsightsContext();
  const { columnFilters } = useTableFilterContext();
  const { loadingWorkPhases } = usePhaseInsightsContext();
  const { isUserInsights, staffId } = useInsightsContext();

  const {
    data: chartData,
    error,
    isLoading: isChartLoading,
  } = useGetPhasesByMedianOverageQuery(
    {
      columnFilters,
      staffId: isUserInsights ? staffId : undefined,
      isUnderageToggled,
    },
    { skip: columnFilters.length === 0 },
  );

  if (error) {
    showNotification("Could not load WorkPhases by Median Phase Overage data", {
      duration: 3000,
      type: "error",
    });
  }

  if (isChartLoading || loadingWorkPhases || !chartData) {
    return <BarChartSkeleton loading={isChartLoading} />;
  }

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length && payload[0].payload) {
      const { median_overage, iqr_low, iqr_high } = payload[0].payload;
      return (
        <div
          style={{ background: "#fff", border: "1px solid #ccc", padding: 8 }}
        >
          <div>{label}</div>
          <div>
            Median {isUnderageToggled ? "Underage" : "Overage"}:{" "}
            {median_overage}
            <br />
            IQR Low: {iqr_low}
            <br />
            IQR High: {iqr_high}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 2,
        pl: 2,
        pt: 3,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <svg width="24" height="8" style={{ marginRight: 8 }}>
          <rect width="24" height="8" fill={BAR_COLOR} />
        </svg>
        <ETCaption2>Median</ETCaption2>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <svg width="26" height="8" style={{ marginRight: 4 }}>
          <rect x="10" y="3" width="8" height="2" fill="black" />
          <rect x="9" y="1" width="2" height="6" fill="black" />
          <rect x="17" y="1" width="2" height="6" fill="black" />
        </svg>
        <ETCaption2>IQ Range</ETCaption2>
      </Box>
    </Box>
  );

  return (
    <GrayBox sx={{ height: "100%" }}>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <MuiTooltip title="Includes Legislated Phases plus Amendment Phases">
            <span>
              <ETCaption1 bold>
                MEDIAN PHASE {isUnderageToggled ? "UNDERAGE" : "OVERAGE"}
              </ETCaption1>
            </span>
          </MuiTooltip>
        </Grid>
        <Grid
          item
          xs={10}
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
              <>
                <ResponsiveContainer
                  height={Math.max(chartData.length * 50 + 100, 350)}
                  width={"100%"}
                >
                  <BarChart
                    layout="vertical"
                    data={chartData}
                    margin={{ left: 80, bottom: 40, top: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      label={{
                        value: `Median ${isUnderageToggled ? "Underage" : "Overage"} (days)`,
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
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="median_overage"
                      fill={BAR_COLOR}
                      barSize={20}
                      name={`Median ${isUnderageToggled ? "Underage" : "Overage"}`}
                    >
                      <ErrorBar
                        dataKey={(e) => [
                          e.median_overage - e.iqr_low,
                          e.iqr_high - e.median_overage,
                        ]}
                        width={4}
                        strokeWidth={2}
                        stroke="black"
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </Box>
        </Grid>
        <Grid item xs={2}>
          <CustomLegend />
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default MedianPhaseOverageChart;
