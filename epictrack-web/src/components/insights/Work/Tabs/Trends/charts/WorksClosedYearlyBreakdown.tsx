import { Box, Grid, useMediaQuery, useTheme } from "@mui/material";
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
        <Grid item xs={12}>
          <ResponsiveContainer width="100%" height={isMobile ? 230 : 330}>
            <PieChart>
              <Pie
                data={chartData}
                cx={isMobile ? "50%" : "35%"}
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
                  formatter={(_, entry) => {
                    const payload = entry.payload as any;
                    return `${payload.year} - ${payload.work_state}`;
                  }}
                />
              )}
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Grid>
        {isMobile && chartData.length > 0 && (
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
                  key={index}
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
                  <ETCaption3>{`${entry.year} - ${entry.work_state}`}</ETCaption3>
                </Box>
              ))}
            </Box>
          </Grid>
        )}
      </Grid>
    </GrayBox>
  );
};

export default WorksClosedYearlyBreakdown;
