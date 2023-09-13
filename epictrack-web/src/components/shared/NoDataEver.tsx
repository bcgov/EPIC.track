import React from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Container, Typography } from "@mui/material";
import { ETHeading2, ETHeading3 } from ".";
import FolderIcon from "../../assets/images/folder.svg";
import { makeStyles } from "@mui/styles";
import { Palette } from "../../styles/theme";

const useStyle = makeStyles({
  folderIcon: {
    padding: "0.5rem",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "4px",
    backgroundColor: Palette.neutral.bg.light,
    width: "64px",
  },
  title: {
    color: Palette.neutral.accent.dark,
    lineHeight: "2.25rem",
  },
  subTitle: {
    color: Palette.neutral.main,
    lineHeight: "2rem",
  },
});

interface NoDataEverProps {
  title: string;
  subTitle: string;
  onClickHandler: () => void;
  buttonText: string;
}

const NoDataEver = ({
  title,
  subTitle,
  buttonText,
  onClickHandler,
}: NoDataEverProps) => {
  const classes = useStyle();
  return (
    <>
      <Container
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            alignItems: "center",
          }}
        >
          <Box
            className={classes.folderIcon}
            component="img"
            src={FolderIcon}
            alt="Search"
            width="32px"
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            <ETHeading2 bold className={classes.title}>
              {title}
            </ETHeading2>
            <ETHeading3 className={classes.subTitle}>{subTitle}</ETHeading3>
            <Button
              sx={{
                mt: "3rem",
              }}
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onClickHandler}
            >
              {buttonText}
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default NoDataEver;
