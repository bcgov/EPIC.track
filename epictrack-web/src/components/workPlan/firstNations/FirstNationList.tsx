import {
  FC,
  MouseEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Avatar,
  Button,
  Grid,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { workService } from "../../../services/workService/workService";
import { WorkplanContext } from "../WorkPlanContext";
import { MRT_ColumnDef } from "material-react-table";
import { ETCaption2, ETGridTitle, IButton } from "../../shared";
import MasterTrackTable from "../../shared/MasterTrackTable";
import { showNotification } from "../../shared/notificationProvider";
import {
  ACTIVE_STATUS,
  COMMON_ERROR_MESSAGE,
  ROLES,
} from "../../../constants/application-constant";
import AddIcon from "@mui/icons-material/Add";
import { ETChip } from "../../shared/chip/ETChip";
import TrackDialog from "../../shared/TrackDialog";
import NoDataEver from "../../shared/NoDataEver";
import {
  ConsultationLevel,
  WorkFirstNation,
} from "../../../models/firstNation";
import FirstNationForm from "./FirstNationForm";
import Icons from "../../icons";
import { IconProps } from "../../icons/type";
import { Palette } from "../../../styles/theme";
import UserMenu from "../../shared/userMenu/UserMenu";
import { Staff } from "../../../models/staff";
import ImportFirstNation from "./ImportFirstNation";
import { projectService } from "../../../services/projectService/projectService";
import { Restricted, hasPermission } from "../../shared/restricted";
import { getErrorMessage } from "../../../utils/axiosUtils";
import { useAppSelector } from "../../../hooks";
import { debounce } from "lodash";
import { basePIPUrl } from "../../../constants/application-constant";
import { getStatusFilter } from "components/shared/filterSelect/utils";

const DownloadIcon: FC<IconProps> = Icons["DownloadIcon"];
const ImportFileIcon: FC<IconProps> = Icons["ImportFileIcon"];

const FirstNationList = () => {
  const ctx = useContext(WorkplanContext);
  const [workFirstNationId, setWorkFirstNationId] = useState<
    number | undefined
  >();
  const [loading, setLoading] = useState<boolean>(true);
  const [showNationForm, setShowNationForm] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("Add Nation");
  const [consultationLevels, setConsultationLevels] = useState<
    ConsultationLevel[]
  >([]);
  const { roles } = useAppSelector((state) => state.user.userDetail);
  const userIsActiveTeamMember = ctx.isActiveTeamMember;
  const canEdit =
    userIsActiveTeamMember || hasPermission({ roles, allowed: [ROLES.EDIT] });

  const canCreate =
    userIsActiveTeamMember || hasPermission({ roles, allowed: [ROLES.CREATE] });

  const firstNations = useMemo(() => ctx.firstNations, [ctx.firstNations]);
  const firstNation = firstNations.find((fN) => fN.id === workFirstNationId);
  const [relationshipHolder, setRelationshipHolder] = useState<Staff>();
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [showImportNationForm, setShowImportNationForm] =
    useState<boolean>(false);
  const [firstNationAvailable, setFirstNationAvailable] =
    useState<boolean>(false);
  const menuHoverRef = useRef(false);

  useEffect(() => {
    if (workFirstNationId === undefined) {
      setModalTitle("Add Nation");
      return;
    }
    setModalTitle(firstNation?.indigenous_nation?.name || "");
  }, [firstNation, workFirstNationId]);

  useEffect(() => {
    setLoading(ctx.loading);
  }, [ctx.loading]);

  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(
    null,
  );

  const getStatusOptions = useCallback(() => {
    const statuses = firstNations
      .map((p) => p.status)
      .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
    setStatusOptions(statuses);
  }, [firstNations]);

  const getConsultationLevels = useCallback(() => {
    const levelMap = new Map();
    firstNations
      .map((firstNation) => firstNation.indigenous_consultation_level)
      .forEach((level) => {
        levelMap.set(level.id, level);
      });

    setConsultationLevels(Array.from(levelMap.values()));
  }, [firstNations]);

  useEffect(() => {
    getStatusOptions();
    getConsultationLevels();
  }, [firstNations, getConsultationLevels, getStatusOptions]);

  const getFirstNationAvailability = useCallback(async () => {
    const response = await projectService.checkFirstNationAvailability(
      Number(ctx.work?.project_id),
      Number(ctx.work?.id),
    );
    const firstNationStatus = response.data as any;
    setFirstNationAvailable(firstNationStatus["first_nation_available"]);
  }, [ctx.work]);

  useEffect(() => {
    getFirstNationAvailability();
  }, [ctx.work?.project_id, getFirstNationAvailability]);

  const handleOpenUserMenu = (
    event: MouseEvent<HTMLElement>,
    row: WorkFirstNation,
  ) => {
    const staff = row.indigenous_nation.relationship_holder;
    setRelationshipHolder(staff);
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = debounce(() => {
    if (!menuHoverRef.current) {
      setUserMenuAnchorEl(null);
      setRelationshipHolder(undefined);
    }
  }, 100);

  const columns = useMemo<MRT_ColumnDef<WorkFirstNation>[]>(
    () => [
      {
        accessorKey: "indigenous_nation.name",
        header: "Nation",
        muiTableHeadCellFilterTextFieldProps: { placeholder: "Search" },
        size: 250,
        Cell: canEdit
          ? ({ cell, row }) => (
              <ETGridTitle
                to="#"
                enableEllipsis
                onClick={(event: any) => onRowClick(event, row.original)}
                enableTooltip={true}
                tooltip={cell.getValue<string>()}
              >
                {cell.getValue<string>()}
              </ETGridTitle>
            )
          : undefined,
        sortingFn: "sortFn",
      },
      {
        accessorFn: (row) => row.indigenous_consultation_level.name,
        header: "Consultation",
        size: 150,
        filterVariant: "multi-select",
        Filter: getStatusFilter<WorkFirstNation>,
        filterSelectOptions: consultationLevels.map((level) => level.name),
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
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Avatar
                sx={{
                  backgroundColor: Palette.neutral.bg.main,
                  color: Palette.neutral.accent.dark,
                  fontSize: "1rem",
                  lineHeight: "1.3rem",
                  fontWeight: 700,
                  width: "2rem",
                  height: "2rem",
                }}
                onMouseEnter={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  handleCloseUserMenu.cancel();
                  handleOpenUserMenu(event, row.original);
                }}
                onMouseLeave={handleCloseUserMenu}
              >
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
            </Stack>
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
                to={basePIPUrl + cell.getValue<string>()}
                enableEllipsis
                enableTooltip={true}
                tooltip={basePIPUrl + cell.getValue<string>()}
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
        Filter: getStatusFilter<WorkFirstNation>,
        Cell: ({ cell }) => (
          <span>
            {cell.getValue<string>() === ACTIVE_STATUS.ACTIVE && (
              <ETChip active label="Active" />
            )}
            {cell.getValue<string>() === ACTIVE_STATUS.INACTIVE && (
              <ETChip inactive label="Inactive" />
            )}
          </span>
        ),
      },
    ],
    [canEdit, consultationLevels, handleCloseUserMenu, statusOptions],
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
        Number(ctx.work?.id),
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
          },
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

  const downloadPDFReport = useCallback(async () => {
    try {
      const binaryReponse = await workService.downloadFirstNations(
        Number(ctx.work?.id),
      );
      const url = window.URL.createObjectURL(
        new Blob([(binaryReponse as any).data]),
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
  }, [ctx.work?.id, ctx.work?.project.name, ctx.work?.title]);

  const onTemplateFormSaveHandler = async (firstNationIds: number[]) => {
    setShowImportNationForm(false);
    try {
      const result = await workService.importFirstNations(
        Number(ctx.work?.id),
        { indigenous_nation_ids: firstNationIds },
      );
      if (result.status === 200) {
        showNotification("First Nations imported", {
          type: "success",
        });
        getWorkFirstNations();
      }
    } catch (e) {
      const message = getErrorMessage(e);
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
            <Restricted
              allowed={[ROLES.CREATE]}
              exception={userIsActiveTeamMember}
              errorProps={{ disabled: true }}
            >
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowNationForm(true)}
              >
                Add Nation
              </Button>
            </Restricted>
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
            <Tooltip title={"Import Nations from existing Works"}>
              <span>
                <Restricted
                  allowed={[ROLES.CREATE]}
                  exception={userIsActiveTeamMember}
                  errorProps={{
                    disabled: true,
                  }}
                >
                  <IButton
                    onClick={() => setShowImportNationForm(true)}
                    disabled={!firstNationAvailable}
                  >
                    <ImportFileIcon className="icon" />
                  </IButton>
                </Restricted>
              </span>
            </Tooltip>
            <Tooltip title="Export first nations to excel">
              <span>
                <Restricted
                  allowed={[ROLES.CREATE]}
                  exception={userIsActiveTeamMember}
                  errorProps={{
                    disabled: true,
                  }}
                >
                  <IButton onClick={downloadPDFReport}>
                    <DownloadIcon className="icon" />
                  </IButton>
                </Restricted>
              </span>
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
          addButtonProps={{
            disabled: !canCreate,
          }}
          importButtonProps={{
            disabled: !firstNationAvailable || !canCreate,
          }}
        />
      )}
      <TrackDialog
        open={showNationForm}
        dialogTitle={modalTitle}
        disableEscapeKeyDown
        fullWidth
        maxWidth="sm"
        okButtonText={firstNation ? "Save" : "Add"}
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
        isOkRequired={false}
        externalSubmitButtonUsed={true}
        formId="import-nations-form"
        isCancelRequired={true}
        onCancel={() => onCancelHandler()}
        isActionsRequired
      >
        <ImportFirstNation onSave={onTemplateFormSaveHandler} />
      </TrackDialog>
      <UserMenu
        anchorEl={userMenuAnchorEl}
        email={relationshipHolder?.email || ""}
        phone={relationshipHolder?.phone || ""}
        position={relationshipHolder?.position?.name || ""}
        firstName={relationshipHolder?.first_name || ""}
        lastName={relationshipHolder?.last_name || ""}
        onClose={handleCloseUserMenu}
        onMouseEnter={(event) => {
          event.stopPropagation();
          event.preventDefault();
          handleCloseUserMenu.cancel();
          menuHoverRef.current = true;
        }}
        onMouseLeave={() => {
          menuHoverRef.current = false;
          handleCloseUserMenu();
        }}
        origin={{ vertical: "top", horizontal: "left" }}
        sx={{
          marginTop: "2.1em",
          pointerEvents: "none",
        }}
        id={`relationship_holder_${relationshipHolder?.id || ""}`}
      />
    </>
  );
};

export default FirstNationList;
