import {
  Button, Box, IconButton, Tooltip,
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RESULT_STATUS } from '../../../constants/application-constant';
import MaterialReactTable from 'material-react-table';
import { Delete, Edit } from '@mui/icons-material';
import ProjectService from '../../../services/projectService';


export default function ProjectList() {
  const [projects, setProjects] = useState<any[]>([]);
  const [resultStatus, setResultStatus] = useState<string>();

  const setMonthColumns = useCallback(() => {
    let columns = [];
    if (projects && projects.length > 0) {
      columns = projects[0].months.map((rfMonth: any, index: number) => {
        return {
          header: rfMonth['label'],
          accessorFn: (row: any) => `${row.months[index].phase}`,
          enableHiding: false,
          enableColumnFilter: false,
          Cell: ({ row }: any) => (
            <Box sx={{
              bgcolor: row.original.months[index].color,
              display: 'flex',
              flexWrap: 'wrap',
              alignContent: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }
            }>
              {row.original.months[index].phase}
            </Box>
          )
        }
      })
    }
    return columns;
  }, [projects]);

  const filterFn = useCallback((filterField: string) => projects
    .filter(p => p[filterField])
    .map(p => p[filterField])
    .filter((ele, index, arr) => arr.findIndex(t => t === ele) === index), [projects])

  const name = filterFn('name');
  const location = filterFn('location');
  const is_project_closed = filterFn('is_project_closed');
  const capital_investment = filterFn('capital_investment');
  const region_env = filterFn(' region_env');
  const region_flnro = filterFn('region_flnro');
  const id = filterFn('id');

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Project ID',
        enableHiding: false,
        filterSelectOptions: id
      },
      {
        accessorKey: 'name',
        header: 'Project Name',
        enableHiding: false,
        filterSelectOptions: name
      },
      {
        accessorKey: 'location',
        header: 'Location',
        filterSelectOptions: location
      },
      {
        accessorKey: 'capital_investment',
        header: 'Capital Investment',
        filterSelectOptions: capital_investment
      },
      {
        accessorKey: 'region_env.name',
        header: 'ENV Region',
        filterSelectOptions: region_env
      },
      {
        accessorKey: 'region_flnro.name',
        header: 'FLNR Region',
        filterSelectOptions: region_flnro
      },
      {
        accessorKey: 'is_project_closed',
        header: 'Is Project Closed',
        filterSelectOptions: is_project_closed
      }
    ], [setMonthColumns]
  );


  const getProject = async () => {
    const projectResult = await ProjectService.getProjects();
    setResultStatus(RESULT_STATUS.LOADED);
    if (projectResult.status === 200) {
      setProjects((projectResult.data as never)['projects']);

    }
  }

  const handleDeleteRow = async (row: { index: any; }) => {
    const projectResult = await ProjectService.deleteProjects(row.index);
    setResultStatus(RESULT_STATUS.LOADED);
    if (projectResult.status === 200) {
      setResultStatus('Delete Successful');
    }
  }

  useEffect(() => {
    getProject();
  });

  return (
    <>
      <Button href="/project">
        Add Project
      </Button>
      <MaterialReactTable
        initialState={{
          density: 'compact'
        }}
        columns={columns}
        enableDensityToggle={false}
        enableStickyHeader={true}
        state={{
          isLoading: resultStatus === RESULT_STATUS.LOADING
        }}
        data={projects}
        editingMode="modal" //default
        enableColumnOrdering
        enableEditing
        renderRowActions={({ row, table }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip arrow placement="left" title="Edit">
              <IconButton onClick={() => table.setEditingRow(row)} color="primary">
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip arrow placement="right" title="Delete">
              <IconButton color="error" onClick={() => handleDeleteRow(row)}>
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        )} />
    </>
  );
}