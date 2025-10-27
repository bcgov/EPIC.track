import { Grid, Box } from "@mui/material";
import { useInsightsContext } from "components/insights/InsightsContext";
import { usePhaseInsightsContext } from "components/insights/Phase/PhaseInsightsContext";
import PieChartSkeleton from "components/insights/PieChartSkeleton";
import { useTableFilterContext } from "components/insights/TableFilterContext";
import { getChartColor } from "components/insights/utils";
import { GrayBox, ETCaption1 } from "components/shared";
import { OptionType } from "components/shared/filterSelect/type";
import { showNotification } from "components/shared/notificationProvider";
import TrackSelect from "components/shared/TrackSelect";
import { ResponsibilityByWorktypePhase } from "models/insights";
import { useMemo, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useGetOverageResponsibilityQuery } from "services/rtkQuery/phaseInsights";

const OverageResponsibilityChart = () => {
  const { columnFilters } = useTableFilterContext();
  const { workPhases, loadingWorkPhases } = usePhaseInsightsContext();
  const { isUserInsights, staffId } = useInsightsContext();
  const [selectedWorkType, setSelectedWorkType] = useState<OptionType | null>({
    value: "all",
    label: "All",
  });

  const [selectedPhase, setSelectedPhase] = useState<OptionType | null>({
    value: "all",
    label: "All",
  });

  const {
    data,
    error,
    isLoading: isChartLoading,
  } = useGetOverageResponsibilityQuery({
    columnFilters,
    selectedWorkType: String(selectedWorkType?.value) || "all",
    selectedPhase: String(selectedPhase?.value) || "all",
    staffId: isUserInsights ? staffId : undefined,
  }, { skip: columnFilters.length === 0 });

  const workTypeOptions = useMemo(() => {
    if (!workPhases) return [];
    const workTypes = Array.from(
      new Map(
        workPhases.map((item: any) => [
          item.work.work_type_id,
          item.work.work_type.name,
        ])
      ).entries()
    ) as [string, string][];
    return workTypes
      .map(([id, name]) => ({
        id,
        name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [workPhases]);

  const phaseOptions = useMemo(() => {
    if (!data || !workPhases) return [];
    const uniquePhases = new Map<string, string>();
    workPhases.forEach((item: any) => {
      const id = item.work.current_work_phase.phase.id;
      const name = item.work.current_work_phase.phase.name;
      uniquePhases.set(id, name);
    });
    // Remove any duplicate names as well as duplicate ids
    const seenNames = new Set<string>();
    return Array.from(uniquePhases.entries())
      .filter(([_, name]) => {
        if (seenNames.has(name)) return false;
        seenNames.add(name);
        return true;
      })
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data, workPhases]);

  if (error) {
    showNotification("Could not load phase overage responsibility data", {
      duration: 3000,
      type: "error",
    });
  }

  if (isChartLoading || loadingWorkPhases || !data) {
    return <PieChartSkeleton loading={isChartLoading} />;
  }

  const formatData = (data?: ResponsibilityByWorktypePhase[]) => {
    if (!data) return [];
    return data.map((item) => {
      return {
        name: item.responsibility_name,
        value: item.count,
        id: item.responsibility_id,
      };
    });
  };

  const chartData = formatData(data);

  return (
    <GrayBox sx={{ height: "100%" }}>
      <Grid container spacing={1}>
        <Grid item xs={4}>
          <ETCaption1 bold>OVERAGE RESPONSIBILITY</ETCaption1>
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
                { value: "all", label: "All" },
                ...phaseOptions.map((phase: { id: string; name: string }) => ({
                  value: phase.id,
                  label: phase.name,
                })),
              ]}
              placeholder="Select Phase"
              value={
                selectedPhase
                  ? {
                      value: selectedPhase.value,
                      label: selectedPhase.label,
                    }
                  : { value: "all", label: "All" }
              }
              onChange={(selectedOption) => {
                const option = selectedOption as OptionType;
                setSelectedPhase({
                  value: option.value,
                  label: option.label as string,
                });
              }}
              isClearable={false}
            />
          </Box>
        </Grid>
        <Grid item xs={12} container justifyContent={"center"}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart width={400} height={350}>
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
                }}
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default OverageResponsibilityChart;
