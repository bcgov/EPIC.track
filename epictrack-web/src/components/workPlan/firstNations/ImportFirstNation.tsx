import React from "react";
import {
  Box,
  Chip,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Checkbox,
  FormControlLabel,
  Button,
} from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { ListType } from "../../../models/code";
import { WorkplanContext } from "../WorkPlanContext";
import { showNotification } from "../../shared/notificationProvider";
import { COMMON_ERROR_MESSAGE } from "../../../constants/application-constant";
import { ETCaption2, ETParagraph } from "../../shared";
import { Palette } from "../../../styles/theme";
import projectService from "../../../services/projectService/projectService";
import { IconProps } from "../../icons/type";
import Icons from "../../icons";

interface ImportFirstNationsProps {
  onSave: (firstNationIds: number[]) => void;
}

const DeleteIcon: React.FC<IconProps> = Icons["DeleteIcon"];

const ImportFirstNation = (props: ImportFirstNationsProps) => {
  const [workTypes, setWorkTypes] = React.useState<ListType[]>([]);
  const [firstNations, setFirstNations] = React.useState<ListType[]>([]);
  const [workTypeIndex, setWorkTypeIndex] = React.useState<number>(0);
  const [isSelectAllSelected, setIsSelectAllSelected] =
    React.useState<boolean>(false);
  const [selectedFirstNations, setSelectedFirstNations] = React.useState<
    number[]
  >([]);

  const ctx = React.useContext(WorkplanContext);
  const taskContainerRef = React.useRef(null);
  React.useEffect(() => {
    getWorkTypes();
  }, [ctx.work, ctx.selectedWorkPhase]);

  React.useEffect(() => {
    if (workTypes.length > 0) {
      getFirstNations(workTypes[workTypeIndex].id);
    }
  }, [workTypeIndex, workTypes]);

  const methods = useForm({
    mode: "onBlur",
  });

  const { handleSubmit } = methods;

  const onTemplateClickHandler = (index: number) => {
    setWorkTypeIndex(index);
    if (taskContainerRef.current as any) {
      (taskContainerRef.current as any).scrollIntoView({ behavior: "smooth" });
    }
  };

  const getWorkTypes = async () => {
    try {
      const result = await projectService.getWorkTypes(
        Number(ctx.work?.project_id),
        Number(ctx.work?.id)
      );
      if (result.status === 200) {
        const workTypes = (result.data as any[]).filter(
          (p) => p["is_active"] === true
        );
        if (workTypes.length > 0)
          setWorkTypes([
            { name: `All Work Types` },
            ...workTypes,
          ] as ListType[]);
      }
    } catch (e) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
  };

  const getFirstNations = async (workTypeId: number | undefined) => {
    try {
      const result = await projectService.getFirstNations(
        Number(ctx.work?.project_id),
        Number(ctx.work?.id),
        workTypeId
      );
      if (result.status === 200) {
        setFirstNations(result.data as ListType[]);
      }
    } catch (e) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
  };

  const onSubmitHandler = async () => {
    props.onSave(selectedFirstNations);
  };

  const handleNationSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    if (checked) {
      setSelectedFirstNations([
        Number(event.target.value),
        ...selectedFirstNations,
      ]);
    } else {
      const firstNations = selectedFirstNations.filter(
        (id) => id !== Number(event.target.value)
      );
      setSelectedFirstNations(firstNations);
      setIsSelectAllSelected(false);
    }
  };
  const handleNationSelectAll = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setIsSelectAllSelected(checked);
    if (checked) {
      setSelectedFirstNations(firstNations.map((nation) => nation.id));
    } else {
      setSelectedFirstNations([]);
    }
  };

  const onClearSelection = () => {
    setSelectedFirstNations([]);
    setIsSelectAllSelected(false);
  };

  return (
    <>
      <FormProvider {...methods}>
        <Grid
          container
          component={"form"}
          id="import-nations-form"
          sx={{
            height: "350px",
            overflowY: "hidden",
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
              {workTypes.map((item, index) => (
                <ListItemButton
                  key={`template-list-${index}`}
                  selected={workTypeIndex === index}
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
                    <ETParagraph>
                      {item.name === "All Work Types"
                        ? `${item.name} (${workTypes.length - 1})`
                        : item.name}
                    </ETParagraph>
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
            <Box
              sx={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
              <Box
                sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}
              >
                {workTypes.length > 0 && firstNations.length > 0 && (
                  <>
                    <ETParagraph
                      ref={taskContainerRef}
                      sx={{
                        mb: "0.5rem",
                      }}
                      bold
                    >
                      {workTypes[workTypeIndex].name}
                    </ETParagraph>
                    <Box>
                      <ETCaption2
                        sx={{
                          color: Palette.neutral.main,
                        }}
                      >
                        Select Nations to import
                      </ETCaption2>
                      <Chip
                        size="small"
                        sx={{
                          ml: "0.25rem",
                          backgroundColor: Palette.neutral.bg.dark,
                        }}
                        label={selectedFirstNations.length}
                      />
                    </Box>
                  </>
                )}
                {firstNations.length > 0 && (
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="firstNations"
                          value="<ALL>"
                          checked={isSelectAllSelected}
                          onChange={handleNationSelectAll}
                        />
                      }
                      label="Select All"
                      style={{
                        color: isSelectAllSelected
                          ? Palette.primary.accent.main
                          : Palette.neutral.dark,
                      }}
                    />
                  </Box>
                )}
                {firstNations.map((item, index) => (
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="firstNations"
                          value={item.id}
                          checked={selectedFirstNations.includes(item.id)}
                          onChange={handleNationSelect}
                        />
                      }
                      label={item.name}
                      style={{
                        color: selectedFirstNations.includes(item.id)
                          ? Palette.primary.accent.main
                          : Palette.neutral.dark,
                      }}
                    />
                  </Box>
                ))}
              </Box>
              <Box
                sx={{ display: "flex", alignItems: "flex-start", flexGrow: 0 }}
              >
                <Button
                  variant="text"
                  startIcon={<DeleteIcon fill="currentcolor" />}
                  sx={{
                    color: Palette.primary.accent.main,
                    border: "2px solid transparent",
                    paddingLeft: 0,
                    backgroundColor: "transparent",
                  }}
                  onClick={onClearSelection}
                >
                  Clear Selection
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
};

export default ImportFirstNation;
