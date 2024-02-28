import React from "react";
import { Grid } from "@mui/material";
import { ETCaption1, ETCaption3, GrayBox } from "components/shared";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

const WorkByType = () => {
  const data = [
    { name: "Assessment", value: 22 },
    { name: "Amendment", value: 13 },
    { name: "Minister's Designation", value: 3 },
    { name: "Project Notification", value: 1 },
    { name: "Exemption Order", value: 1 },
  ];

  const COLORS = ["#4F81BD", "#C0504D", "#8064A2", "#4BACC6", "#9BBB59"];
  return (
    <GrayBox>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <ETCaption1 bold>WORK BY TYPE</ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption3>
            The proportion of active Works categorized by their type
          </ETCaption3>
        </Grid>
        <Grid item xs={12} container justifyContent={"center"}>
          <PieChart width={500} height={300}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
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
          </PieChart>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default WorkByType;
