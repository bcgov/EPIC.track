import { useEffect } from "react";
import { Box, Grid, useMediaQuery, useTheme } from "@mui/material";
import { ETCaption1, ETCaption3, GrayBox } from "components/shared";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getChartColor } from "components/insights/utils";
import { useLazyGetProjectBySubTypeQuery } from "services/rtkQuery/projectInsights";
import { ProjectBySubtype } from "models/insights";
import { showNotification } from "components/shared/notificationProvider";
import PieChartSkeleton from "components/insights/PieChartSkeleton";
import { useProjectsContext } from "./ProjectsContext";
import { useTableFilterContext } from "../TableFilterContext";
import { useInsightsContext } from "../InsightsContext";
import { BAR_COLOR } from "../utils";

const ProjectBySubtypeChart = () => {
  const { columnFilters } = useTableFilterContext();
  const { loadingProjects } = useProjectsContext();
  const { isUserInsights, staffId } = useInsightsContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loadChartTrigger, queryResult] = useLazyGetProjectBySubTypeQuery();

  useEffect(() => {
    loadChartTrigger({
      columnFilters,
      staffId: isUserInsights ? staffId : undefined,
    });
  }, [loadChartTrigger, columnFilters, staffId, isUserInsights]);

  if (queryResult.isError) {
    showNotification("Could not load Project Subtype data", {
      type: "error",
      duration: 3000,
    });
  }

  if (loadingProjects || queryResult.isLoading) {
    return <PieChartSkeleton loading={queryResult.isLoading} />;
  }

  const formatData = (data?: ProjectBySubtype[]) => {
    if (!data || data.length === 0) {
      return {
        data: [
          {
            name: "No result",
            value: 1,
            id: 0,
          },
        ],
        noData: true,
      };
    }
    return {
      data: data.map((item) => {
        return {
          name: item.sub_type,
          value: item.count,
          id: item.sub_type_id,
        };
      }),
      noData: false,
    };
  };

  const { data: chartData, noData } = formatData(queryResult.data);

  return (
    <GrayBox sx={{ height: "100%" }}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <ETCaption1 bold>PROJECT BY SUBTYPE</ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption3>
            The proportion of active Projects categorized by their subtype
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
                fill={BAR_COLOR}
                dataKey="value"
                label={!noData}
                isAnimationActive={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${entry.id}`} fill={getChartColor(index)} />
                ))}
              </Pie>
              {!isMobile && !noData && (
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
              {!noData && <Tooltip />}
            </PieChart>
          </ResponsiveContainer>
        </Grid>
        {isMobile && !noData && (
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

export default ProjectBySubtypeChart;
