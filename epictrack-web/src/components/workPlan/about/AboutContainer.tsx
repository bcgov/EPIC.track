import { Box, Grid } from "@mui/material";
import React, { useContext } from "react";
import { ETHeading3, ETLink, ETParagraph } from "../../shared";
import { tabPanelStyle, tabStyle, titleStyle } from "../common/styles";
import { Palette } from "../../../styles/theme";
import { ETTabs, ETTab } from "../../shared/tab/Tab";
import TabPanel from "../../shared/tab/TabPanel";
import ComingSoon from "../../../routes/ComingSoon";
import AboutDetails from "./aboutDetails";
import { ABOUT_RESOURCES } from "../../../constants/application-constant";
import Icons from "../../icons";
import { IconProps } from "../../icons/type";
import { WorkplanContext } from "../WorkPlanContext";

const LinkIcon: React.FC<IconProps> = Icons["LinkIcon"];

const AboutContainer = () => {
  const { work } = useContext(WorkplanContext);
  const [selectedTabIndex, setSelectedTabIndex] = React.useState(0);

  const handleTabSelected = (event: React.SyntheticEvent, index: number) => {
    setSelectedTabIndex(index);
  };

  return (
    <Grid container columnSpacing={1.5}>
      <Grid item xs={8}>
        <ETTabs
          sx={{
            gap: "2rem",
            minHeight: "0px",
            height: "100%",
          }}
          onChange={handleTabSelected}
          value={selectedTabIndex}
        >
          <ETTab
            sx={{
              paddingLeft: 0,
              ...tabStyle,
            }}
            label="Details"
          />
          <ETTab
            label="Calender"
            sx={{
              ...tabStyle,
            }}
          />
        </ETTabs>
      </Grid>
      <Grid item xs={4}>
        <ETHeading3
          sx={{
            ...titleStyle,
          }}
          color={Palette.primary.main}
        >
          Resources
        </ETHeading3>
      </Grid>
      <Grid
        item
        xs={8}
        sx={{
          pt: "2rem",
        }}
      >
        <TabPanel
          index={0}
          value={selectedTabIndex}
          sx={{
            ...tabPanelStyle,
          }}
        >
          <AboutDetails />
        </TabPanel>
        <TabPanel
          index={1}
          value={selectedTabIndex}
          sx={{
            ...tabPanelStyle,
          }}
        >
          <ComingSoon />
        </TabPanel>
      </Grid>
      <Grid
        item
        xs={4}
        sx={{
          pt: "2rem",
        }}
      >
        <Box
          sx={{
            ...tabPanelStyle,
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
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
          >
            <Box
              sx={{
                display: "flex",
                gap: ".5rem",
                alignItems: "center",
              }}
            >
              <LinkIcon fill={`${Palette.primary.accent.main}`} />
              <ETLink
                to={`https://projects.eao.gov.bc.ca/projects-list?keywords=${work?.project?.name}`}
                target="_blank"
                rel="noopener"
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  lineHeight: "1.5rem",
                }}
              >
                Link to EPIC.Public
              </ETLink>
            </Box>
          </Box>
          {ABOUT_RESOURCES.map((resource) => {
            return (
              <>
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
                >
                  <Box
                    sx={{
                      display: "flex",
                      gap: ".5rem",
                      alignItems: "center",
                    }}
                  >
                    <LinkIcon fill={`${Palette.primary.accent.main}`} />
                    <ETLink
                      to={`${resource.url}`}
                      target="_blank"
                      rel="noopener"
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        lineHeight: "1.5rem",
                      }}
                    >
                      {resource.title}
                    </ETLink>
                  </Box>
                </Box>
              </>
            );
          })}
        </Box>
      </Grid>
    </Grid>
  );
};

export default AboutContainer;
