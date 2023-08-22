import React from "react";
import {
  Box,
  Chip,
  Grid,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { makeStyles } from "@mui/styles";
import { ListType } from "../../../models/code";
import templateService from "../../../services/taskService/templateService";
import { WorkplanContext } from "../WorkPlanContext";
import { showNotification } from "../../shared/notificationProvider";
import { COMMON_ERROR_MESSAGE } from "../../../constants/application-constant";
import { ETCaption1, ETCaption2, ETParagraph } from "../../shared";
import { Palette } from "../../../styles/theme";
import taskEventService from "../../../services/taskEventService/taskEventService";
import { getAxiosError } from "../../../utils/axiosUtils";
const useStyle = makeStyles({
  templateContainer: {
    padding: "1.5rem 1.5rem 1.5rem 2rem",
    borderRight: `1px solid ${Palette.neutral.bg.dark}`,
  },
  templateItem: {
    padding: "0.5rem 1rem",
    color: Palette.neutral.dark,
    cursor: "pointer",
  },
  taskContainer: {
    padding: "1.5rem 2rem 1rem 1.5rem",
    backgroundColor: Palette.neutral.bg.light,
  },
});

interface ImportTaskEventsProps {
  onSave: (templateId: number) => void;
}

const ImportTaskEvent = (props: ImportTaskEventsProps) => {
  const [templates, setTemplates] = React.useState<ListType[]>([]);
  const [tasks, setTasks] = React.useState<ListType[]>([]);
  const [templateIndex, setTemplateIndex] = React.useState<number>(0);
  const ctx = React.useContext(WorkplanContext);
  const classes = useStyle();
  React.useEffect(() => {
    getTemplates();
  }, [ctx.work, ctx.selectedPhase]);

  React.useEffect(() => {
    if (templates.length > 0) {
      getTemplateTasks(templates[templateIndex].id);
    }
  }, [templateIndex, templates]);

  const methods = useForm({
    mode: "onBlur",
  });

  const { handleSubmit } = methods;

  const selectedTemplateId = React.useMemo<number>(
    () => (templates.length > 0 ? templates[templateIndex].id : 0),
    [templates, templateIndex]
  );

  const getTemplates = async () => {
    try {
      const result = await templateService.getTemplatesByParams(
        Number(ctx.work?.ea_act_id),
        Number(ctx.work?.work_type_id),
        Number(ctx.selectedPhase?.phase_id)
      );
      if (result.status === 200) {
        const templatesData = (result.data as any[]).filter(
          (p) => p["is_active"] === true
        );
        setTemplates(templatesData as ListType[]);
      }
    } catch (e) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
  };

  const getTemplateTasks = async (templateId: number) => {
    try {
      const result = await templateService.getTemplateTasks(templateId);
      if (result.status === 200) {
        setTasks(result.data as ListType[]);
      }
    } catch (e) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
  };

  const onSubmitHandler = async () => {
    props.onSave(selectedTemplateId);
  };
  return (
    <>
      <FormProvider {...methods}>
        <Grid
          container
          component={"form"}
          id="import-tasks-form"
          sx={{
            borderBottom: `1px solid ${Palette.neutral.bg.dark}`,
          }}
          onSubmit={handleSubmit(onSubmitHandler)}
        >
          <Grid item xs={6} className={classes.templateContainer}>
            <List>
              {templates.map((item, index) => (
                <ListItemButton
                  key={`template-list-${index}`}
                  selected={templateIndex === index}
                  onClick={() => setTemplateIndex(index)}
                  sx={{
                    "&.MuiListItemButton-root": {
                      ":hover": {
                        backgroundColor: Palette.primary.bg.light,
                        color: Palette.primary.accent.main,
                      },
                      "&.Mui-selected": {
                        backgroundColor: Palette.primary.bg.light,
                        color: Palette.primary.accent.main,
                      },
                    },
                  }}
                >
                  <ListItemText>
                    <ETParagraph>{item.name}</ETParagraph>
                  </ListItemText>
                </ListItemButton>
              ))}
            </List>
          </Grid>
          <Grid item xs={6} className={classes.taskContainer}>
            {templates.length > 0 && tasks.length > 0 && (
              <>
                <ETParagraph
                  sx={{
                    mb: "0.5rem",
                  }}
                  bold
                >
                  {templates[templateIndex].name}
                </ETParagraph>
                <ETCaption2
                  sx={{
                    color: Palette.neutral.main,
                  }}
                >
                  List of Tasks
                  <Chip
                    sx={{
                      ml: "0.25rem",
                      backgroundColor: Palette.neutral.bg.dark,
                      fontSize: "13px",
                      padding: "2px 8px",
                      borderRadius: "-4px",
                      height: "auto",
                    }}
                    label={tasks.length}
                  />
                </ETCaption2>
              </>
            )}
            {tasks.map((item, index) => (
              <Box>
                <ETParagraph
                  sx={{
                    mb: "1rem",
                    mt: "1rem",
                  }}
                >
                  {index + 1}. {item.name}
                </ETParagraph>
              </Box>
            ))}
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
};

export default ImportTaskEvent;
