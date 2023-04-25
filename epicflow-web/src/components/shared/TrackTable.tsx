import React from 'react';
import MaterialReactTable, { MRT_ColumnDef, MRT_ToggleFiltersButton } from 'material-react-table';

interface Props<T extends Record<string, any>> {
  columns: MRT_ColumnDef<T>[],
  data: T[],
  [x: string]: any
}

const TrackTable = <T extends Record<string, any>>({ columns, data, ...rest }: Props<T>) => {
  return (
    <>
      <MaterialReactTable
        columns={columns}
        data={data}
        enableHiding={false}
        enableStickyHeader={true}
        enableDensityToggle={false}
        initialState={{
          density: 'compact'
        }}
        positionGlobalFilter='left'
        muiSearchTextFieldProps={{
          placeholder: 'Search',
          sx: { minWidth: '300px' },
          variant: 'outlined',
        }}
        state={
          {
            showGlobalFilter: true
          }
        }
        renderToolbarInternalActions={({ table }) => (
          <>
            <MRT_ToggleFiltersButton table={table} />
          </>
        )}
        {...rest}
      />
    </>
  )
}

export default TrackTable;