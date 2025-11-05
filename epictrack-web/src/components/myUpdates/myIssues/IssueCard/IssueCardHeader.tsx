import { FC, useContext } from "react";
import { Button, Grid, Stack, Tooltip } from "@mui/material";
import moment from "moment";
import { Palette } from "../../../../styles/theme";
import { ETCaption1, ETParagraph } from "../../../shared";
import { IssueCardProps } from ".";
import StatusBadge from "../../StatusBadge";
import { MONTH_DAY_YEAR, ROLES } from "constants/application-constant";
import { ETChip } from "components/shared/chip/ETChip";
import { Restricted } from "components/shared/restricted";
import { useUserHasRole } from "components/workPlan/utils";
import { IssuesContext } from "components/workPlan/issues/IssuesContext";
import icons from "../../../icons";
import { IconProps } from "../../../icons/type";

const IssueCardHeader = ({ item }: IssueCardProps) => {
  const EditIcon: FC<IconProps> = icons["PencilEditIcon"];
  const userHasRole = useUserHasRole();
  const { setEditIssueFormIsOpen, setIssueToEdit } = useContext(IssuesContext);

  return (
    <Grid
      container
      sx={{
        backgroundColor: Palette.neutral.bg.light,
        borderBottom: `2px solid var(--neutral-background-dark, #DBDCDC)`,
        padding: "0.875rem",
        height: "120px",
        fontSize: "13px",
      }}
      justifyContent="space-between"
      alignItems="start"
    >
      <Grid item xs={7}>
        <Stack spacing={0} direction={"column"}>
          <Tooltip title={item?.work_name ?? ""}>
            <span>
              <ETCaption1
                bold
                color={Palette.neutral.light}
                sx={{
                  display: "-webkit-box",
                  overflow: "hidden",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  textOverflow: "ellipsis",
                  textTransform: "uppercase",
                }}
              >
                {item?.work_name}
              </ETCaption1>
            </span>
          </Tooltip>
          <Tooltip title={item?.issue.title ?? ""}>
            <span>
              <ETParagraph
                color={Palette.neutral.dark}
                sx={{
                  display: "-webkit-box",
                  overflow: "hidden",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 1,
                  textOverflow: "ellipsis",
                }}
              >
                {item?.issue.title}
              </ETParagraph>
            </span>
          </Tooltip>
          <Stack spacing={1} direction={"row"} sx={{ paddingTop: "0.5rem" }}>
            {item?.issue.is_high_priority && (
              <ETChip highPriority label="High Profile" />
            )}
            <StatusBadge
              is_active={item?.issue.is_active}
              sx={{ padding: "0 0.5rem 0 0.5rem " }}
            />
            {item?.issue.is_resolved && <ETChip resolved label="Resolved" />}
          </Stack>
        </Stack>
      </Grid>
      <Grid item container xs={5} justifyContent={"end"}>
        <Stack spacing={2} direction={"row"}>
          <Stack spacing={1} direction={"column"}>
            <ETCaption1
              bold
              color={Palette.neutral.light}
              sx={{
                textTransform: "uppercase",
              }}
            >
              Start Date
            </ETCaption1>
            <ETParagraph>
              {moment(item?.issue.start_date).format(MONTH_DAY_YEAR)}
            </ETParagraph>
          </Stack>
          <Stack spacing={1} direction={"column"}>
            <ETCaption1
              bold
              color={Palette.neutral.light}
              sx={{
                textTransform: "uppercase",
              }}
            >
              Actions
            </ETCaption1>
            <Restricted
              allowed={[ROLES.EDIT]}
              errorProps={{ disabled: true }}
              exception={userHasRole}
            >
              <Button
                variant="text"
                startIcon={<EditIcon />}
                sx={{
                  backgroundColor: "inherit",
                  borderColor: "transparent",
                  textAlign: "start",
                  height: "fit-content",
                  paddingTop: 0,
                  paddingBottom: 0,
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  setIssueToEdit(item?.issue);
                  setEditIssueFormIsOpen(true);
                }}
              />
            </Restricted>
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default IssueCardHeader;
