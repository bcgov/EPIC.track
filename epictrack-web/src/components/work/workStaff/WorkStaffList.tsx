import React from "react";
import { MRT_ColumnDef } from "material-react-table";
import { Box, Grid, IconButton, Autocomplete, TextField } from "@mui/material";
import { RESULT_STATUS } from "../../../constants/application-constant";
import { WorkStaff } from "../../../models/workStaff";
import workService from "../../../services/workService/workService";
import MasterTrackTable from "../../shared/MasterTrackTable";
import { EpicTrackPageGridContainer } from "../../shared";
import projectService from "../../../services/projectService/projectService";

const WorkStaffList = () => {
  const [wsData, setwsData] = React.useState<WorkStaff[]>([]);
  const [resultStatus, setResultStatus] = React.useState<string>();
  const [loading, setLoading] = React.useState<boolean>(false);

  const getWorkStaffAllocation = React.useCallback(async () => {
    setLoading(true);
    try {
      const workStaffingResult = await workService.getWorkStaffDetails();
      if (workStaffingResult.status === 200) {
        setwsData(workStaffingResult.data as WorkStaff[]);
      }
    } catch (error) {
      console.error("Work Staffing List: ", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    getWorkStaffAllocation();
  }, []);

  let uniquestaff: any[] = [];
  wsData.forEach((value, index) => {
    if (value.staff.length > 0) {
      const roles = value.staff
        .map((p) => p.role.name)
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
      uniquestaff = [...uniquestaff, ...roles].filter(
        (ele, index, arr) => arr.findIndex((t) => t === ele) === index
      );
    }
  });
  const setRoleColumns = React.useCallback(() => {
    let columns: Array<MRT_ColumnDef<WorkStaff>> = [];
    if (wsData && wsData.length > 0) {
      columns = uniquestaff.map((rolename: any, index: number) => {
        return {
          header: rolename,
          accessorFn: (row: any) =>
            `${row.staff
              .filter((p: { role: { name: any } }) => p.role.name === rolename)
              .map(
                (p: { first_name: string; last_name: string }) =>
                  `${p.first_name} ${p.last_name}`
              )
              .join(",")}`,
          enableHiding: false,
          enableColumnFilter: true,
        } as MRT_ColumnDef<WorkStaff>;
      });
    }
    return columns;
  }, [wsData]);

  const projectFilter = React.useMemo(
    () =>
      wsData
        .filter((p) => p.project && p.project.name)
        .map((p) => p.project.name)
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [wsData]
  );

  const titleFilter = React.useMemo(
    () =>
      wsData
        .filter((p) => p.title)
        .map((p) => p.title)
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [wsData]
  );

  const teamFilter = React.useMemo(
    () =>
      wsData
        .filter((p) => p.eao_team)
        .map((p) => p.eao_team.name)
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [wsData]
  );

  const responsibleEpdFilter = React.useMemo(
    () =>
      wsData
        .filter((p) => p.responsible_epd)
        .map(
          (p) =>
            `${p.responsible_epd.first_name} ${p.responsible_epd.last_name}`
        )
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [wsData]
  );

  const workLeadFilter = React.useMemo(
    () =>
      wsData
        .filter((p) => p.responsible_epd)
        .map((p) => `${p.work_lead.first_name} ${p.work_lead.last_name}`)
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [wsData]
  );

  const columns = React.useMemo<MRT_ColumnDef<WorkStaff>[]>(
    () => [
      {
        accessorKey: "project.name",
        header: "Project",
        enableHiding: false,
        filterVariant: "multi-select",
        filterSelectOptions: projectFilter,
      },
      {
        accessorKey: "title",
        header: "Work Title",
        filterVariant: "multi-select",
        filterSelectOptions: titleFilter,
      },
      {
        accessorKey: "eao_team.name",
        header: "Team",
        filterVariant: "multi-select",
        filterSelectOptions: teamFilter,
      },
      {
        accessorFn: (row: WorkStaff) =>
          row.responsible_epd
            ? `${row.responsible_epd?.first_name} ${row.responsible_epd?.last_name}`
            : "",
        header: "Responsible EPD",
        filterVariant: "multi-select",
        filterSelectOptions: responsibleEpdFilter,
      },
      {
        accessorFn: (row: WorkStaff) =>
          row.work_lead
            ? `${row.work_lead?.first_name} ${row.work_lead?.last_name}`
            : "",
        header: "Work Lead",
        filterVariant: "multi-select",
        filterSelectOptions: workLeadFilter,
      },
      ...setRoleColumns(),
    ],
    [
      setRoleColumns,
      titleFilter,
      teamFilter,
      responsibleEpdFilter,
      workLeadFilter,
    ]
  );
  return (
    <>
      <EpicTrackPageGridContainer
        direction="row"
        container
        columnSpacing={2}
        rowSpacing={3}
      >
        <Grid item xs={12}>
          <MasterTrackTable
            columns={columns}
            data={wsData}
            initialState={{
              sorting: [
                {
                  id: "title",
                  desc: false,
                },
              ],
            }}
            state={{
              isLoading: loading,
              showGlobalFilter: true,
            }}
            renderTopToolbarCustomActions={() => (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "right",
                }}
              ></Box>
            )}
          />
        </Grid>
      </EpicTrackPageGridContainer>
    </>
  );
};

export default WorkStaffList;
