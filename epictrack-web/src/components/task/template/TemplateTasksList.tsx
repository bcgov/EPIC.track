import React from "react";
import { MRT_ColumnDef } from "material-react-table";
import { Button, Grid } from "@mui/material";
import { RESULT_STATUS } from "../../../constants/application-constant";
import MasterTrackTable from "../../shared/MasterTrackTable";
import { Task } from "../../../models/task";
import TrackDialog from "../../shared/TrackDialog";
import { Template } from "../../../models/template";
import templateService from "../../../services/taskService/templateService";

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
        const taskResult = await templateService.getTemplateTasks(templateId);
        if (taskResult.status === 200) {
          setTasks(taskResult.data as never);
        }
      } catch (error) {
        console.error("Tasks List: ", error);
      } finally {
        setResultStatus(RESULT_STATUS.LOADED);
      }
    },
    [templateId]
  );
  const getTemplate = React.useCallback(
    async (templateId: number | undefined) => {
      try {
        if (templateId === undefined) return;
        const templateResult = await templateService.getTemplate(templateId);
        if (templateResult.status === 200) {
          setTemplate(templateResult.data as never);
        }
      } catch (error) {
        console.error("Get template: ", error);
      }
    },
    [templateId]
  );

  React.useEffect(() => {
    getTemplateTasks(templateId);
    getTemplate(templateId);
  }, [templateId]);

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
        header: "Tips",
      },
    ],
    []
  );

  const handleApproval = async (event: any) => {
    const result = await templateService.patchTemplate(templateId, {
      is_active: !template?.is_active,
    });
    if (result.status === 200) {
      setAlertContentText(
        `Template ${template?.is_active ? "Deactivated" : "Activated"}`
      );
      setOpenAlertDialog(true);
      props.onApproval();
    }
  };

  return (
    <>
      <Grid item xs={12}>
        {templateId && (
          <MasterTrackTable
            columns={columns}
            data={tasks}
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
        }}
      >
        <Button variant="outlined" type="reset" onClick={props.onCancel}>
          Cancel
        </Button>
        <Button
          variant="outlined"
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
