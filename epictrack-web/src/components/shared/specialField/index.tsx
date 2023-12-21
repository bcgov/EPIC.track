import { Box, Button, IconButton, TextField } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { When } from "react-if";
import {
  MRT_ColumnDef,
  MRT_TableOptions,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import ReactSelect, { CSSObjectWithLabel } from "react-select";
import { Palette } from "../../../styles/theme";
import { ETCaption2, ETCaption3, ETParagraph } from "..";
import Icons from "../../icons";
import { IconProps } from "../../icons/type";
import { SpecialField, SpecialFieldProps } from "./type";
import specialFieldService from "../../../services/specialFieldService";
import { dateUtils } from "../../../utils";
import { InLineDatePicker } from "./components/InLineDatePicker";

const AddIcon: React.FC<IconProps> = Icons["AddIcon"];
const EditIcon: React.FC<IconProps> = Icons["PencilEditIcon"];
const CheckIcon: React.FC<IconProps> = Icons["CheckIcon"];
const CancelIcon: React.FC<IconProps> = Icons["CloseXIcon"];

const Styles = {
  flexStart: {
    display: "flex",
    alignItems: "flex-start",
  },
};

export const SpecialFieldGrid = ({
  entity,
  entity_id,
  fieldLabel,
  fieldName,
  fieldType,
  title,
  description,
  options,
  onSave,
}: SpecialFieldProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [entries, setEntries] = useState<SpecialField[]>([]);

  const getEntries = async () => {
    setLoading(true);
    const specialFieldEntries = await specialFieldService.getEntries(
      entity,
      entity_id,
      fieldName
    );
    if (specialFieldEntries.status === 200) {
      setEntries(specialFieldEntries.data as SpecialField[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    getEntries();
  }, [fieldName]);

  const columns = useMemo<MRT_ColumnDef<SpecialField>[]>(
    () => [
      {
        accessorKey: "field_value",
        header: fieldLabel,
        editVariant: fieldType,
        editSelectOptions: options,
        size: 300,
        Cell: ({ cell }) => {
          const id = cell.getValue<number>();
          let value;
          if (fieldType === "select") {
            const option = options?.find((o) => id.toString() === o.value);
            value = option?.label;
          } else {
            value = id;
          }
          return <span>{value}</span>;
        },
        muiEditTextFieldProps: ({ cell, column, row, table }) => {
          return {
            required: true,
            InputProps: {
              sx: { fontSize: "14px" },
            },
          };
        },
        Edit: ({ cell, column, row, table }) => {
          let value: any = cell.getValue<string>();
          if (fieldType === "select") {
            value = options?.find((o) => row.original.field_value == o.value);
          }
          const onBlur = (newValue: any) => {
            row._valuesCache[column.id] =
              fieldType === "select" ? newValue.value : newValue.target.value;
            if (Boolean(tableState.creatingRow)) {
              table.setCreatingRow(row);
            } else {
              table.setEditingRow(row);
            }
          };

          return (
            <>
              <When condition={fieldType === "select"}>
                <ReactSelect
                  options={options}
                  placeholder={fieldLabel}
                  filterAppliedCallback={() => {
                    return;
                  }}
                  menuPortalTarget={document.body}
                  name={fieldName}
                  styles={{
                    container: (base: CSSObjectWithLabel) => ({
                      ...base,
                      maxWidth: "284px", // 300 - padding of 16px
                    }),
                    menuPortal: (base: CSSObjectWithLabel) => ({
                      ...base,
                      zIndex: 99999,
                      fontSize: "14px",
                    }),
                  }}
                  defaultValue={value || ""}
                  onChange={onBlur}
                />
              </When>
              <When condition={fieldType === "text"}>
                <TextField
                  id={fieldName}
                  variant="outlined"
                  onBlur={onBlur}
                  name={fieldName}
                  defaultValue={row._valuesCache[column.id]}
                />
              </When>
            </>
          );
        },
      },
      {
        accessorKey: "active_from",
        header: "From",
        editVariant: "text",
        size: 170,
        Edit: ({ cell, column, row, table }) => {
          return (
            <InLineDatePicker
              cell={cell}
              column={column}
              row={row}
              table={table}
              isCreating={Boolean(tableState.creatingRow)}
              name="active_from"
            />
          );
        },
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();
          return <span>{dateUtils.formatDate(value)}</span>;
        },
      },
      {
        accessorKey: "active_to",
        header: "To",
        size: 170,
        enableEditing: false,
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();
          return <span>{value ? dateUtils.formatDate(value) : "Today"}</span>;
        },
      },
    ],
    [fieldLabel, fieldName, options]
  );

  const handleEditRowSave: MRT_TableOptions<SpecialField>["onEditingRowSave"] =
    async ({ values, table, row }) => {
      await saveEntry(values, row.original.id);
      table.setEditingRow(null); //exit editing mode
    };

  const handleCreateRowSave: MRT_TableOptions<SpecialField>["onCreatingRowSave"] =
    async ({ values, table }) => {
      await saveEntry(values);
      table.setCreatingRow(null); //exit creating mode
    };

  const saveEntry = async (
    payload: SpecialField,
    objectId: number | undefined = undefined
  ) => {
    const data = {
      ...payload,
      entity,
      entity_id,
      field_name: fieldName,
    };

    if (objectId) {
      await specialFieldService.updateSpecialFieldEntry(data, objectId);
    } else {
      await specialFieldService.createSpecialFieldEntry(data);
    }
    getEntries();
    if (onSave) {
      onSave();
    }
  };

  const table = useMaterialReactTable({
    columns: columns,
    data: entries,
    state: {
      isLoading: loading,
    },
    enableSorting: false,
    enableBottomToolbar: false,
    editDisplayMode: "row",
    createDisplayMode: "row",
    enableFilters: false,
    enableGlobalFilter: false,
    enableEditing: true,
    positionActionsColumn: "last",
    enableHiding: false,
    enableStickyHeader: true,
    enableDensityToggle: false,
    enableColumnFilters: true,
    enableFullScreenToggle: false,
    enableColumnActions: false,
    enablePinning: false,
    enablePagination: false,
    getRowId: (originalRow) => originalRow.id?.toString() || "",
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        startIcon={<AddIcon fill={Palette.white} />}
        onClick={() => {
          table.setCreatingRow(true);
        }}
      >
        <ETCaption2 bold>New Entry</ETCaption2>
      </Button>
    ),
    muiTableBodyCellProps: {
      sx: {
        fontSize: "14px",
      },
    },
    muiTableHeadCellProps: {
      sx: {
        fontSize: "14px",
      },
    },
    onEditingRowSave: handleEditRowSave,
    onCreatingRowSave: handleCreateRowSave,
    renderRowActions: ({ row, table }) => (
      <IconButton
        onClick={() => {
          table.setEditingRow(row);
        }}
      >
        <EditIcon fill={Palette.primary.accent.main} />
      </IconButton>
    ),
    icons: {
      SaveIcon: (props: any) => (
        <CheckIcon {...props} fill={Palette.success.main} />
      ),
      CancelIcon: (props: any) => (
        <CancelIcon {...props} fill={Palette.error.main} />
      ),
    },
  });

  const tableState = table.getState();

  return (
    <Box
      sx={{
        ...Styles.flexStart,
        padding: "24px",
        flexDirection: "column",
        gap: "24px",
        borderRadius: "4px",
        border: `2px solid ${Palette.neutral.bg.dark}`,
        background: Palette.white,
        overflowX: "auto",
      }}
    >
      <Box
        sx={{
          ...Styles.flexStart,
          gap: "4px",
          alignSelf: "stretch",
          flexDirection: "column",
        }}
      >
        <ETParagraph bold color={Palette.neutral.accent.dark}>
          {title}
        </ETParagraph>
        <ETCaption3>{description}</ETCaption3>
      </Box>
      <Box sx={{ ...Styles.flexStart, flexDirection: "column", gap: "8px" }}>
        <MaterialReactTable table={table} />
      </Box>
    </Box>
  );
};
