import { Grid, Box } from "@mui/material";
import { ETCaption1, ETCaption3, GrayBox } from "components/shared";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { BAR_COLOR } from "components/insights/utils";
import { WorkByNation } from "models/insights";
import { useGetWorksByNationQuery } from "services/rtkQuery/workInsights";
import { showNotification } from "components/shared/notificationProvider";
import BarChartSkeleton from "components/insights/BarChartSkeleton";
import { useWorkInsightsContext } from "components/insights/Work/WorkInsightsContext";
import { useInsightsContext } from "components/insights/InsightsContext";
import { useTableFilterContext } from "components/insights/TableFilterContext";

const WorkByNationChart = () => {
  const { isUserInsights, staffId } = useInsightsContext();

  const { columnFilters } = useTableFilterContext();
  const {
    data,
    error,
    isLoading: isChartLoading,
  } = useGetWorksByNationQuery({
    columnFilters,
    staffId: isUserInsights ? staffId : undefined,
  });

  const formatData = (data?: WorkByNation[]) => {
    if (!data) return [];
    return data.map((item) => {
      return {
        nation: item.first_nation,
        count: item.count,
      };
    });
  };

  if (error) {
    showNotification("Could not load Work by Nation data", {
      duration: 3000,
      type: "error",
    });
  }

  if (isChartLoading || error) {
    return <BarChartSkeleton loading={isChartLoading} />;
  }

  const chartData = formatData(data);

  return (
    <GrayBox sx={{ height: "100%" }}>
      <Grid container spacing={1} sx={{ height: "100%" }}>
        <Grid item xs={12}>
          <ETCaption1 bold>WORK BY NATION</ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption3>
            The number of active Works a Nation is associated with
          </ETCaption3>
        </Grid>
        <Grid item xs={12} container justifyContent={"center"}>
          <Box style={{ width: "100%", height: "300px", overflowY: "scroll" }}>
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{
                left: 40, // Increase left margin if names are getting cut off
              }}
              height={chartData.length * 30 + 100}
              width={600} // Adjust this value as needed
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis
                dataKey="nation"
                interval={0}
                tick={{ fontSize: 12 }}
                type="category"
                width={100}
              />
              <Tooltip />
              <Bar dataKey="count" fill={BAR_COLOR} barSize={20} />
            </BarChart>
          </Box>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default WorkByNationChart;
