import { Box, Grid, useMediaQuery, useTheme } from "@mui/material";
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
import { BAR_COLOR } from "../../../../utils";

const WorkByTeamChart = () => {
  const { isUserInsights, staffId } = useInsightsContext();

  const { columnFilters } = useTableFilterContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    data: chartData,
    error,
    isLoading: isChartLoading,
  } = useGetWorksByTeamQuery(
    {
      columnFilters,
      staffId: isUserInsights ? staffId : undefined,
    },
    { skip: columnFilters.length === 0 },
  );

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

  const pieData = formatData(chartData);

  return (
    <GrayBox sx={{ height: "100%" }}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <ETCaption1 bold>WORK BY TEAM</ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption3>The proportion of active Works by each team</ETCaption3>
        </Grid>
        <Grid item xs={12}>
          <ResponsiveContainer width="100%" height={isMobile ? 230 : 330}>
            <PieChart>
              <Pie
                data={pieData}
                cx={isMobile ? "50%" : "35%"}
                cy="50%"
                outerRadius={80}
                fill={BAR_COLOR}
                dataKey="value"
                label
                isAnimationActive={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${entry.id}`} fill={getChartColor(index)} />
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
        </Grid>
        {isMobile && pieData.length > 0 && (
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
              {pieData.map((entry, index) => (
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

export default WorkByTeamChart;
