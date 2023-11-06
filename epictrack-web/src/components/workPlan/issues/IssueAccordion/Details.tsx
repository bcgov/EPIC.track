import React from "react";
import { Grid, IconButton, Stack } from "@mui/material";
import { WorkIssue } from "../../../../models/Issue";
import { ETCaption1, ETCaption2, ETParagraph, GrayBox } from "../../../shared";
import moment from "moment";
import { ErrorChip } from "../../../shared/chip/ETChip";
import icons from "../../../icons";
import { IconProps } from "../../../icons/type";
import { Palette } from "../../../../styles/theme";
import { When } from "react-if";
import { IssuesContext } from "../IssuesContext";

const IssueDetails = ({ issue }: { issue: WorkIssue }) => {
  const latestUpdate = issue.updates[issue.updates.length - 1];
  const CheckCircleIcon: React.FC<IconProps> = icons["CheckCircleIcon"];
  const PencilEditIcon: React.FC<IconProps> = icons["PencilEditIcon"];

  const { setIssueToEdit, setShowIssuesForm } = React.useContext(IssuesContext);

  return (
    <Grid container spacing={2}>
      <Grid item lg={6} sm={12}>
        <GrayBox>
          <Grid container spacing={2}>
            <Grid
              item
              xs={12}
              container
              spacing={2}
              justifyContent={"space-between"}
            >
              <Grid item xs={"auto"}>
                <ETCaption1 bold>
                  {moment(issue.created_at).format("MMM.DD YYYY")}
                </ETCaption1>
              </Grid>
              <Grid item xs="auto">
                <ErrorChip label="Need Approval" />
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <ETParagraph>{latestUpdate?.description}</ETParagraph>
            </Grid>

            <When condition={Boolean(issue.approved_by)}>
              <Grid item>
                <IconButton disableRipple>
                  <Stack direction={"row"} alignItems={"center"} spacing={1}>
                    <CheckCircleIcon />
                    <ETCaption2 color={Palette.primary.accent.main}>
                      Approve
                    </ETCaption2>
                  </Stack>
                </IconButton>
              </Grid>
            </When>

            <Grid item>
              <IconButton
                disableRipple
                onClick={() => {
                  setIssueToEdit(issue);
                  setShowIssuesForm(true);
                }}
              >
                <Stack direction={"row"} alignItems={"center"} spacing={1}>
                  <PencilEditIcon />
                  <ETCaption2 color={Palette.primary.accent.main}>
                    Edit
                  </ETCaption2>
                </Stack>
              </IconButton>
            </Grid>
          </Grid>
        </GrayBox>
      </Grid>
    </Grid>
  );
};

export default IssueDetails;
