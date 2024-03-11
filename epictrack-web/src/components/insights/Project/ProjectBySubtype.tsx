import React, { useEffect, useMemo } from "react";
import { Box, Grid } from "@mui/material";
import { ETCaption1, ETCaption3, GrayBox } from "components/shared";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { getChartColor } from "components/insights/utils";
import { useLazyGetProjectBySubTypeQuery } from "services/rtkQuery/insights";
import { ProjectBySubtype } from "models/insights";
import { showNotification } from "components/shared/notificationProvider";
import { COMMON_ERROR_MESSAGE } from "constants/application-constant";
import PieChartSkeleton from "components/insights/PieChartSkeleton";
import TrackSelect from "components/shared/TrackSelect";
import { useProjectsContext } from "./ProjectsContext";
import { getProjectsSubtypes } from "./utils";
import { OptionType } from "components/shared/filterSelect/type";
import { Unless } from "react-if";

const ProjectBySubtypeChart = () => {
  const { projects, loadingProjects } = useProjectsContext();
  const projectSubtypes = useMemo(
    () => getProjectsSubtypes(projects),
    [projects]
  );
  const [selectedSubtype, setSelectedSubtype] = React.useState({
    id: 0,
    name: "",
  });

  const [loadChartTrigger, queryResult] = useLazyGetProjectBySubTypeQuery();

  useEffect(() => {
    if (projectSubtypes) {
      const defaultSubtype = projectSubtypes[0];
      setSelectedSubtype(defaultSubtype);
    }
  }, [projectSubtypes]);

  useEffect(() => {
    if (selectedSubtype?.id) {
      loadChartTrigger(selectedSubtype.id);
    }
  }, [selectedSubtype]);

  if (loadingProjects || queryResult.isLoading || !selectedSubtype) {
    return <PieChartSkeleton />;
  }

  // TODO: handle error
  if (queryResult.isError) {
    showNotification(COMMON_ERROR_MESSAGE, { type: "error" });
    return <div>Error</div>;
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
        <Grid item xs={12} container justifyContent="flex-end">
          <Box sx={{ width: "200px" }}>
            <TrackSelect
              options={projectSubtypes.map((subtype) => ({
                value: subtype.id,
                label: subtype.name,
              }))}
              value={{
                value: selectedSubtype.id,
                label: selectedSubtype.name,
              }}
              onChange={(selectedOption) => {
                const option = selectedOption as OptionType;
                setSelectedSubtype({
                  id: Number(option.value),
                  name: option.label as string,
                });
              }}
              isClearable={false}
            />
          </Box>
        </Grid>
        <Grid item xs={12} container justifyContent={"center"}>
          <PieChart width={600} height={300}>
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
                maxWidth: "200px", // Add this line to limit the width of the legend
                overflow: "hidden",
              }}
            />
            <Unless condition={noData}>
              <Tooltip />
            </Unless>
          </PieChart>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default ProjectBySubtypeChart;
