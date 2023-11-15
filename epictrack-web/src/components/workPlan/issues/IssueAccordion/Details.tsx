import React from "react";
import { Button, Grid, Stack } from "@mui/material";
import { WorkIssue } from "../../../../models/Issue";
import { ETCaption1, ETHeading4, ETParagraph, GrayBox } from "../../../shared";
import moment from "moment";
import { ActiveChip, ErrorChip } from "../../../shared/chip/ETChip";
import icons from "../../../icons";
import { IconProps } from "../../../icons/type";
import { Palette } from "../../../../styles/theme";
import { Else, If, Then, When } from "react-if";
import { IssuesContext } from "../IssuesContext";
import TrackDialog from "../../../shared/TrackDialog";
import IssueHistory from "./IssueHistory";

const IssueDetails = ({ issue }: { issue: WorkIssue }) => {
  const latestUpdate = issue.updates[0];
  const CheckCircleIcon: React.FC<IconProps> = icons["CheckCircleIcon"];
  const PencilEditIcon: React.FC<IconProps> = icons["PencilEditIcon"];
  const CloneIcon: React.FC<IconProps> = icons["CloneIcon"];

  const {
    setShowIssuesForm,
    approveIssue,
    issueToApproveId,
    setIssueToApproveId,
    setUpdateToClone,
    setShowCloneForm,
    setUpdateToEdit,
  } = React.useContext(IssuesContext);

  const handleApproveIssue = () => {
    approveIssue(issue.id, latestUpdate.id);
    setIssueToApproveId(null);
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item lg={6} xs={12}>
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
                  <ETCaption1 bold color={Palette.neutral.dark}>
                    {moment(issue.created_at)
                      .format("MMM.DD YYYY")
                      .toUpperCase()}
                  </ETCaption1>
                </Grid>
                <If condition={latestUpdate.is_approved}>
                  <Then>
                    <Grid item xs="auto">
                      <ActiveChip label="Approved" />
                    </Grid>
                  </Then>
                  <Else>
                    <Grid item xs="auto">
                      <ErrorChip label="Need Approval" />
                    </Grid>
                  </Else>
                </If>
              </Grid>

              <Grid item xs={12}>
                <ETParagraph color={Palette.neutral.dark}>
                  {latestUpdate?.description}
                </ETParagraph>
              </Grid>

              <If condition={!latestUpdate.is_approved}>
                <Then>
                  <Grid item>
                    <Button
                      variant="text"
                      startIcon={<CheckCircleIcon />}
                      sx={{
                        backgroundColor: "inherit",
                        borderColor: "transparent",
                      }}
                      onClick={() => {
                        setIssueToApproveId(issue.id);
                      }}
                    >
                      Approve
                    </Button>
                  </Grid>
                </Then>
                <Else>
                  <Grid item>
                    <Button
                      variant="text"
                      startIcon={<CloneIcon />}
                      sx={{
                        backgroundColor: "inherit",
                        borderColor: "transparent",
                      }}
                      onClick={() => {
                        setUpdateToClone(latestUpdate);
                        setShowCloneForm(true);
                      }}
                    >
                      Clone
                    </Button>
                  </Grid>
                </Else>
              </If>

              <Grid item>
                <Button
                  variant="text"
                  startIcon={<PencilEditIcon />}
                  sx={{
                    backgroundColor: "inherit",
                    borderColor: "transparent",
                  }}
                  onClick={() => {
                    setUpdateToEdit(latestUpdate);
                    setShowIssuesForm(true);
                  }}
                >
                  Edit
                </Button>
              </Grid>
            </Grid>
          </GrayBox>
        </Grid>

        <Grid item lg={6} xs={12}>
          <When condition={issue.updates.length > 1}>
            <Stack
              sx={{
                padding: "16px",
              }}
              direction="column"
            >
              <ETCaption1 bold color={Palette.neutral.dark}>
                ISSUE HISTORY
              </ETCaption1>
              <IssueHistory issue={issue} />
            </Stack>
          </When>
        </Grid>
      </Grid>

      <TrackDialog
        open={issueToApproveId === issue.id}
        dialogTitle="Approve this Issue?"
        disableEscapeKeyDown
        fullWidth
        maxWidth="sm"
        okButtonText="Save"
        onCancel={() => setIssueToApproveId(null)}
        onClose={() => setIssueToApproveId(null)}
        onOk={handleApproveIssue}
        isActionsRequired
      >
        <ETHeading4>
          Once approved, this issue will be automatically added to the report.
        </ETHeading4>
      </TrackDialog>
    </>
  );
};

export default IssueDetails;
