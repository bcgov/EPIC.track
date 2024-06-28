import { Grid } from "@mui/material";
import BarChartSkeleton from "components/insights/BarChartSkeleton";
import { getChartColor } from "components/insights/utils";
import { ETCaption1, ETCaption3, GrayBox } from "components/shared";
import { showNotification } from "components/shared/notificationProvider";
import { COMMON_ERROR_MESSAGE } from "constants/application-constant";
import { WorkByYear } from "models/insights";
import { Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { useGetWorksByYearCompletedQuery } from "services/rtkQuery/workInsights";

const WorksCompletedEachYear = () => {
  const {
    data: chartData,
    error,
    isLoading: isChartLoading,
  } = useGetWorksByYearCompletedQuery();

  if (isChartLoading || !chartData) {
    return <BarChartSkeleton />;
  }

  // TODO: handle error
  if (error) {
    showNotification(COMMON_ERROR_MESSAGE, { type: "error" });
    return <div>Error</div>;
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
          <ETCaption1 bold>WORKS CLOSED BY YEAR</ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption3>The number of works closed each year</ETCaption3>
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

export default WorksCompletedEachYear;
