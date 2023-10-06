import React from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Container, Typography } from "@mui/material";
import { ETHeading2, ETHeading3 } from ".";
import FolderIcon from "../../assets/images/folder.svg";
import { makeStyles } from "@mui/styles";
import { Palette } from "../../styles/theme";
import { IconProps } from "../icons/type";
import Icons from "../icons";

const ImportFileIcon: React.FC<IconProps> = Icons["ImportFileIcon"];

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
  importIcon: {
    fill: "currentColor",
  },
});

interface NoDataEverProps {
  title: string;
  subTitle: string;
  onAddNewClickHandler: () => void;
  addNewButtonText: string;
  isImportRequired?: boolean;
  importButtonText?: string;
  onImportClickHandler?: () => void;
}

const NoDataEver = ({
  title,
  subTitle,
  addNewButtonText,
  onAddNewClickHandler,
  isImportRequired,
  importButtonText,
  onImportClickHandler,
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
            <Box sx={{ display: "flex", gap: "1.5rem" }}>
              <Button
                sx={{
                  mt: "3rem",
                }}
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onAddNewClickHandler}
              >
                {addNewButtonText}
              </Button>
              {isImportRequired && (
                <Button
                  sx={{
                    mt: "3rem",
                  }}
                  variant="outlined"
                  startIcon={<ImportFileIcon className={classes.importIcon} />}
                  onClick={onImportClickHandler}
                >
                  {importButtonText}
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default NoDataEver;
