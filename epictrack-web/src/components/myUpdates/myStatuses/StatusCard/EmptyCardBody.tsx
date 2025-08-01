import { Grid, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Palette } from "styles/theme";
import { ROLES } from "constants/application-constant";
import { Restricted } from "components/shared/restricted";

interface EmptyStatusCardProps {
  title?: string;
  subTitle?: string;
  onAddClick: () => void;
  addButtonText?: string;
}

const EmptyCardBody: React.FC<EmptyStatusCardProps> = ({
  title = "You don't have any Status yet",
  subTitle = "Create your first Status.",
  addButtonText = "Add Status",
  onAddClick,
}) => {
  return (
    <Grid
      container
      direction="column"
      alignItems="flex-start"
      justifyContent="center"
      spacing={1}
      sx={{
        padding: 2,
        minHeight: "150px",
        backgroundColor: Palette.neutral.bg.light,
        borderRadius: "8px",
      }}
    >
      <Grid item>
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          color={Palette.neutral.accent.dark}
        >
          {title}
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant="body2" color={Palette.neutral.main}>
          {subTitle}
        </Typography>
      </Grid>
      <Grid item>
        <Restricted allowed={[ROLES.EDIT]} exception={false}>
          <Button
            startIcon={<AddIcon />}
            onClick={onAddClick}
            sx={{
              backgroundColor: "inherit",
              borderColor: "transparent",
            }}
          >
            {addButtonText}
          </Button>
        </Restricted>
      </Grid>
    </Grid>
  );
};

export default EmptyCardBody;
