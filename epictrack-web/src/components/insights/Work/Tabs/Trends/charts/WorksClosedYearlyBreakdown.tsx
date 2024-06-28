import { Box, Grid } from "@mui/material";
import PieChartSkeleton from "components/insights/PieChartSkeleton";
import { getChartColor } from "components/insights/utils";
import { ETCaption1, ETCaption3, GrayBox } from "components/shared";
import TrackSelect from "components/shared/TrackSelect";
import { OptionType } from "components/shared/filterSelect/type";
import { showNotification } from "components/shared/notificationProvider";
import { COMMON_ERROR_MESSAGE } from "constants/application-constant";
import { WorkStateByYear } from "models/insights";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { useGetWorkClosureBreakdownQuery } from "services/rtkQuery/workInsights";

const WorksClosedYearlyBreakdown = () => {
  const [yearOptions, setYearOptions] = useState<OptionType[]>();
  const [selectedYear, setSetSelectedYear] = useState<string>();
  const [displayData, setDisplayData] = useState<WorkStateByYear[]>([]);

  const {
    data: chartData,
    error,
    isLoading: isChartLoading,
  } = useGetWorkClosureBreakdownQuery();

  useEffect(() => {
    if (!chartData) return;
    const years: OptionType[] = [];
    chartData.map((entry) => {
      const year = { value: entry.year, label: entry.year };
      if (!years.find((item) => item?.value === year?.value)) years.push(year);
    });
    years.sort(
      (a, b) => parseInt(b?.value as string) - parseInt(a?.value as string)
    );
    setYearOptions(years);
    setSetSelectedYear(years[0]?.value as string);
  }, [chartData]);

  useEffect(() => {
    if (!chartData) return;
    const filteredData = chartData.filter((item) => item.year === selectedYear);
    setDisplayData(filteredData);
  }, [selectedYear]);

  if (isChartLoading || !chartData) {
    return <PieChartSkeleton />;
  }

  // TODO: handle error
  if (error) {
    showNotification(COMMON_ERROR_MESSAGE, { type: "error" });
    return <div>Error</div>;
  }
  return (
    <GrayBox sx={{ height: "100%" }}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <ETCaption1 bold>YEARLY WORK STATE CLOSURE BREAKDOWN</ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption3>
            The proportion of work closures categorized by their work state
          </ETCaption3>
        </Grid>
        <Grid item xs={12} container justifyContent="flex-end">
          <Box sx={{ width: "200px" }}>
            <TrackSelect
              options={yearOptions}
              value={{
                value: selectedYear,
                label: selectedYear,
              }}
              onChange={(selectedOption) => {
                const option = selectedOption as OptionType;
                setSetSelectedYear(option.value as string);
              }}
              isClearable={false}
            />
          </Box>
        </Grid>
        <Grid item xs={12} container justifyContent={"center"}>
          <PieChart width={600} height={300}>
            <Pie
              data={displayData}
              cx="50%"
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
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              iconSize={16}
              wrapperStyle={{
                fontSize: "16px",
                maxWidth: "200px", // Add this line to limit the width of the legend
                overflow: "hidden",
              }}
            />
            <Tooltip key={"work_state"} />
          </PieChart>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default WorksClosedYearlyBreakdown;
