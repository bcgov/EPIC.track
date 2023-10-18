import {
  Avatar,
  Box,
  Button,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

import React from "react";
import { styled } from "@mui/system";
import workService from "../../../services/workService/workService";
import { WorkplanContext } from "../WorkPlanContext";
import { MRT_ColumnDef } from "material-react-table";
import { ETCaption2, ETGridTitle } from "../../shared";
import MasterTrackTable from "../../shared/MasterTrackTable";
import { showNotification } from "../../shared/notificationProvider";
import {
  ACTIVE_STATUS,
  COMMON_ERROR_MESSAGE,
} from "../../../constants/application-constant";
import AddIcon from "@mui/icons-material/Add";
import { ActiveChip, InactiveChip } from "../../shared/chip/ETChip";
import TrackDialog from "../../shared/TrackDialog";
import NoDataEver from "../../shared/NoDataEver";
import TableFilter from "../../shared/filterSelect/TableFilter";
import { WorkFirstNation } from "../../../models/firstNation";
import FirstNationForm from "./FirstNationForm";
import Icons from "../../icons";
import { IconProps } from "../../icons/type";
import { Palette } from "../../../styles/theme";
import UserMenu from "../../shared/userMenu/UserMenu";
import { Staff } from "../../../models/staff";
import ImportFirstNation from "./ImportFirstNation";
import { getAxiosError } from "../../../utils/axiosUtils";
import projectService from "../../../services/projectService/projectService";

const DownloadIcon: React.FC<IconProps> = Icons["DownloadIcon"];
const ImportFileIcon: React.FC<IconProps> = Icons["ImportFileIcon"];

const IButton = styled(IconButton)({
  "& .icon": {
    fill: Palette.primary.accent.main,
  },
  "&:hover": {
    backgroundColor: Palette.neutral.bg.main,
    borderRadius: "4px",
  },
  "&.Mui-disabled": {
    pointerEvents: "auto",
    "& .icon": {
      fill: Palette.neutral.light,
    },
  },
});

const useStyles = makeStyles({
  userProfileWrapper: {
    display: "flex",
    alignItems: "center",
    gap: ".5rem",
    flex: "1 0 0",
    "&:hover": {
      "& $avatar": {
        backgroundColor: Palette.primary.main,
        color: Palette.white,
      },
    },
  },
  avatar: {
    backgroundColor: Palette.neutral.bg.main,
    color: Palette.neutral.accent.dark,
    fontSize: "1rem",
    lineHeight: "1.3rem",
    fontWeight: 700,
    width: "2rem",
    height: "2rem",
  },
  menu: {
    marginTop: ".5rem",
  },
});
const FirstNationList = () => {
  const classes = useStyles();
  const [workFirstNationId, setWorkFirstNationId] = React.useState<
    number | undefined
  >();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [showNationForm, setShowNationForm] = React.useState<boolean>(false);
  const [modalTitle, setModalTitle] = React.useState<string>("Add Nation");
  const ctx = React.useContext(WorkplanContext);
  const firstNations = React.useMemo(
    () => ctx.firstNations,
    [ctx.firstNations]
  );

  const [relationshipHolder, setRelationshipHolder] = React.useState<Staff>();
  const [statusOptions, setStatusOptions] = React.useState<string[]>([]);
  const [showImportNationForm, setShowImportNationForm] =
    React.useState<boolean>(false);
  const [firstNationAvailable, setFirstNationAvailable] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    if (workFirstNationId === undefined) {
      setModalTitle("Add Nation");
      return;
    }
    const firstNation = firstNations.find((fN) => fN.id === workFirstNationId);
    setModalTitle(firstNation?.indigenous_nation?.name || "");
  }, [workFirstNationId]);

  const pinOptions = React.useMemo(() => {
    return [
      {
        value: "Yes",
        label: "Yes",
      },
      {
        value: "No",
        label: "No",
      },
    ];
  }, []);

  React.useEffect(() => {
    setLoading(ctx.loading);
  }, []);

  const [userMenuAnchorEl, setUserMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);

  React.useEffect(() => {
    const statuses = firstNations
      .map((p) => p.status)
      .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
    setStatusOptions(statuses);
  }, [firstNations]);

  const getFirstNationAvailability = React.useCallback(async () => {
    const response = await projectService.checkFirstNationAvailability(
      Number(ctx.work?.project_id),
      Number(ctx.work?.id)
    );
    const firstNationStatus = response.data as any;
    setFirstNationAvailable(firstNationStatus["first_nation_available"]);
  }, [ctx.work?.project_id]);

  React.useEffect(() => {
    getFirstNationAvailability();
  }, [ctx.work?.project_id]);

  const handleOpenUserMenu = (
    event: React.MouseEvent<HTMLElement>,
    row: WorkFirstNation
  ) => {
    const staff = row.indigenous_nation.relationship_holder;
    setRelationshipHolder(staff);
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(null);
    setRelationshipHolder(undefined);
  };

  const columns = React.useMemo<MRT_ColumnDef<WorkFirstNation>[]>(
    () => [
      {
        accessorKey: "indigenous_nation.name",
        header: "Nation",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Search" },
        size: 250,
        Cell: ({ cell, row }) => (
          <ETGridTitle
            to="#"
            enableEllipsis
            onClick={(event: any) => onRowClick(event, row.original)}
            enableTooltip={true}
            tooltip={cell.getValue<string>()}
          >
            {cell.getValue<string>()}
          </ETGridTitle>
        ),
        sortingFn: "sortFn",
      },
      {
        accessorFn: (row) => row.pin,
        header: "PIN",
        size: 150,
        filterVariant: "multi-select",
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="pinFilter"
            />
          );
        },
        filterSelectOptions: pinOptions.map((p) => p.value),
        filterFn: "multiSelectFilter",
      },
      {
        accessorKey: "indigenous_nation.relationship_holder.full_name",
        header: "Relationship Holder",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Search" },
        Cell: ({ row }) => {
          const user = row.original.indigenous_nation.relationship_holder;
          if (user === undefined || user === null) return <></>;
          return (
            <Box
              className={classes.userProfileWrapper}
              onMouseEnter={(event) => handleOpenUserMenu(event, row.original)}
              onMouseLeave={handleCloseUserMenu}
              sx={{ height: "100%" }}
            >
              <Avatar className={classes.avatar}>
                <ETCaption2
                  bold
                >{`${user?.first_name[0]}${user?.last_name[0]}`}</ETCaption2>
              </Avatar>
              <Typography
                style={{
                  fontWeight: "400",
                  fontSize: "1rem",
                  lineHeight: "1.5rem",
                  color: Palette.neutral.dark,
                }}
                component="span"
              >
                {user.full_name}
              </Typography>
              <UserMenu
                anchorEl={userMenuAnchorEl}
                email={relationshipHolder?.email || ""}
                phone={relationshipHolder?.phone || ""}
                position={relationshipHolder?.position?.name || ""}
                firstName={relationshipHolder?.first_name || ""}
                lastName={relationshipHolder?.last_name || ""}
                onClose={handleCloseUserMenu}
                origin={{ vertical: "top", horizontal: "left" }}
                sx={{
                  marginTop: "2.1em",
                  pointerEvents: "none",
                }}
                id={`relationship_holder_${row.original.id}`}
              />
            </Box>
          );
        },
      },
      {
        accessorKey: "indigenous_nation.pip_link",
        header: "PIP Link",
        size: 150,
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Search" },
        Cell: ({ cell }) => (
          <>
            {cell.getValue<string>() && (
              <ETGridTitle
                to={cell.getValue<string>()}
                enableEllipsis
                enableTooltip={true}
                tooltip={cell.getValue<string>()}
                target="_blank"
                rel="noopener"
              >
                PIP Link
              </ETGridTitle>
            )}
          </>
        ),
      },
      {
        accessorKey: "status",
        header: "Active",
        size: 100,
        filterVariant: "multi-select",
        filterSelectOptions: statusOptions,
        filterFn: "multiSelectFilter",
        Cell: ({ cell }) => (
          <span>
            {cell.getValue<string>() === ACTIVE_STATUS.ACTIVE && (
              <ActiveChip label="Active" color="primary" />
            )}
            {cell.getValue<string>() === ACTIVE_STATUS.INACTIVE && (
              <InactiveChip label="Inactive" color="error" />
            )}
          </span>
        ),
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="statusFilter"
            />
          );
        },
      },
    ],
    [firstNations, userMenuAnchorEl, relationshipHolder]
  );

  const onCancelHandler = () => {
    setShowNationForm(false);
    setShowImportNationForm(false);
    setWorkFirstNationId(undefined);
  };

  const onRowClick = (event: any, row: WorkFirstNation) => {
    event.preventDefault();
    setWorkFirstNationId(row.id);
    setShowNationForm(true);
  };

  const onSave = () => {
    setShowNationForm(false);
    setWorkFirstNationId(undefined);
    getWorkFirstNations();
  };

  const onAddButtonClickHandler = () => {
    setShowNationForm(true);
  };

  const getWorkFirstNations = async () => {
    setLoading(true);
    try {
      const firstNationResult = await workService.getWorkFirstNations(
        Number(ctx.work?.id)
      );
      if (firstNationResult.status === 200) {
        const firstNations = (firstNationResult.data as WorkFirstNation[]).map(
          (p) => {
            return {
              ...p,
              status: p.is_active
                ? ACTIVE_STATUS.ACTIVE
                : ACTIVE_STATUS.INACTIVE,
            };
          }
        );
        ctx.setFirstNations(firstNations);
      }
    } catch (e) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
    setLoading(false);
  };

  const downloadPDFReport = React.useCallback(async () => {
    try {
      const binaryReponse = await workService.downloadFirstNations(
        Number(ctx.work?.id)
      );
      const url = window.URL.createObjectURL(
        new Blob([(binaryReponse as any).data])
      );
      const link = document.createElement("a");
      link.href = url;
      const fileName = `${ctx.work?.project.name}_${ctx.work?.title}_first_nations`;
      link.setAttribute("download", `${fileName}.xlsx`);
      document.body.appendChild(link);
      link.click();
      showNotification("File downloading completed", {
        type: "success",
      });
    } catch (error) {}
  }, [ctx.work?.id, ctx.selectedWorkPhase?.phase.id]);

  const onTemplateFormSaveHandler = async (firstNationIds: number[]) => {
    setShowImportNationForm(false);
    try {
      const result = await workService.importFirstNations(
        Number(ctx.work?.id),
        { indigenous_nation_ids: firstNationIds }
      );
      if (result.status === 200) {
        showNotification("First nations imported", {
          type: "success",
        });
        getWorkFirstNations();
      }
    } catch (e) {
      const error = getAxiosError(e);
      const message =
        error?.response?.status === 422
          ? error.response.data?.toString()
          : COMMON_ERROR_MESSAGE;
      showNotification(message, {
        type: "error",
      });
    }
  };

  return (
    <>
      {firstNations.length > 0 && (
        <Grid container rowSpacing={1}>
          <Grid item xs={6}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowNationForm(true)}
            >
              Add Nation
            </Button>
          </Grid>
          <Grid
            item
            xs={6}
            sx={{
              display: "flex",
              justifyContent: "right",
              gap: "0.5rem",
            }}
          >
            <Tooltip title={"Import tasks from template"}>
              <IButton
                onClick={() => setShowImportNationForm(true)}
                disabled={!firstNationAvailable}
              >
                <ImportFileIcon className="icon" />
              </IButton>
            </Tooltip>
            <Tooltip title="Export first nations to excel">
              <IButton onClick={downloadPDFReport}>
                <DownloadIcon className="icon" />
              </IButton>
            </Tooltip>
          </Grid>
          <Grid item xs={12}>
            <MasterTrackTable
              columns={columns}
              data={firstNations}
              enableTopToolbar={false}
              state={{
                isLoading: loading,
                showGlobalFilter: true,
              }}
            />
          </Grid>
        </Grid>
      )}
      {firstNations.length === 0 && (
        <NoDataEver
          title="You don't have any First Nations yet"
          subTitle="Add Nations or Import them from existing Works"
          addNewButtonText="Add Nation"
          isImportRequired
          onAddNewClickHandler={() => onAddButtonClickHandler()}
          importButtonText="Import Nations"
          onImportClickHandler={() => setShowImportNationForm(true)}
          isImportDisabled={!firstNationAvailable}
        />
      )}
      <TrackDialog
        open={showNationForm}
        dialogTitle={modalTitle}
        disableEscapeKeyDown
        fullWidth
        maxWidth="sm"
        okButtonText="Add"
        formId="work-first-nation-form"
        onCancel={() => onCancelHandler()}
        isActionsRequired
      >
        <FirstNationForm onSave={onSave} workNationId={workFirstNationId} />
      </TrackDialog>
      <TrackDialog
        open={showImportNationForm}
        dialogTitle="Import Nations"
        disableEscapeKeyDown
        fullWidth
        maxWidth="md"
        okButtonText="Import"
        formId="import-nations-form"
        isCancelRequired={true}
        onCancel={() => onCancelHandler()}
        isActionsRequired
        sx={{
          "& .MuiDialogContent-root": {
            padding: 0,
          },
        }}
      >
        <ImportFirstNation onSave={onTemplateFormSaveHandler} />
      </TrackDialog>
    </>
  );
};

export default FirstNationList;
