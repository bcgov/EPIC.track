import React from "react";
import NoDataEver from "../../shared/NoDataEver";
import { WorkplanContext } from "../WorkPlanContext";
import { StatusContext } from "./StatusContext";
import { Box, Button } from "@mui/material";
import moment from "moment";
import { ETCaption1, ETDescription } from "../../shared";
import { Palette } from "../../../styles/theme";
import Icons from "../../icons";
import { IconProps } from "../../icons/type";
import StatusOutOfDateBanner from "./StatusOutOfDateBanner";

const CheckCircleIcon: React.FC<IconProps> = Icons["CheckCircleIcon"];
const PencilEditIcon: React.FC<IconProps> = Icons["PencilEditIcon"];
const CloneIcon: React.FC<IconProps> = Icons["CloneIcon"];

const StatusView = () => {
  const { statuses } = React.useContext(WorkplanContext);
  const { setShowStatusForm, setStatus } = React.useContext(StatusContext);

  const onAddButtonClickHandler = () => {
    setShowStatusForm(true);
  };

  // const sortStatues = () => {
  //   statuses.sort((a, b) => {
  //     return dateUtils.diff(a.start_date, b.start_date, "days");
  //   });
  // };

  return (
    <>
      {statuses.length === 0 && (
        <NoDataEver
          title="You don't have any Statuses yet"
          subTitle="Create your first Status"
          addNewButtonText="Add Status"
          onAddNewClickHandler={() => onAddButtonClickHandler()}
        />
      )}
      {statuses.length > 0 && statuses[0].approved === false && (
        <StatusOutOfDateBanner />
      )}
      {statuses.length > 0 && (
        <Box
          sx={{
            backgroundColor: Palette.neutral.bg.light,
            padding: "16px 24px",
            width: "50%",
            gap: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <ETCaption1 bold>
              {moment(statuses[0]?.start_date).format("ll")}
            </ETCaption1>
            {statuses[0].approved === false ? (
              <ETCaption1
                bold
                sx={{
                  color: Palette.error.dark,
                  backgroundColor: Palette.error.bg.light,
                  padding: "4px 8px",
                  borderRadius: "4px",
                }}
              >
                Need Approval
              </ETCaption1>
            ) : (
              <ETCaption1
                bold
                sx={{
                  color: Palette.success.dark,
                  backgroundColor: Palette.success.bg.light,
                  padding: "4px 8px",
                  borderRadius: "4px",
                }}
              >
                Approved
              </ETCaption1>
            )}
          </Box>
          <ETDescription sx={{ lineHeight: "1.2rem", paddingTop: "16px" }}>
            {statuses[0].description}
          </ETDescription>
          <Box
            sx={{
              display: "flex",
            }}
          >
            {statuses[0].approved === false ? (
              <>
                <Button
                  sx={{
                    display: "flex",
                    gap: "8px",
                    backgroundColor: Palette.neutral.bg.light,
                    borderColor: Palette.neutral.bg.light,
                    ":hover": {
                      backgroundColor: Palette.neutral.bg.light,
                      borderColor: Palette.neutral.bg.light,
                    },
                  }}
                >
                  <CheckCircleIcon />
                  Approve
                </Button>
                <Button
                  onClick={() => {
                    setShowStatusForm(true);
                    setStatus(statuses[0]);
                  }}
                  sx={{
                    display: "flex",
                    gap: "8px",
                    backgroundColor: Palette.neutral.bg.light,
                    borderColor: Palette.neutral.bg.light,
                    ":hover": {
                      backgroundColor: Palette.neutral.bg.light,
                      borderColor: Palette.neutral.bg.light,
                    },
                  }}
                >
                  <PencilEditIcon />
                  Edit
                </Button>
              </>
            ) : (
              <Button
                sx={{
                  display: "flex",
                  gap: "8px",
                  backgroundColor: Palette.neutral.bg.light,
                  borderColor: Palette.neutral.bg.light,
                  ":hover": {
                    backgroundColor: Palette.neutral.bg.light,
                    borderColor: Palette.neutral.bg.light,
                  },
                }}
              >
                <CloneIcon />
                Clone
              </Button>
            )}
          </Box>
        </Box>
      )}
    </>
  );
};

export default StatusView;
