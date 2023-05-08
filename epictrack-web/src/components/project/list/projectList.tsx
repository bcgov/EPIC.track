import React from 'react';
import { MRT_ColumnDef } from 'material-react-table';
import {
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import {
  Box, Button, Chip, Grid, IconButton, Tooltip
} from '@mui/material';
import { RESULT_STATUS } from '../../constants/application-constant';
import ProjectForm from './ProjectForm';
import { Project} from '../../models/project';
import ProjectService from '../../../services/projectService';
import MasterTrackTable from '../shared/MasterTrackTable';
import TrackDialog from '../shared/TrackDialog';
import codeService from '../../services/codeService';
import { EpicTrackPageGridContainer } from '../shared';

const ProjectList = () => {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [resultStatus, setResultStatus] = React.useState<string>();
  const [projectId,setProjectId] = React.useState<number>();
  const [deleteProjectId, setDeleteProjectId] = React.useState<number>();
  const [showDialog, setShowDialog] = React.useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState<boolean>(false);
  //const [positions, setPositions] = React.useState<Position[]>([]);

  const titleSuffix = 'Project Details';
  const onDialogClose = (event: any, reason: any) => {
    if (reason && reason == 'backdropClick')
      return;
      setProjectId(undefined);
    setShowDialog(false);
  }
  const onEdit = (id: number) => {
    setProjectId(id);
    setShowDialog(true);
  }
  const getProject = React.useCallback(async () => {
    setResultStatus(RESULT_STATUS.LOADING)
    try {
      const projectResult = await ProjectService.getProjects();
      if (projectResult.status === 200) {
        setProjects((projectResult.data as never)['projects']);
      }
    } catch (error) {
      console.error('Staff List: ', error);
    } finally {
      setResultStatus(RESULT_STATUS.LOADED);
    }
  }, []);

  React.useEffect(() => {
    getProject();
  }, [getProject]);

  // const getPositions = async () => {
  //   const positionResult = await codeService.getCodes('positions');
  //   if (positionResult.status === 200) {
  //     setPositions((positionResult.data as never)['codes']);
  //   }
  // }
  // React.useEffect(() => {
  //   getPositions();
  // }, []);

  const handleDelete = (id: number) => {
    setShowDeleteDialog(true);
    setDeleteProjectId(id);
  }

  const deleteProject = async (id?: number) => {
    const result = await ProjectService.deleteProjects(id);
    if (result.status === 200) {
      setDeleteProjectId(undefined);
      setShowDeleteDialog(false);
      getProject();
    }
  }

  const columns = React.useMemo<MRT_ColumnDef<Project>[]>(
    () => [
      {
        accessorKey: 'full_name',
        header: 'Name'
      },
      {
        accessorKey: 'phone',
        header: 'Phone Number'
      },
      {
        accessorKey: 'email',
        header: 'Email'
      },
      {
        accessorKey: 'position.name',
        header: 'Position',
        filterVariant: 'multi-select',
        filterSelectOptions: positions.map(p => p.name)
      },
      {
        accessorKey: 'is_active',
        header: 'Active',
        filterVariant: 'checkbox',
        Cell: ({ cell }) => (
          <span>
            {cell.getValue<boolean>() && <Chip label='Active' color='primary' />}
            {!cell.getValue<boolean>() && <Chip label='Inactive' color='error' />}
          </span>
        ),
      }
    ], [positions]
  )
  return (
    <>
      <EpicTrackPageGridContainer
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
        container
        columnSpacing={2}
        rowSpacing={3}
      >
        <Grid item xs={12}>
          <MasterTrackTable
            columns={columns}
            data={projects}
            state={{
              isLoading: resultStatus === RESULT_STATUS.LOADING,
              showGlobalFilter: true
            }}
            enableRowActions={true}
            renderRowActions={({ row }: any) => (
              <Box>
                <IconButton onClick={() => onEdit(row.original.id)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(row.original.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
            renderTopToolbarCustomActions={() => (
              <Box sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'right'
              }}>
                <Button
                  onClick={() => {
                    setShowDialog(true);
                  }}
                  variant="contained"
                >
                  Create Project
                </Button>
              </Box>
            )}
          />
        </Grid>
      </EpicTrackPageGridContainer>
      <TrackDialog
        open={showDialog}
        dialogTitle={(projectId ? 'Update ' : 'Create ') + titleSuffix}
        onClose={(event: any, reason: any) => onDialogClose(event, reason)}
        disableEscapeKeyDown
        fullWidth
        maxWidth='md'
      >
        <ProjectForm
          onCancel={onDialogClose}
          project_id={projectId}
          onSubmitSucces={getProject}
        />
      </TrackDialog>
      <TrackDialog
        open={showDeleteDialog}
        dialogTitle='Delete'
        dialogContentText='Are you sure you want to delete?'
        okButtonText='Yes'
        cancelButtonText='No'
        isActionsRequired
        onCancel={() => setShowDeleteDialog(!showDeleteDialog)}
        onOk={() => deleteProject(deleteProjectId)}
      />
    </>
  );
}

export default ProjectList;











  
  


















// export default function ProjectList() {

//   const setMonthColumns = useCallback(() => {
//     let columns = [];
//     if (projects && projects.length > 0) {
//       columns = projects[0].months.map((rfMonth: any, index: number) => {
//         return {
//           header: rfMonth['label'],
//           accessorFn: (row: any) => `${row.months[index].phase}`,
//           enableHiding: false,
//           enableColumnFilter: false,
//           Cell: ({ row }: any) => (
//             <Box sx={{
//               bgcolor: row.original.months[index].color,
//               display: 'flex',
//               flexWrap: 'wrap',
//               alignContent: 'center',
//               justifyContent: 'center',
//               padding: '1rem'
//             }
//             }>
//               {row.original.months[index].phase}
//             </Box>
//           )
//         }
//       })
//     }
//     return columns;
//   }, [projects]);

  const filterFn = useCallback(
    (filterField: string) =>
      projects
        .filter((p) => p[filterField])
        .map((p) => p[filterField])
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [projects]
  );

  const name = filterFn("name");
  const location = filterFn("location");
  const is_project_closed = filterFn("is_project_closed");
  const capital_investment = filterFn("capital_investment");
  const region_env = filterFn(" region_env");
  const region_flnro = filterFn("region_flnro");
  const id = filterFn("id");

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Project ID",
        enableHiding: false,
        filterSelectOptions: id,
      },
      {
        accessorKey: "name",
        header: "Project Name",
        enableHiding: false,
        filterSelectOptions: name,
      },
      {
        accessorKey: "location",
        header: "Location",
        filterSelectOptions: location,
      },
      {
        accessorKey: "capital_investment",
        header: "Capital Investment",
        filterSelectOptions: capital_investment,
      },
      {
        accessorKey: "region_env.name",
        header: "ENV Region",
        filterSelectOptions: region_env,
      },
      {
        accessorKey: "region_flnro.name",
        header: "FLNR Region",
        filterSelectOptions: region_flnro,
      },
      {
        accessorKey: "is_project_closed",
        header: "Is Project Closed",
        filterSelectOptions: is_project_closed,
      },
    ],
    [setMonthColumns]
  );

  const getProject = async () => {
    const projectResult = await ProjectService.getProjects();
    setResultStatus(RESULT_STATUS.LOADED);
    if (projectResult.status === 200) {
      setProjects((projectResult.data as never)["projects"]);
    }
  };

  const handleDeleteRow = async (row: { index: any }) => {
    const projectResult = await ProjectService.deleteProjects(row.index);
    setResultStatus(RESULT_STATUS.LOADED);
    if (projectResult.status === 200) {
      setResultStatus("Delete Successful");
    }
  };

  useEffect(() => {
    getProject();
  });

  return (
    <>
      <Button href="/project">Add Project</Button>
      <MaterialReactTable
        initialState={{
          density: "compact",
        }}
        columns={columns}
        enableDensityToggle={false}
        enableStickyHeader={true}
        state={{
          isLoading: resultStatus === RESULT_STATUS.LOADING,
        }}
        data={projects}
        editingMode="modal" //default
        enableColumnOrdering
        enableEditing
        renderRowActions={({ row, table }) => (
          <Box sx={{ display: "flex", gap: "1rem" }}>
            <Tooltip arrow placement="left" title="Edit">
              <IconButton
                onClick={() => table.setEditingRow(row)}
                color="primary"
              >
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip arrow placement="right" title="Delete">
              <IconButton color="error" onClick={() => handleDeleteRow(row)}>
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      />
    </>
  );
}
