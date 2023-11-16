import React from "react";
import { MRT_ColumnDef } from "material-react-table";
import {
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Box, Button, Chip, Grid, IconButton } from "@mui/material";
import { RESULT_STATUS } from "../../../constants/application-constant";
import TemplateForm from "./TemplateForm";
import { Template } from "../../../models/template";
import MasterTrackTable from "../../shared/MasterTrackTable";
import TrackDialog from "../../shared/TrackDialog";
import { ETGridTitle, ETPageContainer } from "../../shared";
import TemplateTaskList from "./TemplateTasksList";
import { ActiveChip, InactiveChip } from "../../shared/chip/ETChip";
import templateService from "../../../services/taskService/templateService";
import { getSelectFilterOptions } from "../../shared/MasterTrackTable/utils";
import TableFilter from "../../shared/filterSelect/TableFilter";

const TemplateList = () => {
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [resultStatus, setResultStatus] = React.useState<string>();
  const [templateId, setTemplateId] = React.useState<number>();
  const [deleteTemplateId, setDeleteTemplateId] = React.useState<number>();
  const [showCreateDialog, setShowCreateDialog] =
    React.useState<boolean>(false);
  const [showDetailsDialog, setShowDetailsDialog] =
    React.useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] =
    React.useState<boolean>(false);
  const [eaActs, setEAActs] = React.useState<string[]>([]);
  const [phases, setPhases] = React.useState<string[]>([]);
  const [workTypes, setWorkTypes] = React.useState<string[]>([]);

  const titleSuffix = "Task Template Details";
  const onDialogClose = (event: any = undefined, reason: any = undefined) => {
    if (reason && reason == "backdropClick") return;
    setShowCreateDialog(false);
    setShowDetailsDialog(false);
    setTemplateId(undefined);
    getTemplates();
  };
  const onViewDetails = (id: number) => {
    setTemplateId(id);
    setShowDetailsDialog(true);
  };
  const getTemplates = React.useCallback(async () => {
    setResultStatus(RESULT_STATUS.LOADING);
    try {
      const templateResult = await templateService.getTemplates();
      if (templateResult.status === 200) {
        setTemplates(templateResult.data as never);
      }
    } catch (error) {
      console.error("Template List: ", error);
    } finally {
      setResultStatus(RESULT_STATUS.LOADED);
    }
  }, []);

  React.useEffect(() => {
    getTemplates();
  }, []);

  React.useEffect(() => {
    const eaActs = templates
      .map((t) => t.ea_act.name)
      .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
    setEAActs(eaActs);
    const phases = templates
      .map((t) => t.phase.name)
      .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
    setPhases(phases);
    const workTypes = templates
      .map((t) => t.work_type.name)
      .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
    setWorkTypes(workTypes);
  }, [templates]);

  const statuses = getSelectFilterOptions(
    templates,
    "is_active",
    (value) => (value ? "Active" : "Inactive"),
    (value) => value
  );

  const handleDelete = (id: number) => {
    setShowDeleteDialog(true);
    setDeleteTemplateId(id);
  };

  const deleteTemplate = async (templateId?: number) => {
    const result = await templateService.deleteTemplate(templateId);
    if (result.status === 200) {
      setDeleteTemplateId(undefined);
      setShowDeleteDialog(false);
      getTemplates();
    }
  };

  const columns = React.useMemo<MRT_ColumnDef<Template>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        Cell: ({ cell, row }) => (
          <ETGridTitle to={"#"} onClick={() => onViewDetails(row.original.id)}>
            {cell.getValue<string>()}
          </ETGridTitle>
        ),
        sortingFn: "sortFn",
      },
      {
        accessorKey: "ea_act.name",
        filterVariant: "multi-select",
        header: "EA Act",
        filterSelectOptions: eaActs,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="rolesFilter"
            />
          );
        },
      },
      {
        accessorKey: "work_type.name",
        filterVariant: "multi-select",
        header: "Work Type",
        filterSelectOptions: workTypes,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="rolesFilter"
            />
          );
        },
      },
      {
        accessorKey: "phase.name",
        header: "Phase",
        filterVariant: "multi-select",
        filterSelectOptions: phases,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="rolesFilter"
            />
          );
        },
      },
      {
        accessorKey: "is_active",
        size: 80,
        header: "Status",
        filterVariant: "multi-select",
        filterSelectOptions: statuses,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="rolesFilter"
            />
          );
        },
        filterFn: (row, id, filterValue) => {
          if (
            !filterValue.length ||
            filterValue.length > statuses.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id);

          return filterValue.includes(value);
        },
        Cell: ({ cell }) => (
          <span>
            {cell.getValue<boolean>() && (
              <ActiveChip label="Active" color="primary" />
            )}
            {!cell.getValue<boolean>() && (
              <InactiveChip label="Inactive" color="error" />
            )}
          </span>
        ),
      },
    ],
    [eaActs]
  );

  return (
    <>
      <ETPageContainer
        direction="row"
        container
        columnSpacing={2}
        rowSpacing={3}
      >
        <Grid item xs={12}>
          <MasterTrackTable
            columns={columns}
            data={templates}
            initialState={{
              sorting: [
                {
                  id: "name",
                  desc: false,
                },
              ],
            }}
            state={{
              isLoading: resultStatus === RESULT_STATUS.LOADING,
              showGlobalFilter: true,
            }}
            enableRowActions={true}
            renderRowActions={({ row }: any) => (
              <Box>
                <IconButton onClick={() => handleDelete(row.original.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
            renderTopToolbarCustomActions={() => (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "right",
                }}
              >
                <Button
                  onClick={() => {
                    setShowCreateDialog(true);
                    setTemplateId(undefined);
                  }}
                  variant="contained"
                >
                  Create Task Template
                </Button>
              </Box>
            )}
          />
        </Grid>
      </ETPageContainer>
      <TrackDialog
        open={showCreateDialog}
        dialogTitle={(templateId ? "Update " : "Create ") + titleSuffix}
        onClose={(event, reason) => onDialogClose(event, reason)}
        disableEscapeKeyDown
        fullWidth
        maxWidth="md"
        formId="template-form"
        okButtonText="Save"
        cancelButtonText="Cancel"
        onCancel={() => onDialogClose()}
        isActionsRequired
      >
        <TemplateForm templateId={templateId} onSubmitSuccess={onDialogClose} />
      </TrackDialog>
      <TrackDialog
        open={showDetailsDialog}
        dialogTitle="Template Tasks"
        onClose={(event, reason) => onDialogClose(event, reason)}
        disableEscapeKeyDown
        fullWidth
        maxWidth="md"
      >
        <TemplateTaskList
          onCancel={onDialogClose}
          templateId={templateId}
          onApproval={getTemplates}
        />
      </TrackDialog>
      <TrackDialog
        open={showDeleteDialog}
        dialogTitle="Delete"
        dialogContentText="Are you sure you want to delete?"
        okButtonText="Yes"
        cancelButtonText="No"
        isActionsRequired
        onCancel={() => setShowDeleteDialog(!showDeleteDialog)}
        onOk={() => deleteTemplate(deleteTemplateId)}
      />
    </>
  );
};

export default TemplateList;
