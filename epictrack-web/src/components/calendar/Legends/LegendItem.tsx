import { FC, useCallback } from "react";
import { Box } from "@mui/material";
import { tabPanelStyle } from "components/workPlan/common/styles";
import { Palette } from "styles/theme";
import { Icon, IconProps } from "components/icons/type";
import Icons from "components/icons";
import { ETSubhead } from "components/shared";

export interface LegendItemProps {
  icon: Icon;
  text: string;
}

const LegendItem = (item: LegendItemProps) => {
  const renderIcon = useCallback((iconTitle: string) => {
    const Icon: FC<IconProps> = Icons[iconTitle];
    return <Icon height={"20px"} fill={Palette.primary.main} />;
  }, []);

  return (
    <Box
      sx={{
        ...tabPanelStyle,
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: 0,
        borderBottom: `1px solid ${Palette.neutral.accent.light}`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "0.875rem",
          padding: "1rem 1.5rem",
          alignSelf: "stretch",
          borderRadius: "4px",
          backgroundColor: Palette.neutral.bg.light,
        }}
      >
        {renderIcon(item.icon)}
        <ETSubhead
          sx={{
            lineHeight: "1.5rem",
            color: Palette.primary.accent.main,
            fontSize: "1rem",
          }}
        >
          {item.text}
        </ETSubhead>
      </Box>
    </Box>
  );
};

export default LegendItem;
