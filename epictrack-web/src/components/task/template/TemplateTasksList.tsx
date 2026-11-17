import React from "react";
import { MRT_ColumnDef } from "material-react-table";
import { Button, Grid } from "@mui/material";
import { RESULT_STATUS } from "../../../constants/application-constant";
import MasterTrackTable from "../../shared/MasterTrackTable";
import { Task } from "../../../models/task";
import TrackDialog from "../../shared/TrackDialog";
import { TaskTemplate as Template } from "../../../models/template";
import { taskTemplatesApi } from "api/taskTemplates";

const TemplateTaskList = ({ ...props }) => {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [resultStatus, setResultStatus] = React.useState<string>();
  const templateId = props.templateId;
  const [alertContentText, setAlertContentText] = React.useState<string>();
  const [openAlertDialog, setOpenAlertDialog] = React.useState(false);
  const [template, setTemplate] = React.useState<Template>();

  const getTemplateTasks = React.useCallback(
    async (templateId: number | undefined) => {
      setResultStatus(RESULT_STATUS.LOADING);
      try {
        if (templateId === undefined) return;
        setTasks(await taskTemplatesApi.listTasks(templateId));
      } catch (error) {
        console.error("Tasks List: ", error);
      } finally {
        setResultStatus(RESULT_STATUS.LOADED);
      }
    },
    [],
  );
  const getTemplate = React.useCallback(
    async (templateId: number | undefined) => {
      try {
        if (templateId === undefined) return;
        setTemplate(await taskTemplatesApi.get(templateId));
      } catch (error) {
        console.error("Get template: ", error);
      }
    },
    [],
  );

  React.useEffect(() => {
    getTemplateTasks(templateId);
    getTemplate(templateId);
  }, [getTemplateTasks, getTemplate, templateId]);

  const columns = React.useMemo<MRT_ColumnDef<Task>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        sortingFn: "sortFn",
      },
      {
        accessorKey: "start_at",
        header: "Start At",
      },
      {
        accessorKey: "number_of_days",
        header: "Duration",
      },
      {
        accessorKey: "tips",
        header: "Notes",
      },
    ],
    [],
  );

  const handleApproval = async (event: any) => {
    await taskTemplatesApi.setActive(templateId, !template?.is_active);
    setAlertContentText(
      `Template ${template?.is_active ? "Deactivated" : "Activated"}`,
    );
    setOpenAlertDialog(true);
    props.onApproval();
  };

  return (
    <>
      <Grid item xs={12} sx={{ overflowY: "hidden" }}>
        {templateId && (
          <MasterTrackTable
            columns={columns}
            data={tasks}
            enableTopToolbar={false}
            enableBottomToolbar={false}
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
            muiTableContainerProps={{
              sx: {
                overflowY: "auto",
                maxHeight: "700px",
              },
            }}
            muiTableHeadProps={{
              sx: {
                opacity: 100,
              },
            }}
          />
        )}
      </Grid>
      <Grid
        item
        xs={12}
        sx={{
          display: "flex",
          gap: "0.5rem",
          justifyContent: "right",
          marginTop: ".5rem",
          marginLeft: "auto",
          marginRight: 0,
        }}
      >
        <Button variant="outlined" type="reset" onClick={props.onCancel}>
          Cancel
        </Button>
        <Button
          variant="contained"
          type="button"
          onClick={handleApproval}
          color="primary"
        >
          {template?.is_active ? "Deactivate" : "Activate"}
        </Button>
      </Grid>
      <TrackDialog
        open={openAlertDialog}
        dialogTitle={"Success"}
        dialogContentText={alertContentText}
        isActionsRequired
        isCancelRequired={false}
        isOkRequired
        onOk={() => {
          setOpenAlertDialog(false);
          props.onCancel();
        }}
      />
    </>
  );
};

export default TemplateTaskList;
