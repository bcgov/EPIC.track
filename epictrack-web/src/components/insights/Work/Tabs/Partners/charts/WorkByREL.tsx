import { Box, Grid } from "@mui/material";
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
import { WorkByRel } from "models/insights";
import { useGetWorksByRelQuery } from "services/rtkQuery/workInsights";
import { showNotification } from "components/shared/notificationProvider";
import PieChartSkeleton from "components/insights/PieChartSkeleton";
import { useInsightsContext } from "components/insights/InsightsContext";
import { useTableFilterContext } from "components/insights/TableFilterContext";

const WorkByREL = () => {
  const { isUserInsights, staffId } = useInsightsContext();

  const { columnFilters } = useTableFilterContext();
  const {
    data,
    error,
    isLoading: isChartLoading,
  } = useGetWorksByRelQuery(
    {
      columnFilters,
      staffId: isUserInsights ? staffId : undefined,
    },
    {
      skip: columnFilters.length === 0,
      refetchOnMountOrArgChange: true,
    },
  );

  const formatData = (data?: WorkByRel[]) => {
    if (!data) return [];
    return data.map((item) => {
      return {
        name: item.rel_staff,
        value: item.count,
        id: item.rel_staff_id,
      };
    });
  };

  if (error) {
    showNotification("Could not load Works by REL data", {
      duration: 3000,
      type: "error",
    });
  }

  if (isChartLoading || error) {
    return <PieChartSkeleton loading={isChartLoading} />;
  }

  const chartData = formatData(data);

  return (
    <GrayBox sx={{ height: "100%" }}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <ETCaption1 bold>WORK BY REL</ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption3>
            The proportion of active Works assigned to each REL
          </ETCaption3>
        </Grid>
        <Grid item xs={12} container justifyContent={"center"}>
          <Box sx={{ width: "100%", maxWidth: 600, mx: "auto" }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
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
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  iconSize={16}
                  wrapperStyle={{
                    fontSize: "14px",
                    maxWidth: "300px",
                    minWidth: "200px",
                    overflow: "scroll",
                  }}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default WorkByREL;
