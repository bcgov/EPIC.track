import React from "react";
import {
  Box,
  Chip,
  Grid,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { ListType } from "../../../models/code";
import templateService from "../../../services/taskService/templateService";
import { WorkplanContext } from "../WorkPlanContext";
import { showNotification } from "../../shared/notificationProvider";
import { COMMON_ERROR_MESSAGE } from "../../../constants/application-constant";
import { ETCaption2, ETParagraph } from "../../shared";
import { Palette } from "../../../styles/theme";

interface ImportTaskEventsProps {
  onSave: (templateId: number) => void;
}

const ImportTaskEvent = (props: ImportTaskEventsProps) => {
  const [templates, setTemplates] = React.useState<ListType[]>([]);
  const [tasks, setTasks] = React.useState<ListType[]>([]);
  const [templateIndex, setTemplateIndex] = React.useState<number>(0);
  const ctx = React.useContext(WorkplanContext);
  const taskContainerRef = React.useRef(null);
  React.useEffect(() => {
    getTemplates();
  }, [ctx.work, ctx.selectedWorkPhase]);

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

  const onTemplateClickHandler = (index: number) => {
    setTemplateIndex(index);
    if (taskContainerRef.current as any) {
      (taskContainerRef.current as any).scrollIntoView({ behavior: "smooth" });
    }
  };

  const getTemplates = async () => {
    try {
      const result = await templateService.getTemplatesByParams(
        Number(ctx.work?.ea_act_id),
        Number(ctx.work?.work_type_id),
        Number(ctx.selectedWorkPhase?.work_phase.phase.id)
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
            height: "350px",
            overflowY: "hidden",
            px: 1,
            py: 1,
          }}
          onSubmit={handleSubmit(onSubmitHandler)}
        >
          <Grid
            item
            xs={6}
            sx={{
              padding: "1.5rem 1.5rem 1.5rem 2rem",
              borderRight: `1px solid ${Palette.neutral.bg.dark}`,
              height: "100%",
              overflowY: "scroll",
              "& ul": {
                padding: 0,
              },
            }}
          >
            <List>
              {templates.map((item, index) => (
                <ListItemButton
                  key={`template-list-${index}`}
                  selected={templateIndex === index}
                  onClick={() => onTemplateClickHandler(index)}
                  sx={{
                    borderRadius: "4px",
                    "&.MuiListItemButton-root": {
                      ":hover": {
                        backgroundColor: Palette.primary.bg.light,
                        color: Palette.primary.accent.main,
                      },
                      "&.Mui-selected": {
                        backgroundColor: Palette.primary.bg.light,
                        color: Palette.primary.accent.main,
                      },
                      "& .MuiListItemText-root": {
                        margin: 0,
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
          <Grid
            item
            xs={6}
            sx={{
              padding: "1.5rem 2rem 1rem 1.5rem",
              backgroundColor: Palette.neutral.bg.light,
              height: "100%",
              overflowY: "scroll",
            }}
          >
            {templates.length > 0 && tasks.length > 0 && (
              <>
                <ETParagraph
                  ref={taskContainerRef}
                  sx={{
                    mb: "0.5rem",
                  }}
                  bold
                >
                  {templates[templateIndex].name}
                </ETParagraph>
                <Box>
                  <ETCaption2
                    sx={{
                      color: Palette.neutral.main,
                    }}
                  >
                    List of Tasks
                  </ETCaption2>
                  <Chip
                    size="small"
                    sx={{
                      ml: "0.25rem",
                      backgroundColor: Palette.neutral.bg.dark,
                    }}
                    label={tasks.length}
                  />
                </Box>
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
