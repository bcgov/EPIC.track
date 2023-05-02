import { Edit, Delete } from "@mui/icons-material";
import { Box, Button, Tooltip, IconButton } from "@mui/material";
import MaterialReactTable from "material-react-table";
import { useState, useCallback, useMemo, useEffect } from "react";
import { RESULT_STATUS } from "../../../constants/application-constant";
import IndegenousNationService from "../../../services/indegenousNationService";

export default function IndegenousNationList() {
  const [positions, setPositions] = useState<any[]>([]);
  const [resultStatus, setResultStatus] = useState<string>();

  const setMonthColumns = useCallback(() => {
    let columns = [];
    if (positions && positions.length > 0) {
      columns = positions[0].months.map((rfMonth: any, index: number) => {
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
  }, [positions]);

  const filterFn = useCallback((filterField: string) => positions
    .filter(p => p[filterField])
    .map(p => p[filterField])
    .filter((ele, index, arr) => arr.findIndex(t => t === ele) === index), [positions])

  const name = filterFn('name');
  const responsible_epd_id = filterFn('responsible_epd_id');
  const is_active = filterFn('is_active');
  const id = filterFn('id');

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        enableHiding: false,
        filterSelectOptions: id
      },
      {
        accessorKey: 'name',
        header: 'Name',
        enableHiding: false,
        filterSelectOptions: name
      },
      {
        accessorKey: 'responsible_epd_id',
        header: 'Responsible EPD ID',
        filterSelectOptions: responsible_epd_id
      },
      {
        accessorKey: 'is_active',
        header: 'Is Active',
        filterSelectOptions: is_active
      }
    ], [setMonthColumns]
  );


  const getPosition = async () => {
    const positionResult = await IndegenousNationService.getIndegenousNation;
    setResultStatus(RESULT_STATUS.LOADED);
    if (positionResult.status === 200) {
      setPositions((positionResult.data as never)['positions']);
    }
  }

  const handleDeleteRow = async (row: { index: any; }) => {
    const projectResult = await IndegenousNationService.getIndegenousNation(row.index);
    setResultStatus(RESULT_STATUS.LOADED);
    if (projectResult.status === 200) {
      setResultStatus('Delete Successful');
    }
  }

  useEffect(() => {
    getPosition();
  });

  return (
    <>
      <Button href="/indegenousNation">
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
        data={positions}
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