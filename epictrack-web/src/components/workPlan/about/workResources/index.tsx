import { useContext } from "react";
import { Box } from "@mui/material";
import { tabPanelStyle } from "components/workPlan/common/styles";
import { ABOUT_RESOURCES } from "constants/application-constant";
import { WorkplanContext } from "components/workPlan/WorkPlanContext";
import ResourceLink from "./resource";
import { AboutContext } from "../AboutContext";

const WorkResources = () => {
  const { work } = useContext(WorkplanContext);
  const { workResources } = useContext(AboutContext);

  return (
    <Box
      sx={{
        ...tabPanelStyle,
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: 0,
      }}
    >
      <ResourceLink
        url={`https://projects.eao.gov.bc.ca/projects-list?keywords=${work?.project?.name}`}
        title="Link to EPIC.Public"
      />
      {ABOUT_RESOURCES.map((resource) => {
        return (
          <ResourceLink
            key={resource.url}
            url={resource.url}
            title={resource.title}
          />
        );
      })}
      {workResources && workResources.length > 0 && (
        <>
          {workResources.map((resource) => (
            <ResourceLink key={resource.id} workResource={resource} />
          ))}
        </>
      )}
    </Box>
  );
};

export default WorkResources;
