import { Grid, Box } from "@mui/material";
import BarChartSkeleton from "components/insights/BarChartSkeleton";
import { usePhaseInsightsContext } from "components/insights/Phase/PhaseInsightsContext";
import { useTableFilterContext } from "components/insights/TableFilterContext";
import { BAR_COLOR } from "components/insights/utils";
import { GrayBox, ETCaption1 } from "components/shared";
import { OptionType } from "components/shared/filterSelect/type";
import { showNotification } from "components/shared/notificationProvider";
import TrackSelect from "components/shared/TrackSelect";
import { useMemo, useState } from "react";
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { useGetOverageByYearQuery } from "services/rtkQuery/phaseInsights";

const PercentOfPhaseOveragesByYear = () => {
  const { columnFilters } = useTableFilterContext();
  const { workPhases, loadingWorkPhases } = usePhaseInsightsContext();
  const [selectedWorkType, setSelectedWorkType] = useState<OptionType | null>({
    value: "all",
    label: "All",
  });
  const [selectedYear, setSelectedYear] = useState<OptionType | null>({
    value: new Date().getFullYear(),
    label: String(new Date().getFullYear()),
  });

  const {
    data: chartData,
    error,
    isLoading: isChartLoading,
  } = useGetOverageByYearQuery({
    columnFilters,
    selectedWorkType: String(selectedWorkType?.value) || "all",
    selectedYear: String(selectedYear?.value) || "all",
  });

  const workTypeOptions = useMemo(() => {
    if (!workPhases) return [];
    const workTypes = Array.from(
      new Map(
        workPhases.map((item: any) => [
          item.work.work_type_id,
          item.work.work_type.name,
        ]),
      ).entries(),
    );
    return workTypes.map(([id, name]) => ({
      id,
      name,
    }));
  }, [workPhases]);

  const yearOptions = useMemo(() => {
    const years = workPhases?.flatMap((phaseItem: any) =>
      new Date(phaseItem.work_phase.end_date).getFullYear(),
    );
    return Array.from(new Set(years) as Set<number>).sort((a, b) => b - a);
  }, [workPhases]);

  if (error) {
    showNotification(
      "Could not load WorkPhases by Percent of Phases with Overage data",
      {
        duration: 3000,
        type: "error",
      },
    );
  }

  if (isChartLoading || loadingWorkPhases || !chartData) {
    return <BarChartSkeleton loading={isChartLoading} />;
  }

  return (
    <GrayBox sx={{ height: "100%" }}>
      <Grid container spacing={1} sx={{ height: "100%" }}>
        <Grid item xs={4}>
          <ETCaption1 bold>PHASE OVERAGE BY YEAR</ETCaption1>
        </Grid>
        <Grid item xs={4} container justifyContent="flex-end">
          <Box sx={{ width: "200px" }}>
            <TrackSelect
              options={[
                { value: "all", label: "All" },
                ...workTypeOptions.map((workType) => ({
                  value: workType.id,
                  label: workType.name,
                })),
              ]}
              placeholder="Select Work Type"
              value={
                selectedWorkType
                  ? {
                      value: selectedWorkType.value,
                      label: selectedWorkType.label,
                    }
                  : { value: "all", label: "All" }
              }
              onChange={(selectedOption) => {
                const option = selectedOption as OptionType;
                setSelectedWorkType({
                  value: option.value,
                  label: option.label as string,
                });
              }}
              isClearable={false}
            />
          </Box>
        </Grid>
        <Grid item xs={4} container justifyContent="flex-end">
          <Box sx={{ width: "200px" }}>
            <TrackSelect
              options={[
                ...yearOptions.map((year) => ({
                  value: year,
                  label: String(year),
                })),
              ]}
              placeholder="Select a Year"
              value={
                selectedYear
                  ? {
                      value: selectedYear.value,
                      label: selectedYear.label,
                    }
                  : { value: "all", label: "All" }
              }
              onChange={(selectedOption) => {
                const option = selectedOption as OptionType;
                setSelectedYear({
                  value: option.value,
                  label: option.label as string,
                });
              }}
              isClearable={false}
            />
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          container
          justifyContent={"center"}
          sx={{ flex: 1, minHeight: 350 }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              minHeight: 350,
              overflowY: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pb: 4,
            }}
          >
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ left: 80, bottom: 40 }}
              height={Math.max(chartData.length * 50 + 100, 350)}
              width={400}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                allowDecimals={false}
                label={{
                  value: "% of Phases with Overage",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis
                dataKey="phase"
                type="category"
                width={40}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number, name: string) => [`${value}%`, name]}
              />
              <Bar
                dataKey="percent_overage"
                fill={BAR_COLOR}
                barSize={20}
                name="Average Overage"
              />
            </BarChart>
          </Box>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default PercentOfPhaseOveragesByYear;
