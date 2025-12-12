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
  Legend,
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
  const { viewUnderage: isUnderageToggled } = usePhaseInsightsContext();
  const { columnFilters } = useTableFilterContext();
  const { loadingWorkPhases } = usePhaseInsightsContext();
  const { isUserInsights, staffId } = useInsightsContext();

  const {
    data: chartData,
    error,
    isLoading: isChartLoading,
  } = useGetMedianPhaseOverageByWorktypeQuery(
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
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <BarChartSkeleton loading={isChartLoading} />
        </Grid>
      </Grid>
    );
  }

  const { data, sortedPhases } = formatData(chartData);

  return (
    <Grid container>
      <Grid item xs={12}>
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
                  <ETCaption1 bold>
                    MEDIAN PHASE {isUnderageToggled ? "UNDERAGE" : "OVERAGE"} BY
                    WORKTYPE
                  </ETCaption1>
                </span>
              </MuiTooltip>
            </Grid>
          </Grid>
          <Box
            className="median-phase-overage-worktype-chart"
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
              <ResponsiveContainer
                width="100%"
                height={400}
                maxHeight={600}
                key={isUnderageToggled ? "underage" : "overage"}
              >
                <BarChart
                  data={data}
                  layout="vertical"
                  margin={{ left: 80, bottom: 40, right: 20 }}
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

                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{
                      paddingLeft: "20px",
                      paddingRight: "10px",
                      fontSize: "13px",
                      lineHeight: "1.5",
                    }}
                    iconType="square"
                    iconSize={15}
                    content={(props) => {
                      const { payload } = props;
                      return (
                        <div style={{ paddingLeft: "20px", maxWidth: "400px" }}>
                          <div
                            style={{
                              fontWeight: "bold",
                              fontSize: "12px",
                              letterSpacing: "0.5px",
                              marginBottom: "8px",
                            }}
                          >
                            PHASES
                          </div>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "6px 12px",
                              alignItems: "start",
                            }}
                          >
                            {payload?.map((entry, index) => (
                              <div
                                key={`item-${index}`}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  fontSize: "14px",
                                  lineHeight: "1.4",
                                  minWidth: 0,
                                }}
                              >
                                <svg
                                  width="15"
                                  height="15"
                                  style={{ marginRight: "6px", flexShrink: 0 }}
                                >
                                  <rect
                                    width="15"
                                    height="15"
                                    fill={entry.color}
                                    rx="2"
                                  />
                                </svg>
                                <span
                                  style={{
                                    wordBreak: "break-word",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {entry.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }}
                  />
                  {sortedPhases.map((phase, idx) => (
                    <Bar
                      key={phase}
                      dataKey={phase}
                      stackId="a"
                      fill={COLORS[idx % COLORS.length]}
                      name={phase}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </Box>
        </GrayBox>
      </Grid>
    </Grid>
  );
};

export default MedianPhaseOverageByWorktypeChart;
