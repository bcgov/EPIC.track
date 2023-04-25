import React from 'react';
import StaffService from '../../../services/staffService';
import MaterialReactTable, { MRT_ColumnDef } from 'material-react-table';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import { Staff } from '../../../models/staff';
import TrackTable from '../../shared/TrackTable';

export default function StaffList() {
  const [staffs, setStaffs] = React.useState<Staff[]>([]);
  console.log(staffs);
  const getStaff = React.useCallback(async () => {
    const staffResult = await StaffService.getStaffs();
    if (staffResult.status === 200) {
      setStaffs((staffResult.data as never)['staffs']);
    }

  }, []);
  React.useEffect(() => {
    getStaff();
  }), [];

  const columns = React.useMemo<MRT_ColumnDef<Staff>[]>(
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
        header: 'Position'
      },
      {
        accessorKey: 'is_active',
        header: 'Active',
        Cell: ({ cell }) => (
          <span>
            {cell.getValue<Staff>().is_active}
            {cell.getValue<Staff>().is_active && <ToggleOffIcon />}
            {!cell.getValue<Staff>().is_active && <ToggleOnIcon/>}
          </span>
        ),
      }
    ], []
  )
  return (
    <>
      <TrackTable
        columns={columns}
        data={staffs}
      />
    </>
  );
}