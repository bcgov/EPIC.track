import { useEffect } from "react";
import { Grid } from "@mui/material";
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

const ProjectBySubtypeChart = () => {
  const { columnFilters } = useTableFilterContext();
  const { loadingProjects } = useProjectsContext();
  const { isUserInsights, staffId } = useInsightsContext();

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
        <Grid item xs={12} container justifyContent={"center"}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={!noData}
                isAnimationActive={false}
              >
                {chartData.map((entry, index) => (
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
                  maxWidth: "250px",
                  maxHeight: "330px",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              />
              {!noData && <Tooltip />}
            </PieChart>
          </ResponsiveContainer>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default ProjectBySubtypeChart;
