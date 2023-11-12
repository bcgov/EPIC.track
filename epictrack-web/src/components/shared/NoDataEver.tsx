import React from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Container } from "@mui/material";
import { ETHeading2, ETHeading3 } from ".";
import FolderIcon from "../../assets/images/folder.svg";
import { Palette } from "../../styles/theme";
import { IconProps } from "../icons/type";
import Icons from "../icons";

const ImportFileIcon: React.FC<IconProps> = Icons["ImportFileIcon"];

interface NoDataEverProps {
  title: string;
  subTitle: string;
  onAddNewClickHandler: () => void;
  addNewButtonText: string;
  isImportRequired?: boolean;
  importButtonText?: string;
  onImportClickHandler?: () => void;
  isImportDisabled?: boolean;
}

const NoDataEver = ({
  title,
  subTitle,
  addNewButtonText,
  onAddNewClickHandler,
  isImportRequired,
  importButtonText,
  onImportClickHandler,
  isImportDisabled,
}: NoDataEverProps) => {
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
            sx={{
              padding: "0.5rem",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "4px",
              backgroundColor: Palette.neutral.bg.light,
              width: "64px",
            }}
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
            <ETHeading2
              bold
              sx={{
                color: Palette.neutral.accent.dark,
                lineHeight: "2.25rem",
              }}
            >
              {title}
            </ETHeading2>
            <ETHeading3
              sx={{
                color: Palette.neutral.main,
                lineHeight: "2rem",
              }}
            >
              {subTitle}
            </ETHeading3>
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
                  startIcon={<ImportFileIcon fill="currentcolor" />}
                  onClick={onImportClickHandler}
                  disabled={isImportDisabled}
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
