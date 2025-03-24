import { FC, useEffect, useMemo, useState } from "react";
import { MRT_ColumnDef, MRT_TableOptions } from "material-react-table";
import {
  Box,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
} from "@mui/material";
import Icons from "components/icons";
import { IconProps } from "components/icons/type";
import { ETParagraph, ETSubhead } from "components/shared";
import { Restricted } from "components/shared/restricted";
import { showNotification } from "components/shared/notificationProvider";
import MasterTrackTable from "components/shared/MasterTrackTable";
import {
  StalenessSettings,
  StalenessSettingTypeEnum,
  StalenessSettingTypeNames,
} from "models/settings";
import stalenessSettingsService from "services/stalenessSettingsService";
import { getErrorMessage } from "utils/axiosUtils";
import { Palette } from "styles/theme";
import { ROLES } from "constants/application-constant";

const CancelIcon: FC<IconProps> = Icons["CloseXIcon"];
const CheckIcon: FC<IconProps> = Icons["CheckIcon"];
const DotIcon: FC<IconProps> = Icons["BulletIcon"];
const EditIcon: FC<IconProps> = Icons["PencilEditIcon"];

const GeneralSettings = () => {
  const [generalSettings, setGeneralSettings] = useState<StalenessSettings[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await stalenessSettingsService.getAll();
      const sortedData = (response.data as StalenessSettings[]).sort(
        (a, b) => a.sort_order - b.sort_order
      );
      setGeneralSettings(sortedData || []);
    } catch (error) {
      showNotification("Could not load Status and Issue settings", {
        duration: 3000,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const columns = useMemo<MRT_ColumnDef<StalenessSettings>[]>(
    () => [
      {
        id: "staleness_type",
        accessorFn: (row) => StalenessSettingTypeNames[row.staleness_type],
        accessorKey: "staleness_type",
        enableEditing: false,
        header: "Type",
      },
      {
        id: "warning_length",
        accessorFn: (row) => `${row.warning_length} days`,
        accessorKey: "warning_length",
        enableEditing: true,
        header: "Warning",
        Edit: ({ column, row, table }) => {
          const onChange = (event: React.FocusEvent<HTMLInputElement>) => {
            const newValue = Number(event.target.value) || 0;
            row._valuesCache[column.id] = newValue;
            table.setEditingRow(row);
          };

          return (
            <TextField
              type="number"
              defaultValue={row.original.warning_length}
              inputProps={{ min: 1 }}
              onChange={onChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">days</InputAdornment>
                ),
              }}
              variant="outlined"
              fullWidth
            />
          );
        },
      },
      {
        id: "staleness_length",
        accessorFn: (row) => `${row.staleness_length} days`,
        accessorKey: "staleness_length",
        enableEditing: true,
        header: "Stale",
        Edit: ({ column, row, table }) => {
          const onChange = (event: React.FocusEvent<HTMLInputElement>) => {
            const newValue = Number(event.target.value) || 0;
            row._valuesCache[column.id] = newValue;
            console.log("New Value: ", newValue);
            table.setEditingRow(row);
          };

          return (
            <TextField
              type="number"
              defaultValue={row.original.staleness_length}
              inputProps={{ min: 1 }}
              onChange={onChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">days</InputAdornment>
                ),
              }}
              variant="outlined"
              fullWidth
            />
          );
        },
      },
    ],
    []
  );

  const handleEditRowSave: MRT_TableOptions<StalenessSettings>["onEditingRowSave"] =
    async ({ table, row }) => {
      const stalenessType = row.id;
      const warningLength = parseInt(
        row.getValue("warning_length") as string,
        10
      );
      const stalenessLength = parseInt(
        row.getValue("staleness_length") as string,
        10
      );

      if (warningLength < 1 || stalenessLength < 1) {
        showNotification("Thresholds must be greater than 0.", {
          type: "error",
        });
        return;
      }

      if (stalenessLength <= warningLength) {
        showNotification(
          "Staleness threshold must be greater than warning threshold.",
          { type: "error", duration: 3000 }
        );
        return;
      }

      try {
        if (stalenessType === StalenessSettingTypeEnum.ISSUES) {
          await stalenessSettingsService.updateIssueStaleness({
            staleness_type: row.original.staleness_type,
            warning_length: warningLength,
            staleness_length: stalenessLength,
          });
        } else if (stalenessType === StalenessSettingTypeEnum.STATUS) {
          await stalenessSettingsService.updateStatusStaleness({
            staleness_type: row.original.staleness_type,
            warning_length: warningLength,
            staleness_length: stalenessLength,
          });
        }

        // Notification and cleanup
        table.setEditingRow(null);
        fetchSettings();
        showNotification(
          `Updated ${
            StalenessSettingTypeNames[row.original.staleness_type]
          } thresholds.`,
          { type: "success" }
        );
      } catch (error) {
        showNotification(getErrorMessage(error), { type: "error" });
      }
    };

  return (
    <Grid container rowSpacing={0}>
      <Grid item xs={12}>
        <Box sx={{ pt: 4, pb: 0 }}>
          <ETSubhead bold color={Palette.neutral.dark}>
            {" "}
            Set Up Your Status Warning Thresholds{" "}
          </ETSubhead>
          <ETParagraph color={Palette.neutral.dark} sx={{ pt: 2 }}>
            {" "}
            Define the number of days before a status changes colours:{" "}
          </ETParagraph>
          <ETParagraph color={Palette.neutral.dark}>
            <List sx={{ pt: 0 }}>
              <ListItem sx={{ pt: 0, pb: 0, lineHeight: 1 }}>
                <ListItemIcon sx={{ minWidth: "4px" }}>
                  <DotIcon fill={Palette.neutral.dark} sx={{ fontSize: 1 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Green → Yellow (Warning)"
                  sx={{ mt: 0, mb: 0 }}
                />
              </ListItem>
              <ListItem sx={{ pt: 0, pb: 0 }}>
                <ListItemIcon sx={{ minWidth: "4px" }}>
                  <DotIcon fill={Palette.neutral.dark} sx={{ fontSize: 1 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Yellow → Red (Stale)"
                  sx={{ mt: 0, mb: 0 }}
                />
              </ListItem>
            </List>
          </ETParagraph>
        </Box>
      </Grid>
      <Grid item xs={6}>
        <MasterTrackTable
          columns={columns}
          data={generalSettings}
          editDisplayMode="row"
          enableColumnFilters={false}
          enableColumnResizing={false}
          enableEditing={true}
          enableFilters={false}
          enableGrouping={false}
          enableRowActions={true}
          enableSorting={false}
          getRowId={(originalRow) => originalRow.staleness_type || ""}
          onEditingRowCancel={({ table }) => {
            table.setEditingRow(null);
          }}
          onEditingRowSave={handleEditRowSave}
          state={{ isLoading: loading }}
          tableName="staleness-settings"
          renderRowActions={({ row, table }) => (
            <Box>
              <Restricted
                allowed={[ROLES.MANAGE_USERS]}
                errorProps={{ disabled: true }}
              >
                <IconButton
                  color="primary"
                  onClick={() => {
                    table.setEditingRow(row);
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Restricted>
            </Box>
          )}
          icons={{
            SaveIcon: (props: any) => (
              <CheckIcon {...props} fill={Palette.success.main} />
            ),
            CancelIcon: (props: any) => (
              <CancelIcon {...props} fill={Palette.error.main} />
            ),
          }}
        />
      </Grid>
    </Grid>
  );
};

export default GeneralSettings;
