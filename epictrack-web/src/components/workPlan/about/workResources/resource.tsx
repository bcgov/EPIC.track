import { Box, IconButton } from "@mui/material";
import { FC, useContext } from "react";
import { Palette } from "styles/theme";
import Icons from "../../../icons";
import { IconProps } from "../../../icons/type";
import { ETLink } from "components/shared";
import { If, Then } from "react-if";
import { AboutContext } from "../AboutContext";
import { WorkResource } from "models/workResource";

interface ResourceLinkProps {
  url?: string;
  title?: string;
  workResource?: WorkResource;
}

const LinkIcon: FC<IconProps> = Icons["LinkIcon"];
const DeleteIcon: FC<IconProps> = Icons["DeleteIcon"];
const EditIcon: FC<IconProps> = Icons["PencilEditIcon"];

const ResourceLink = ({ url, title, workResource }: ResourceLinkProps) => {
  const { setShowDeleteDialog, setShowEditDialog, setSelectedWorkResource } =
    useContext(AboutContext);

  return (
    <Box
      sx={{
        display: "flex",
        padding: "1rem 1.5rem",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: ".5rem",
        alignSelf: "stretch",
        borderRadius: "4px",
        backgroundColor: Palette.neutral.bg.light,
      }}
      key={workResource?.id || url}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
          <LinkIcon fill={`${Palette.primary.accent.main}`} />
          <ETLink
            to={`${workResource?.link || url}`}
            target="_blank"
            rel="noopener"
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              lineHeight: "1.5rem",
            }}
          >
            {workResource?.title || title}
          </ETLink>
        </Box>
        <If condition={workResource != null}>
          <Then>
            <Box sx={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <IconButton
                onClick={() => {
                  if (!workResource) return;
                  setShowEditDialog(true);
                  setSelectedWorkResource(workResource);
                }}
                size="small"
                sx={{ padding: "2px", minHeight: 0, minWidth: 0 }}
              >
                <EditIcon sx={{ color: Palette.primary.main }} />
              </IconButton>
              <IconButton
                onClick={() => {
                  if (!workResource) return;
                  setShowDeleteDialog(true);
                  setSelectedWorkResource(workResource);
                }}
                size="small"
                sx={{ padding: "2px", minHeight: 0, minWidth: 0 }}
              >
                <DeleteIcon sx={{ color: Palette.primary.main }} />
              </IconButton>
            </Box>
          </Then>
        </If>
      </Box>
    </Box>
  );
};

export default ResourceLink;
