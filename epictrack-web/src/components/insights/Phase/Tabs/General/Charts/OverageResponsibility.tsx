import {
  Box,
  Grid,
  Tooltip as MuiTooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useInsightsContext } from "components/insights/InsightsContext";
import { usePhaseInsightsContext } from "components/insights/Phase/PhaseInsightsContext";
import PieChartSkeleton from "components/insights/PieChartSkeleton";
import { useTableFilterContext } from "components/insights/TableFilterContext";
import { getChartColor } from "components/insights/utils";
import { GrayBox, ETCaption1, ETCaption3 } from "components/shared";
import { showNotification } from "components/shared/notificationProvider";
import { ResponsibilityByWorktypePhase } from "models/insights";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useGetOverageResponsibilityQuery } from "services/rtkQuery/phaseInsights";

const OverageResponsibilityChart = () => {
  const { viewUnderage: isUnderageToggled } = usePhaseInsightsContext();
  const { columnFilters } = useTableFilterContext();
  const { loadingWorkPhases } = usePhaseInsightsContext();
  const { isUserInsights, staffId } = useInsightsContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    data,
    error,
    isLoading: isChartLoading,
  } = useGetOverageResponsibilityQuery(
    {
      columnFilters,
      staffId: isUserInsights ? staffId : undefined,
      isUnderageToggled,
    },
    { skip: columnFilters.length === 0 || isUnderageToggled },
  );

  if (error) {
    showNotification("Could not load phase overage responsibility data", {
      duration: 3000,
      type: "error",
    });
  }

  if (isChartLoading || loadingWorkPhases || !data) {
    return <PieChartSkeleton loading={isChartLoading} />;
  }

  const formatData = (data?: ResponsibilityByWorktypePhase[]) => {
    if (!data) return [];
    return data.map((item) => {
      return {
        name: item.responsibility_name,
        value: item.count,
        id: item.responsibility_id,
      };
    });
  };

  const chartData = formatData(data);

  if (isUnderageToggled) {
    return <></>;
  }

  return (
    <GrayBox sx={{ height: "100%" }}>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <MuiTooltip title="Includes Legislated Phases plus Amendment Phases">
            <span>
              <ETCaption1 bold>OVERAGE RESPONSIBILITY</ETCaption1>
            </span>
          </MuiTooltip>
        </Grid>
        <Grid item xs={12} container justifyContent={"center"}>
          {!isUnderageToggled && (
            <ResponsiveContainer width="100%" height={isMobile ? 230 : 330}>
              <PieChart width={400} height={350}>
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
                    <Cell
                      key={`cell-${entry.id}`}
                      fill={getChartColor(index)}
                    />
                  ))}
                </Pie>
                {!isMobile && (
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    iconSize={14}
                    wrapperStyle={{
                      fontSize: "13px",
                      maxWidth: "45%",
                      maxHeight: "300px",
                      overflowY: "auto",
                      overflowX: "hidden",
                    }}
                  />
                )}
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Grid>
        {isMobile && !isUnderageToggled && chartData.length > 0 && (
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px 12px",
                justifyContent: "center",
                overflowY: "auto",
                pt: 0.5,
              }}
            >
              {chartData.map((entry, index) => (
                <Box
                  key={entry.id}
                  sx={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      flexShrink: 0,
                      backgroundColor: getChartColor(index),
                    }}
                  />
                  <ETCaption3>{entry.name}</ETCaption3>
                </Box>
              ))}
            </Box>
          </Grid>
        )}
      </Grid>
    </GrayBox>
  );
};

export default OverageResponsibilityChart;
