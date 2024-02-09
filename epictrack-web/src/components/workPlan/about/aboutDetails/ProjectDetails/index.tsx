import { Button, Divider, Grid } from "@mui/material";
import { useContext, useState } from "react";
import { WorkplanContext } from "../../../WorkPlanContext";
import { ETCaption1, ETParagraph, GrayBox } from "../../../../shared";
import { Palette } from "../../../../../styles/theme";
import {
  MONTH_DAY_YEAR,
  ROLES,
} from "../../../../../constants/application-constant";
import dayjs from "dayjs";
import icons from "components/icons";
import { IconProps } from "components/icons/type";
import { showNotification } from "components/shared/notificationProvider";
import ProjectDetailsSkeleton from "./Skeleton";
import { ProjectDialog } from "components/project/Dialog";
import { useAppSelector } from "hooks";
import { Restricted } from "components/shared/restricted";

const ProjectDetails = () => {
  const PencilEditIcon: React.FC<IconProps> = icons["PencilEditIcon"];

  const { work, getWorkById, team } = useContext(WorkplanContext);
  const { email } = useAppSelector((state) => state.user.userDetail);
  const isTeamMember = team?.find((member) => member.staff.email === email);

  const [loadingWork, setLoadingWork] = useState(false);
  const [openProjectDialog, setOpenProjectDialog] = useState(false);

  const handleReloadWork = async () => {
    try {
      setLoadingWork(true);
      await getWorkById();
      setLoadingWork(false);
    } catch (error) {
      setLoadingWork(false);
      showNotification("Couldn't reload project details", { type: "error" });
    }
  };

  if (!work) return null;

  if (loadingWork) return <ProjectDetailsSkeleton />;

  return (
    <>
      <GrayBox>
        <Grid container spacing={1}>
          <Grid
            item
            xs={12}
            container
            justifyContent="space-between"
            alignItems={"center"}
          >
            <Grid item xs={6} container>
              <Grid item xs={12}>
                <ETCaption1 color={Palette.neutral.main}>
                  PROJECT CREATION DATE
                </ETCaption1>
              </Grid>
              <Grid item xs={12}>
                <ETParagraph color={Palette.neutral.dark}>
                  {dayjs(work?.project?.created_at).format(MONTH_DAY_YEAR)}
                </ETParagraph>
              </Grid>
            </Grid>
            <Grid item>
              <Restricted
                allowed={[ROLES.EDIT]}
                exception={Boolean(isTeamMember)}
                errorProps={{
                  disabled: true,
                }}
              >
                <Button
                  variant="text"
                  startIcon={<PencilEditIcon />}
                  sx={{
                    backgroundColor: "transparent",
                    borderColor: "transparent",
                  }}
                  onClick={() => setOpenProjectDialog(true)}
                >
                  Edit
                </Button>
              </Restricted>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Divider style={{ width: "100%", paddingTop: "8px" }} />
          </Grid>
          <Grid item xs={12}>
            <ETCaption1 bold color={Palette.primary.main}>
              PROPONENT
            </ETCaption1>
          </Grid>
          <Grid item xs={12}>
            <ETParagraph color={Palette.neutral.dark}>
              {work?.project?.proponent?.name}
            </ETParagraph>
          </Grid>
          <Grid item xs={12}>
            <ETCaption1 bold color={Palette.primary.main}>
              PROJECT DESCRIPTION
            </ETCaption1>
          </Grid>
          <Grid item xs={12}>
            <ETParagraph color={Palette.neutral.dark}>
              {work?.project?.description}
            </ETParagraph>
          </Grid>
          <Grid item xs={6}>
            <ETCaption1 bold color={Palette.primary.main}>
              TYPE
            </ETCaption1>
          </Grid>
          <Grid item xs={6}>
            <ETCaption1 bold color={Palette.primary.main}>
              SUBTYPE
            </ETCaption1>
          </Grid>
          <Grid item xs={6}>
            <ETParagraph color={Palette.neutral.dark}>
              {work?.project?.type?.name}
            </ETParagraph>
          </Grid>
          <Grid item xs={6}>
            <ETParagraph color={Palette.neutral.dark}>
              {work?.project?.sub_type?.name}
            </ETParagraph>
          </Grid>
          <Grid item xs={12}>
            <ETCaption1 bold color={Palette.primary.main}>
              LOCATION DESCRIPTION
            </ETCaption1>
          </Grid>
          <Grid item xs={12}>
            <ETParagraph color={Palette.neutral.dark}>
              {work?.project?.address}
            </ETParagraph>
          </Grid>
          <Grid item xs={6}>
            <ETCaption1 bold color={Palette.primary.main}>
              ENV REGION
            </ETCaption1>
          </Grid>
          <Grid item xs={6}>
            <ETCaption1 bold color={Palette.primary.main}>
              NRS REGION
            </ETCaption1>
          </Grid>
          <Grid item xs={6}>
            <ETParagraph color={Palette.neutral.dark}>
              {work?.project?.region_env?.name}
            </ETParagraph>
          </Grid>
          <Grid item xs={6}>
            <ETParagraph color={Palette.neutral.dark}>
              {work?.project?.region_flnro?.name}
            </ETParagraph>
          </Grid>
          <Grid item xs={12}>
            <ETCaption1 bold color={Palette.primary.main}>
              ABBREVIATION
            </ETCaption1>
          </Grid>
          <Grid item xs={12}>
            <ETParagraph color={Palette.neutral.dark}>
              {work?.project?.abbreviation}
            </ETParagraph>
          </Grid>
        </Grid>
      </GrayBox>
      <ProjectDialog
        projectId={work.project_id}
        open={openProjectDialog}
        setOpen={setOpenProjectDialog}
        saveProjectCallback={handleReloadWork}
      />
    </>
  );
};

export default ProjectDetails;
