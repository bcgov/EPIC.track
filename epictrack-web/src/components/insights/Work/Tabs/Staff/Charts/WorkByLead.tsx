import { Grid, Box } from "@mui/material";
import { ETCaption1, ETCaption3, GrayBox } from "components/shared";
import { useGetWorksByLeadQuery } from "services/rtkQuery/workInsights";
import { showNotification } from "components/shared/notificationProvider";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WorkByLead } from "models/insights";
import BarChartSkeleton from "components/insights/BarChartSkeleton";
import { useWorkInsightsContext } from "components/insights/Work/WorkInsightsContext";
import { useInsightsContext } from "components/insights/InsightsContext";

const WorkByLeadChart = () => {
  const { columnFilters } = useWorkInsightsContext();
  const { isUserInsights, staffId } = useInsightsContext();
  const {
    data: chartData,
    error,
    isLoading: isChartLoading,
  } = useGetWorksByLeadQuery({
    columnFilters,
    staffId: isUserInsights ? staffId : undefined,
  });

  if (error) {
    showNotification("Could not load Works by Lead data", {
      duration: 3000,
      type: "error",
    });
  }

  if (isChartLoading || !chartData) {
    return <BarChartSkeleton loading={isChartLoading} />;
  }

  const formatData = (data: WorkByLead[]) => {
    if (!data) return [];
    return data.map((item) => {
      return {
        name: item.work_lead,
        value: item.count,
        id: item.work_lead_id,
      };
    });
  };

  return (
    <GrayBox sx={{ height: "100%" }}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <ETCaption1 bold>WORK BY LEAD AND CO-LEAD</ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption3>
            The number of active Works lead by each lead or co-lead
          </ETCaption3>
        </Grid>
        <Grid item xs={12} container justifyContent={"center"}>
          <Box style={{ width: "100%", maxHeight: 800, overflowY: "auto" }}>
            <BarChart
              layout="vertical"
              data={formatData(chartData)}
              margin={{
                left: 40, // Increase left margin if names are getting cut off
              }}
              height={chartData.length * 30 + 100}
              width={600} // Adjust this value as needed
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                width={45} // Adjust the width to give more space for text
                tick={{ fontSize: 12 }} // Make sure to pass the width
              />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" barSize={20}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={"#4bacc6"} />
                ))}
              </Bar>
            </BarChart>
          </Box>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default WorkByLeadChart;
