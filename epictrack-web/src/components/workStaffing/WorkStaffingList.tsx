import React from "react";
import { MRT_ColumnDef } from "material-react-table";
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  TextField,
  Autocomplete,
} from "@mui/material";
import { RESULT_STATUS } from "../../constants/application-constant";
import { WorkTombstone } from "../../models/work";
import { WorkStaffingModel } from "../../models/workstaffing";
import WorkService from "../../services/workService";
import MasterTrackTable from "../shared/MasterTrackTable";
import TrackDialog from "../shared/TrackDialog";
import { EpicTrackPageGridContainer } from "../shared";

const WorkStaffList = () => {
  const [works, setWorks] = React.useState<WorkTombstone[]>([]);
  const [wsData, setwsData] = React.useState<WorkStaffingModel[]>([]);
  const [resultStatus, setResultStatus] = React.useState<string>();
  const [workId, setWorkId] = React.useState<number>();
  const [deleteWorkId, setDeleteWorkId] = React.useState<number>();
  const [showDialog, setShowDialog] = React.useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] =
    React.useState<boolean>(false);
  const [workLeads, setworkLeads] = React.useState<string[]>([]);
  const [teams, setTeams] = React.useState<string[]>([]);
  const [projects, setProjects] = React.useState<string[]>([]);
  const [responsibleEpds, setresponsibleEpds] = React.useState<string[]>([]);
  const titleSuffix = "Work Staffing";
  const onDialogClose = (event: any, reason: any) => {
    if (reason && reason == "backdropClick") return;
    setShowDialog(false);
  };
  const codeTypes: { [x: string]: any } = {
    workLeads: setworkLeads,
    eao_team: setTeams,
    responsibleEpds: setresponsibleEpds,
    wsData: setwsData,
  };

  React.useEffect(() => {
    Object.keys(codeTypes).forEach((key: string) => {
      const codes = works
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .map((w) => w[key]?.name)
        .filter(
          (ele, index, arr) => arr.findIndex((t) => t === ele) === index && ele
        );
      codeTypes[key](codes);
    });
  }, [works]);

  const getWorkstaffing = React.useCallback(async () => {
    setResultStatus(RESULT_STATUS.LOADING);
    try {
      const workStaffingResult = await WorkService.getWorks();
      if (workStaffingResult.status === 200) {
        setWorks(workStaffingResult.data as never);
      }
    } catch (error) {
      console.error("Work Staffing List: ", error);
    } finally {
      setResultStatus(RESULT_STATUS.LOADED);
    }
  }, []);

  React.useEffect(() => {
    getWorkstaffing();
  }, [getWorkstaffing]);

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
    let columns: Array<MRT_ColumnDef<WorkStaffingModel>> = [];
    if (wsData && wsData.length > 0) {
      columns = uniquestaff.map((rolename: any, index: number) => {
        return {
          header: rolename,
          accessorFn: (row: any) =>
            `${row.staff
              .filter((p: { role: { name: any } }) => p.role.name === rolename)
              .map(
                (p: { first_name: string; last_name: string }) =>
                  p.first_name + " " + p.last_name
              )
              .join(",")}`,
          enableHiding: false,
          enableColumnFilter: false,
        } as MRT_ColumnDef<WorkStaffingModel>;
      });
    }
    return columns;
  }, [wsData]);

  const filterFn = React.useCallback(
    (filterField: keyof WorkStaffingModel) =>
      wsData
        .filter((p) => p[filterField])
        .map((p) => p[filterField]?.toString())
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [wsData]
  );

  const titleFilter = filterFn("Worktitle");
  const eaoTeamFilter = filterFn("team");
  const responsibleEpdFilter = filterFn("responsible_epd");
  const workLeadFilter = filterFn("lead");
  const projectFilter = filterFn("project_name");
  const columns = React.useMemo<MRT_ColumnDef<WorkTombstone>[]>(
    () => [
      {
        accessorKey: "project.name",
        header: "Project",
        enableHiding: false,
        filterVariant: "multi-select",
        filterSelectOptions: projectFilter,
        Filter: ({ ...props }) => (
          <Autocomplete
            multiple
            options={projectFilter}
            onChange={(e, value) => props.header.column.setFilterValue(value)}
            value={
              props.header.column.getFilterValue()
                ? (props.header.column.getFilterValue() as [])
                : []
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                placeholder="Select to Hide"
              />
            )}
          />
        ),
        filterFn: (row, id, filterValue) => {
          return !filterValue.includes(row.getValue(id));
        },
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
        filterSelectOptions: eaoTeamFilter,
      },
      {
        accessorKey: "responsible_epd.full_name",
        header: "Responsible EPD",
        filterVariant: "multi-select",
        filterSelectOptions: responsibleEpdFilter,
      },
      {
        accessorKey: "work_lead.full_name",
        header: "Work Lead",
        filterVariant: "multi-select",
        filterSelectOptions: workLeadFilter,
      },
      // ...setRoleColumns(),
      // {
      //   //accessorKey: "",
      //   header: "Officer/Analyst",
      //   filterVariant: "multi-select",
      //   //filterSelectOptions: ,
      // },
      // {
      //   //accessorKey: "",
      //   header: "FN CAIRT",
      //   filterVariant: "multi-select",
      //   //filterSelectOptions: ,
      // },
      // {
      //   //accessorKey: "",
      //   header: "Other",
      //   filterVariant: "multi-select",
      //   //filterSelectOptions: ,
      // },
    ],
    [
      setRoleColumns,
      titleFilter,
      eaoTeamFilter,
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
            data={works}
            initialState={{
              sorting: [
                {
                  id: "title",
                  desc: false,
                },
              ],
            }}
            state={{
              isLoading: resultStatus === RESULT_STATUS.LOADING,
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
            // state={{ columnPinning: { right: ["mrt-row-actions"] } }}
          />
        </Grid>
      </EpicTrackPageGridContainer>
    </>
  );
};

export default WorkStaffList;
