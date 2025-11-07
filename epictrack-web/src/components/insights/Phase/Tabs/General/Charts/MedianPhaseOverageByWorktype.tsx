import { useRef, useLayoutEffect, useState } from "react";
import { Grid, Box, Tooltip as MuiTooltip } from "@mui/material";
import BarChartSkeleton from "components/insights/BarChartSkeleton";
import { useInsightsContext } from "components/insights/InsightsContext";
import { usePhaseInsightsContext } from "components/insights/Phase/PhaseInsightsContext";
import { useTableFilterContext } from "components/insights/TableFilterContext";
import { COLORS } from "components/insights/utils";
import { GrayBox, ETCaption1 } from "components/shared";
import { showNotification } from "components/shared/notificationProvider";
import { MedianOverageByWorktype } from "models/insights";
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  ResponsiveContainer,
} from "recharts";
import { useGetMedianPhaseOverageByWorktypeQuery } from "services/rtkQuery/phaseInsights";

const formatData = (data: MedianOverageByWorktype[]) => {
  const phaseOrder: { [phase: string]: number } = {};
  const grouped: { [work_type: string]: any } = {};

  (data ?? []).forEach(
    ({ work_type, phase, median_overage, phase_sort_order = 0 }) => {
      if (!grouped[work_type]) grouped[work_type] = { work_type };
      grouped[work_type][phase] = median_overage;
      if (!(phase in phaseOrder) || phaseOrder[phase] > phase_sort_order) {
        phaseOrder[phase] = phase_sort_order;
      }
    },
  );

  const sortedPhases = Object.keys(phaseOrder).sort(
    (a, b) => phaseOrder[a] - phaseOrder[b],
  );

  return {
    data: Object.values(grouped),
    sortedPhases,
  };
};

const MedianPhaseOverageByWorktypeChart = () => {
  const { columnFilters } = useTableFilterContext();
  const { loadingWorkPhases } = usePhaseInsightsContext();
  const { isUserInsights, staffId } = useInsightsContext();

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartHeight, setChartHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    if (chartContainerRef.current) {
      setChartHeight(chartContainerRef.current.offsetHeight);
    }
  }, []);

  const {
    data: chartData,
    error,
    isLoading: isChartLoading,
  } = useGetMedianPhaseOverageByWorktypeQuery(
    {
      columnFilters,
      staffId: isUserInsights ? staffId : undefined,
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
    return (
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <BarChartSkeleton loading={isChartLoading} />
        </Grid>
        <Grid item xs={4}>
          <BarChartSkeleton loading={isChartLoading} />
        </Grid>
      </Grid>
    );
  }

  const { data, sortedPhases } = formatData(chartData);

  return (
    <Grid container spacing={2}>
      <Grid
        item
        xs={8}
        ref={chartContainerRef}
        sx={{ flex: 2, minWidth: 0, display: "flex", flexDirection: "column" }}
      >
        <GrayBox
          sx={{
            flex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <MuiTooltip title="Includes Legislated Phases plus Amendment Phases">
                <span>
                  <ETCaption1 bold>MEDIAN PHASE OVERAGE BY WORKTYPE</ETCaption1>
                </span>
              </MuiTooltip>
            </Grid>
          </Grid>
          <Box
            sx={{
              flex: 1,
              minHeight: 350,
              mt: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pb: 4,
            }}
          >
            {chartData.length > 0 && (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={data}
                  layout="vertical"
                  margin={{ left: 80, bottom: 40 }}
                  barCategoryGap="35%"
                  barGap={2}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <XAxis
                    type="number"
                    label={{
                      value: "Median Overage (days)",
                      position: "insideBottom",
                      offset: -5,
                      dy: 10,
                      style: { fontSize: 16 },
                    }}
                  />
                  <YAxis
                    dataKey="work_type"
                    type="category"
                    width={40}
                    tick={{ fontSize: 16 }}
                  />
                  <Tooltip />
                  {sortedPhases.map((phase, idx) => (
                    <Bar
                      key={phase}
                      dataKey={phase}
                      stackId="a"
                      fill={COLORS[idx % COLORS.length]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </Box>
        </GrayBox>
      </Grid>
      <Grid
        item
        xs={4}
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          height: chartHeight ? `${chartHeight}px` : "auto",
        }}
      >
        <GrayBox
          sx={{
            flex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <ETCaption1 bold>PHASES</ETCaption1>
          <Box
            sx={{
              mt: 2,
              overflowY: "auto",
              flex: 1,
              minHeight: 0,
            }}
          >
            {sortedPhases.map((phase, idx) => (
              <Box
                key={phase}
                sx={{ display: "flex", alignItems: "center", mb: 1 }}
              >
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    backgroundColor: COLORS[idx % COLORS.length],
                    mr: 1,
                    borderRadius: "4px",
                  }}
                />
                <ETCaption1>{phase}</ETCaption1>
              </Box>
            ))}
          </Box>
        </GrayBox>
      </Grid>
    </Grid>
  );
};

export default MedianPhaseOverageByWorktypeChart;
