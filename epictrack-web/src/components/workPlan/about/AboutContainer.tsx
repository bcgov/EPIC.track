import { SyntheticEvent, useContext, useState } from "react";
import { Button, Grid } from "@mui/material";
import { ETHeading3 } from "../../shared";
import { tabPanelStyle, tabStyle, titleStyle } from "../common/styles";
import { Palette } from "../../../styles/theme";
import { ETTabs, ETTab } from "../../shared/tab/Tab";
import TabPanel from "../../shared/tab/TabPanel";
import ComingSoon from "../../../routes/ComingSoon";
import AboutDetails from "./aboutDetails";
import WorkResources from "./workResources";
import { IconProps } from "components/icons/type";
import Icons from "components/icons";
import { AboutContext } from "./AboutContext";

const AddIcon: React.FC<IconProps> = Icons["AddIcon"];

const AboutContainer = () => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const handleTabSelected = (event: SyntheticEvent, index: number) => {
    setSelectedTabIndex(index);
  };

  const { setShowCreateDialog } = useContext(AboutContext);

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
            label="Calendar"
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
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
          color={Palette.primary.main}
        >
          <span>Resources</span>
          <Button
            onClick={() => setShowCreateDialog(true)}
            variant="contained"
            color="primary"
            sx={{
              maxHeight: "20px",
            }}
            startIcon={<AddIcon sx={{ width: "12px", height: "12px" }} />}
          >
            Add Resource
          </Button>
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
            padding: "0 0 2rem 0",
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
        <WorkResources />
      </Grid>
    </Grid>
  );
};

export default AboutContainer;
