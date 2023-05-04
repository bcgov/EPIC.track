import React from "react";
import {
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Box, Button, IconButton, Grid, Chip } from "@mui/material";
import { MRT_ColumnDef } from "material-react-table";
import { useState, useCallback, useMemo, useEffect } from "react";
import { RESULT_STATUS } from '../../constants/application-constant';
import IndigenousNationService from "../../services/indigenousNationService";
import { IndigenousNation } from "../../models/indigenousNation";
import MasterTrackTable from "../shared/MasterTrackTable";
import { EpicTrackPageGridContainer } from "../shared";
import TrackDialog from "../shared/TrackDialog";
import IndigenousNationForm from "./IndigneousNationForm";
import { Staff } from "../../models/staff";
import StaffService from "../../services/staffService";

export default function IndigenousNationList() {
  const [resultStatus, setResultStatus] = useState<string>();
  const [indigenousNations, setIndigenousNations] = useState<IndigenousNation[]>([])
  const [indigenousNationID, setIndigenousNationID] = useState<number>()
  const [showDialog, setShowDialog] = React.useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState<boolean>(false);
  const titleSuffix = 'Indigeneous Nation Details';
  const [staffs, setStaffs] = React.useState<Staff[]>([]);


  const columns = useMemo<MRT_ColumnDef<IndigenousNation>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'responsible_epd.full_name',
        header: 'Responsible EPD',
        filterSelectOptions: staffs.map(s => s.full_name)
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
    ], [staffs]
  );

  const onDialogClose = (event: any, reason: any) => {
    if (reason && reason == 'backdropClick')
      return;
    setIndigenousNationID(undefined);
    setShowDialog(false);
  }
  const onEdit = (id: number) => {
    setIndigenousNationID(id);
    setShowDialog(true);
  }

  const handleDelete = (id: number) => {
    setShowDeleteDialog(true);
    setIndigenousNationID(id);
  }

  const getStaffs = async () => {
    const staffsResult = await StaffService.getStaffs();
    if (staffsResult.status === 200) {
      setStaffs((staffsResult.data as never)['staffs']);
    }
  }
  useEffect(() => {
    getStaffs();
  }, []);

  const getIndigenousNations = useCallback(async () => {
    setResultStatus(RESULT_STATUS.LOADING)
    try {
      const indigenousNationsResult = await IndigenousNationService.getIndigenousNations();
      if (indigenousNationsResult.status === 200) {
        setIndigenousNations((indigenousNationsResult.data as never)['indigenous_nations']);
      }
    } catch (error) {
      console.error('Staff List: ', error);
    } finally {
      setResultStatus(RESULT_STATUS.LOADED);
    }
  }, []);

  const deleteIndigenousNation = async (id?: number) => {
    const result = await IndigenousNationService.deleteIndigenousNation(id);
    if (result.status === 200) {
      setIndigenousNationID(undefined);
      setShowDeleteDialog(false);
      getIndigenousNations();
    }
  }

  useEffect(() => {
    getIndigenousNations();
  }, [getIndigenousNations]);

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
            data={indigenousNations}
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
                  Create Indigenous Nation
                </Button>
              </Box>
            )}
          />
        </Grid>
      </EpicTrackPageGridContainer>
      <TrackDialog
        open={showDialog}
        dialogTitle={(indigenousNationID ? 'Update ' : 'Create ') + titleSuffix}
        onClose={(event, reason) => onDialogClose(event, reason)}
        disableEscapeKeyDown
        fullWidth
        maxWidth='md'
      >
        <IndigenousNationForm
          onCancel={onDialogClose}
          indigenousNationID={indigenousNationID}
          onSubmitSucces={getIndigenousNations}
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
        onOk={() => deleteIndigenousNation(indigenousNationID)}
      />
    </>
  );
}
