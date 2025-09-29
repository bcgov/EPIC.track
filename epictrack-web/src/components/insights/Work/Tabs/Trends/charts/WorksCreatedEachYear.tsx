import { Grid } from "@mui/material";
import BarChartSkeleton from "components/insights/BarChartSkeleton";
import { useInsightsContext } from "components/insights/InsightsContext";
import { getChartColor } from "components/insights/utils";
import { useWorkInsightsContext } from "components/insights/Work/WorkInsightsContext";
import { ETCaption1, ETCaption3, GrayBox } from "components/shared";
import { showNotification } from "components/shared/notificationProvider";
import { WorkByYear } from "models/insights";
import { Tooltip, BarChart, Bar, XAxis, YAxis, Cell } from "recharts";
import { useGetWorksByYearOpenedQuery } from "services/rtkQuery/workInsights";

const WorksCreatedEachYear = () => {
  const { columnFilters } = useWorkInsightsContext();
  const { isUserInsights, staffId } = useInsightsContext();

  const {
    data: chartData,
    error,
    isLoading: isChartLoading,
  } = useGetWorksByYearOpenedQuery({
    columnFilters,
    staffId: isUserInsights ? staffId : undefined,
  });

  if (error) {
    showNotification("Could not load Works created each year", {
      duration: 3000,
      type: "error",
    });
  }

  if (isChartLoading || !chartData) {
    return <BarChartSkeleton loading={isChartLoading} />;
  }

  const formatData = (data: WorkByYear[]) => {
    if (!data) return [];
    return data.map((item) => {
      return {
        name: item.year,
        value: item.count,
        id: item.id,
      };
    });
  };

  return (
    <GrayBox sx={{ height: "100%" }}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <ETCaption1 bold>WORKS CREATED BY YEAR</ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption3>The number of works created each year</ETCaption3>
        </Grid>
        <Grid item xs={12} container justifyContent={"center"}>
          <BarChart
            layout="vertical"
            width={350}
            height={chartData.length * 30 + 100}
            data={formatData(chartData)}
          >
            <XAxis allowDecimals={false} type={"number"} />
            <YAxis
              dataKey={"name"}
              type={"category"}
              width={40}
              tick={{ fontSize: 12 }}
            />
            <Bar dataKey="value">
              {formatData(chartData).map((entry, index: number) => (
                <Cell key={`cell-${entry.id}`} fill={getChartColor(index)} />
              ))}
            </Bar>
            <Tooltip />
          </BarChart>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default WorksCreatedEachYear;
