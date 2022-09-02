/* eslint-disable no-debugger */
import React, { useContext, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import IconButton from "apollo-react/components/IconButton";
import Trash from "apollo-react-icons/Trash";
import Button from "apollo-react/components/Button";
import PlusIcon from "apollo-react-icons/Plus";
import Typography from "apollo-react/components/Typography";
import Tooltip from "apollo-react/components/Tooltip";
import Rocket from "apollo-react-icons/Rocket";
import EllipsisVertical from "apollo-react-icons/EllipsisVertical";
import IconMenuButton from "apollo-react/components/IconMenuButton";
import FilterIcon from "apollo-react-icons/Filter";
import Modal from "apollo-react/components/Modal";
import Grid from "apollo-react/components/Grid";
import Loader from "apollo-react/components/Loader";
import Table, {
  createStringSearchFilter,
  compareStrings,
} from "apollo-react/components/Table";
import {
  fetchRoles,
  getUserStudyAndRoles,
  updateUserAssignments,
  deleteUserAssignments,
} from "../../../services/ApiServices";
import { MessageContext } from "../../../components/Providers/MessageProvider";
import { getStudyboardData } from "../../../store/actions/StudyBoardAction";
import { getInnerElOverflLimit, TextFieldFilter } from "../../../utils/index";
import {
  studyOptions,
  STUDY_IDS,
  STUDY_LABELS,
  ALL_NONE_STUDY_ERR_MSG,
} from "../helper";
import {
  formComponentActive,
  formComponentInActive,
  hideAppSwitcher,
} from "../../../store/actions/AlertActions";
import AlertBox from "../../AlertBox/AlertBox";

const UserAssignmentTable = ({
  updateChanges,
  userId,
  targetUser,
  showRolePopup,
  setShowRolePopup,
  userUpdating,
  readOnly,
  canUpdate,
  updateInProgress,
  setParentLoading,
  setEditMode,
  isEditMode,
  unblockRouter,
  setAddNewModalClick,
  cancelEditMode,
  setCancelEditMode,
}) => {
  const toast = useContext(MessageContext);
  const dispatch = useDispatch();
  const studyData = useSelector((state) => state.studyBoard);

  const [load, setLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [studyList, setStudyList] = useState([]);
  const [tableStudies, setTableStudies] = useState([]);
  const [initialTableRoles, setInitialTableRoles] = useState({});
  const [initialRender, setInitialRender] = useState(true);
  const [roleLists, setroleLists] = useState([]);
  const [allRoleLists, setAllRoleLists] = useState([]);
  const [initialFilterRole, setInitialFilterRole] = useState([]);
  const [lastEditedRecordIndex, setlastEditedRecordData] = useState(null);
  const [showEmptyTable, setShowEmptyTable] = useState(false);

  const [showCancelRowModal, setShowCancelRowModal] = useState(false);
  const [localRowIndex, setLocalRowIndex] = useState(null);

  const [showUserAssignmentModal, setUserAssignmentModal] = useState(false);
  const tableRef = useRef(null);
  const getStudyObj = () => {
    const rowIndex = Math.max(...tableStudies.map((o) => o.index), 0) + 1;
    return {
      index: rowIndex + 1,
      prot_nbr_stnd: "",
      prot_id: "",
      roles: [],
      isEdit: false,
    };
  };

  const MultiSelectFilter = ({ accessor, filters, updateFilterValue }) => {
    const [filterRole, setFilterRole] = useState(initialFilterRole);
    const updateTableStudies = (e) => {
      setInitialFilterRole([...filterRole]);
      // filters.roles = filterRole.map((r) => r.label);
      updateFilterValue(e);
    };
    const editRow = (e, v, r) => {
      setFilterRole([...v]);
      // if (r === "remove-option") {
      //   filters.roles = v.map((ve) => ve.label);
      //   updateFilterValue(e);
      // }
      filters.roles = v.map((ve) => ve.label);
      updateFilterValue(e);
    };
    return (
      <AutocompleteV2
        placeholder="Choose one or more roles to filter"
        size="small"
        fullWidth
        multiple
        forcePopupIcon
        showCheckboxes
        chipColor="white"
        source={roleLists}
        limitChips={5}
        name="roles"
        value={filterRole}
        onChange={(e, v, r) => editRow(e, v, r)}
        onBlur={(e) => updateTableStudies(e)}
        filterSelectedOptions={false}
        blurOnSelect={false}
        clearOnBlur={false}
        disableCloseOnSelect
        alwaysLimitChips
        enableVirtualization
      />
    );
  };

  const compareStringOfArraySearchFilter = (accessor) => {
    return (row, filters) => {
      if (!filters[accessor]) {
        return true;
      }

      if (!row[accessor]) {
        return false;
      }

      const rowArray = row.roles.map((e) => e.label.toUpperCase());
      const filterVal = filters.roles
        ? filters.roles.map((e) => e.toUpperCase())
        : [];
      if (filterVal.length) {
        return filterVal.some((e) => rowArray.includes(e));
      }
      return true;
    };
  };

  const getRoles = async () => {
    const result = await fetchRoles();
    setAllRoleLists(result || []);
  };

  const getStudyList = async () => {
    const data = [...studyData?.studyboardData];
    const filtered =
      data
        .filter((study) => {
          return study?.onboardingprogress?.toLowerCase() === "success";
        })
        .map((study) => {
          return {
            ...study,
            label: `${study.protocolnumber}`,
          };
        }) || [];
    filtered.sort(function (a, b) {
      if (a.prot_nbr_stnd < b.prot_nbr_stnd) {
        return -1;
      }
      if (a.prot_nbr_stnd > b.prot_nbr_stnd) {
        return 1;
      }
      return 0;
    });
    setStudyList([...studyOptions, ...filtered]);
  };

  useEffect(() => {
    getStudyList();
  }, [studyData]);

  const StudySelected = ({ isEdit, row }) => {
    const protId = row?.prot_id;
    if (protId === STUDY_IDS.ALL_STUDY) {
      return <div className={isEdit}>{STUDY_LABELS.ALL_STUDY}</div>;
    }
    if (protId === STUDY_IDS.NO_STUDY) {
      return <div className={isEdit}>{STUDY_LABELS.NO_STUDY}</div>;
    }
    return <div className={isEdit}>{row?.prot_nbr || ""}</div>;
  };
  const showToolTip = {};
  const RolesSelected = ({ row, roles }) => {
    const uRoles = roles.length
      ? roles
          .map((e) => e.label)
          .sort((a, b) => {
            return a.localeCompare(b, undefined, { sensitivity: "base" });
          })
          .join(", ")
      : "";
    const charLimit = getInnerElOverflLimit(
      tableRef.current ? tableRef.current.offsetWidth : 0,
      "65%"
    );
    const showRoletooltip = (rowIndex, boolVal) => {
      showToolTip[rowIndex] = boolVal;
    };
    return (
      <div
        onMouseEnter={() => showRoletooltip(row.index, true)}
        onMouseLeave={() => showRoletooltip(row.index, false)}
      >
        {!showToolTip[row.index] && (
          <Tooltip
            variant="dark"
            title={uRoles}
            placement="left"
            className="role-elipsis"
            // style={{ marginRight: 48 }}
            open={uRoles && uRoles.length > charLimit && showToolTip[row.index]}
          >
            <Typography variant="body2" className="">
              {uRoles && uRoles.length > charLimit
                ? `${uRoles.slice(0, charLimit)} [...]`
                : uRoles}
            </Typography>
          </Tooltip>
        )}
      </div>
    );
  };

  const ViewStudy = ({ row, column: { accessor: key } }) => {
    const isEdit = row?.isEdit ? "editable-row" : "";
    return (
      <div className="study">
        <StudySelected isEdit={isEdit} row={row} />
      </div>
    );
  };

  const validateAllStudyNoStudy = (currentRowData, moreStudies = []) => {
    if (!currentRowData) {
      return "";
    }
    if (currentRowData?.prot_id === STUDY_IDS.ALL_STUDY) {
      const noStudyRowData = [...tableStudies, ...moreStudies].find(
        (e) => e?.prot_id === STUDY_IDS.NO_STUDY
      );
      const commonRoles = currentRowData?.roles.filter((i) => {
        return !!noStudyRowData?.roles.find((j) => j.value === i.value);
      });
      if (commonRoles?.length) {
        return `${commonRoles
          .map((r) => r.label)
          .join(", ")} ${ALL_NONE_STUDY_ERR_MSG}`;
      }
      return "";
    }
    if (currentRowData?.prot_id === STUDY_IDS.NO_STUDY) {
      const allStudyRowData = [...tableStudies, ...moreStudies].find(
        (e) => e?.prot_id === STUDY_IDS.ALL_STUDY
      );
      const commonRoles = currentRowData?.roles.filter((i) => {
        return !!allStudyRowData?.roles.find((j) => j.value === i.value);
      });
      if (commonRoles?.length) {
        return `${commonRoles
          .map((r) => r.label)
          .join(", ")} ${ALL_NONE_STUDY_ERR_MSG}`;
      }
      return "";
    }
    return "";
  };

  const ViewRoles = ({ row, column }) => {
    const tableIndex = tableStudies.findIndex((el) => el.index === row.index);
    const currentRowData = tableStudies[tableIndex];
    const [viewRoleValue, setViewRoleValue] = useState(
      currentRowData?.roles || []
    );
    const editViewRow = (e, v, r) => {
      setViewRoleValue([...v]);
      if (r === "remove-option") {
        const copy = [...tableStudies];
        copy[tableIndex].roles = [...v];
        setTableStudies(copy);
      }
    };
    const updateTableStudies = (v) => {
      const copy = [...tableStudies];
      copy[tableIndex].roles = [...v];
      setTableStudies(copy);
    };

    const getErrorText = () => {
      if (!viewRoleValue.length) {
        return "A role is required";
      }

      return validateAllStudyNoStudy(currentRowData);
    };

    return (
      <div className="role">
        {row.isEdit ? (
          <AutocompleteV2
            placeholder={
              !viewRoleValue.length ? "Choose one or more roles" : ""
            }
            size="small"
            fullWidth
            multiple
            forcePopupIcon
            showCheckboxes
            chipColor="white"
            source={allRoleLists}
            limitChips={5}
            value={viewRoleValue}
            onChange={(e, v, r) => editViewRow(e, v, r)}
            onBlur={() => updateTableStudies(viewRoleValue)}
            filterSelectedOptions={false}
            blurOnSelect={false}
            clearOnBlur={false}
            disableCloseOnSelect
            alwaysLimitChips
            enableVirtualization
            error={getErrorText().length}
            helperText={getErrorText()}
          />
        ) : (
          <RolesSelected row={row} column={column} roles={row?.roles || []} />
        )}
      </div>
    );
  };

  const editRowFn = (rowIndex, editMode) => {
    const prevTableStudies = [...tableStudies];
    prevTableStudies[rowIndex] = { ...prevTableStudies[rowIndex] };
    prevTableStudies[rowIndex].isEdit = editMode;
    prevTableStudies[rowIndex].roles = prevTableStudies[rowIndex]?.roles?.sort(
      (a, b) => a?.label?.localeCompare(b?.label)
    );
    setTableStudies([...prevTableStudies]);
  };

  const updateEditMode = (rowIndex, editMode, isDelete) => {
    if (isDelete === true) {
      editRowFn(rowIndex, editMode);
    } else if (typeof lastEditedRecordIndex !== "number") {
      /* eslint-disable */
      setlastEditedRecordData(rowIndex);
      if (editMode) {
        setEditMode(true);
        dispatch(formComponentActive());
      }
      editRowFn(rowIndex, editMode);
    } else {
      editRowFn(rowIndex, editMode);
      setlastEditedRecordData(null);
      setEditMode(undefined);
      let isEditOpen = false;
      tableStudies?.forEach((study) => {
        if (!isEditOpen && study?.isEdit === true) {
          isEditOpen = true;
        }
      });
      if (!isEditOpen) {
        unblockRouter();
      }
      // dispatch(formComponentInActive());
      // dispatch(hideAppSwitcher());
    }
  };

  useEffect(() => {
    if (isEditMode === false) {
      updateEditMode(lastEditedRecordIndex, false);
    }
  }, [isEditMode]);

  // cancel row button
  const cancelRowButton = () => {
    updateInProgress(false);
    tableStudies[localRowIndex].roles =
      initialTableRoles[tableStudies[localRowIndex].prot_id];
    setTableStudies([...tableStudies]);
    updateEditMode(localRowIndex, false);
    dispatch(formComponentInActive());
    setShowCancelRowModal(false);
  };

  const onVieweStudyDelete = async (rowIndex) => {
    const email = targetUser.usr_mail_id;
    const uid = targetUser?.sAMAccountName;

    // const formattedRows = [
    //   {
    //     protocolname: tableStudies[rowIndex].prot_nbr_stnd,
    //     id: tableStudies[rowIndex].prot_id,
    //     roles: tableStudies[rowIndex].roles.map((r) => r.label),
    //   },
    // ];
    // const newFormattedRows = formattedRows.find((e) => e.id);
    const formattedRows = [...tableStudies];
    formattedRows.splice(rowIndex, 1);
    const newFormattedRows = formattedRows
      .map((e) => ({
        protocolname: e.prot_nbr_stnd,
        id: e.prot_id,
        roles: e.roles.map((r) => r.value),
        roleIds: e.roles.map((r) => r.value),
        isValid: true,
      }))
      .filter((e) => e.id);

    if (!newFormattedRows?.length) {
      toast.showErrorMessage(
        "At least one assignment is required. Add a new assignment before deleting."
      );
      return;
    }

    setLoad(false);
    setParentLoading(true);

    const insertUserStudy = {
      email,
      protocols: newFormattedRows,
    };

    let payload = {};
    const splittedNames = targetUser?.displayName?.split(", ") || [];
    const firstName =
      targetUser.givenName ||
      (splittedNames.length === 2 ? splittedNames[1] : splittedNames[0]);
    const lastName = targetUser.sn || splittedNames[0];
    payload = {
      firstName,
      lastName,
      uid,
      ...insertUserStudy,
    };

    const response = await updateUserAssignments(payload);

    // const response = await deleteUserAssignments(payload);
    if (response.status) {
      updateEditMode(rowIndex, false, true);
      // toast.showSuccessMessage(
      //   response.message || "Assignment Deleted Successfully!"
      // );
      // updateEditMode(rowIndex, false);
      toast.showSuccessMessage("Assignment removed successfully.");
      const prevTableStudies = [...tableStudies];
      prevTableStudies.splice(rowIndex, 1);
      const updatedTableStudies = prevTableStudies.map((e, i) => ({
        ...e,
        index: i + 1,
      }));
      setTableStudies([...updatedTableStudies, getStudyObj()]);
    } else {
      toast.showErrorMessage(
        response.message || "Error in Assignment Deletion!"
      );
    }
    setLoad(true);
    setParentLoading(false);
  };

  const DeleteViewStudy = ({ row }) => {
    const [localSave, setLocalSave] = useState(false);
    if (targetUser?.usr_stat !== "Active" || readOnly) return false;
    const rowIndex = tableStudies.findIndex((e) => e.prot_id === row.prot_id);
    const handleMenuClick = (label) => () => {
      if (label === "edit") {
        // Edit Single Row
        setTableStudies((prev) =>
          prev.map((x) => {
            if (x.isEdit) {
              const roles = initialTableRoles[x.prot_id] || x.roles;
              return {
                ...x,
                isEdit: false,
                roles: roles,
              };
            } else if (x.index === rowIndex) {
              return {
                ...x,
                isEdit: true,
              };
            }
            return x;
          })
        );
        // Edit Single Row end

        updateInProgress(true);
        setInitialTableRoles({
          ...initialTableRoles,
          [tableStudies[rowIndex].prot_id]: tableStudies[rowIndex].roles,
        });
        // updateEditMode(rowIndex, true); Commented For edit single row
        setlastEditedRecordData(rowIndex);
        setEditMode(true);
        dispatch(formComponentActive());
        dispatch(hideAppSwitcher());
      } else {
        onVieweStudyDelete(rowIndex);
      }
    };

    const cancelEdit = (fromModal = false) => {
      if (!fromModal) {
        setShowCancelRowModal(true);
        setLocalRowIndex(rowIndex);
      } else if (fromModal) {
        updateInProgress(false);
        tableStudies[rowIndex].roles =
          initialTableRoles[tableStudies[rowIndex].prot_id];
        setTableStudies([...tableStudies]);
        updateEditMode(rowIndex, false);
        dispatch(formComponentInActive());
      }
    };

    const saveEdit = async (viewRow) => {
      updateInProgress(false);
      setParentLoading(false);
      setLocalSave(true);
      setLoad(true);

      const allStudyNoStudyError = validateAllStudyNoStudy(viewRow);

      if (!viewRow.roles.length) {
        toast.showErrorMessage("A role is required");
      } else if (allStudyNoStudyError.length) {
        toast.showErrorMessage(allStudyNoStudyError);
      } else {
        setLoading(true);
        // const removedRoles = initialTableRoles[viewRow.prot_id].filter(
        //   (e) => viewRow.roles.map((r) => r.value).indexOf(e.value) === -1
        // );
        const email = targetUser.usr_mail_id;
        const uid = targetUser?.sAMAccountName;
        // const formattedRows = [
        //   {
        //     protocolname: tableStudies[rowIndex].prot_nbr_stnd,
        //     id: tableStudies[rowIndex].prot_id,
        //     roles: tableStudies[rowIndex].roles.map((r) => r.value),
        //     roleIds: tableStudies[rowIndex].roles.map((r) => r.value),
        //     isValid: true,
        //   },
        // ];
        // let removedProtocols = [];
        // if (removedRoles.length) {
        //   removedProtocols = [
        //     {
        //       protocolname: tableStudies[rowIndex].prot_nbr_stnd,
        //       id: tableStudies[rowIndex].prot_id,
        //       roles: removedRoles.map((r) => r.value),
        //       roleIds: removedRoles.map((r) => r.value),
        //       isValid: true,
        //     },
        //   ];
        // }
        // const newFormattedRows = formattedRows.filter((e) => e.id);
        const newFormattedRows = tableStudies
          .map((e) => ({
            protocolname: e.prot_nbr_stnd,
            id: e.prot_id,
            roles: e.roles.map((r) => r.value),
            roleIds: e.roles.map((r) => r.value),
            isValid: true,
          }))
          .filter((e) => e.id);

        const insertUserStudy = {
          email,
          protocols: newFormattedRows,
          // removedProtocols,
        };
        let payload = {};
        const splittedNames = targetUser?.displayName?.split(", ") || [];
        const firstName =
          targetUser.givenName ||
          (splittedNames.length === 2 ? splittedNames[1] : splittedNames[0]);
        const lastName = targetUser.sn || splittedNames[0];
        payload = {
          firstName,
          lastName,
          uid,
          ...insertUserStudy,
        };
        const response = await updateUserAssignments(payload);
        setLoading(false);
        if (response.status) {
          let isEditOpen = false;
          tableStudies?.forEach((study) => {
            if (
              !isEditOpen &&
              study?.isEdit === true &&
              study?.prot_id !== viewRow.prot_id
            ) {
              isEditOpen = true;
            }
          });
          if (!isEditOpen) {
            setEditMode(false);
            dispatch(formComponentInActive());
            dispatch(hideAppSwitcher());
          }
          updateEditMode(rowIndex, false);
          getUserStudyRoles();
          toast.showSuccessMessage(response.message || "Updated Successfully!");
        } else {
          toast.showErrorMessage(response.message || "Error in update!");
        }
      }

      setLocalSave(false);
      setParentLoading(false);
    };
    const menuItems = [
      {
        text: "Edit",
        onClick: handleMenuClick("edit"),
      },
      {
        text: "Remove",
        onClick: handleMenuClick("remove"),
      },
    ];

    return (
      <>
        {row.isEdit ? (
          <div className="flex flex-end w-100">
            <Button
              variant="secondary"
              size="small"
              style={{ marginRight: 10 }}
              onClick={() => cancelEdit()}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="small"
              style={{ marginRight: 10 }}
              onClick={() => saveEdit(row)}
              disabled={userUpdating || localSave}
            >
              Save
            </Button>
          </div>
        ) : (
          <div className="flex flex-end w-100">
            {canUpdate && (
              <Tooltip title="Actions" disableFocusListener>
                <IconMenuButton
                  id="actions-2"
                  menuItems={menuItems}
                  size="small"
                >
                  <EllipsisVertical className="cursor-pointer" />
                </IconMenuButton>
              </Tooltip>
            )}
          </div>
        )}
      </>
    );
  };

  const getUserStudyRoles = async () => {
    const userStudy = await getUserStudyAndRoles(userId);
    if (userStudy.status) {
      const userSutdyRes = userStudy.data.map((e, i) => ({
        ...e,
        index: i,
        isEdit: false,
      }));
      let allUsersRolesFlat = [];
      userSutdyRes.map((e) => {
        e.roles.map((r) => {
          allUsersRolesFlat.push(r);
          return r;
        });
        return e;
      });

      allUsersRolesFlat = allUsersRolesFlat.filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.value === value.value)
      );
      allUsersRolesFlat = allUsersRolesFlat.sort(function (a, b) {
        if (a.label?.toLowerCase() < b.label?.toLowerCase()) {
          return -1;
        }
        if (a.label?.toLowerCase() > b.label?.toLowerCase()) {
          return 1;
        }
        return 0;
      });

      setroleLists(allUsersRolesFlat);
      setTableStudies([...userSutdyRes, getStudyObj()]);
    }
    setLoad(true);
  };

  useEffect(() => {
    if (userUpdating === false) {
      getUserStudyRoles();
    }
  }, [userUpdating]);

  useEffect(() => {
    dispatch(getStudyboardData());
    getRoles();
  }, []);

  const setUserAssignmentCstmBtn = () => {
    if (isEditMode) {
      setAddNewModalClick(true);
    } else {
      setUserAssignmentModal(true);
    }
  };

  useEffect(() => {
    if (cancelEditMode) {
      setUserAssignmentModal(true);
      const prevTableStudies = [...tableStudies];
      for (let [i, value] of prevTableStudies.entries()) {
        prevTableStudies[i].isEdit = false;
        if (initialTableRoles.hasOwnProperty(prevTableStudies[i]?.prot_id)) {
          let rolesData = initialTableRoles[prevTableStudies[i]?.prot_id];
          console.log(rolesData);
          prevTableStudies[i].roles = rolesData?.sort((a, b) =>
            a?.label?.localeCompare(b?.label)
          );
        } else {
          prevTableStudies[i].roles = prevTableStudies[i]?.roles?.sort((a, b) =>
            a?.label?.localeCompare(b?.label)
          );
        }
      }
      setTableStudies([...prevTableStudies]);
      setEditMode(false);
      setAddNewModalClick(false);
      setlastEditedRecordData(null);
      setCancelEditMode(false);
    }
  }, [cancelEditMode]);

  const CustomButtonHeader = ({ toggleFilters }) => {
    return (
      <div>
        {
          <>
            {targetUser?.usr_stat === "Active" && canUpdate && (
              <Button
                size="small"
                variant="secondary"
                icon={<PlusIcon size="small" />}
                disabled={userUpdating}
                onClick={() => setUserAssignmentCstmBtn()}
              >
                Add user assignment
              </Button>
            )}

            <Button
              size="small"
              className="ml-3"
              variant="secondary"
              icon={FilterIcon}
              onClick={toggleFilters}
              // disabled={targetUser?.usr_stat === "InActive"}
              disabled={userUpdating}
            >
              Filter
            </Button>
          </>
        }
      </div>
    );
  };

  const customProtocolSortFunction = (accessor, sortOrder) => {
    const POINTS = {
      [STUDY_IDS.ALL_STUDY]: "000000001",
      [STUDY_IDS.NO_STUDY]: "000000002",
    };
    return (rowA, rowB) => {
      let result;
      const stringA = rowA[accessor]?.toLowerCase() || POINTS[rowA["prot_id"]];
      const stringB = rowB[accessor]?.toLowerCase() || POINTS[rowB["prot_id"]];

      if (stringA < stringB) {
        result = -1;
      } else if (stringA > stringB) {
        result = 1;
      } else {
        return 0;
      }

      return sortOrder === "asc" ? result : -result;
    };
  };

  const columns = [
    {
      header: "Protocol Number",
      accessor: "prot_nbr_stnd",
      width: "30%",
      customCell: ViewStudy,
      sortFunction: customProtocolSortFunction,
      filterFunction: createStringSearchFilter("prot_nbr_stnd"),
      filterComponent: TextFieldFilter,
    },
    {
      header: "Role",
      accessor: "roles",
      width: "67%",
      customCell: ViewRoles,
      filterFunction: compareStringOfArraySearchFilter("roles"),
      filterComponent: MultiSelectFilter,
    },
    {
      header: "",
      accessor: "delete",
      width: "3%",
      customCell: DeleteViewStudy,
    },
  ];

  const createUserAndAssignStudies = async (rowsToUpdate, setIsLoading) => {
    setParentLoading(true);
    const email = targetUser.usr_mail_id;
    const uid = targetUser?.sAMAccountName;
    const formattedRows = rowsToUpdate.map((e) => {
      return {
        protocolname: e?.prot_nbr_stnd,
        id: e?.prot_id,
        roles: e.roles.map((r) => r.value),
        roleIds: e.roles.map((r) => r.value),
        isValid: true,
      };
    });

    const newFormattedRows = formattedRows.filter((e) => e.id);

    const emptyRoles = newFormattedRows.filter((x) => x.roles.length === 0);
    if (!newFormattedRows.length || emptyRoles.length) {
      setIsLoading(false);
      toast.showErrorMessage(
        `This assignment is incomplete. Please select a study and a role to continue.`
      );
    } else {
      const existingRows = tableStudies
        .map((e) => ({
          protocolname: e.prot_nbr_stnd,
          id: e.prot_id,
          roles: e.roles.map((r) => r.value),
          roleIds: e.roles.map((r) => r.value),
          isValid: true,
        }))
        .filter((e) => e.id);

      const insertUserStudy = {
        email,
        protocols: [...existingRows, ...newFormattedRows],
      };

      let payload = {};
      const splittedNames = targetUser?.displayName?.split(", ") || [];
      const firstName =
        targetUser.givenName ||
        (splittedNames.length === 2 ? splittedNames[1] : splittedNames[0]);
      const lastName = targetUser.sn || splittedNames[0];
      payload = {
        firstName,
        lastName,
        uid,
        ...insertUserStudy,
      };
      const response = await updateUserAssignments(payload);
      if (response.status === 1) {
        setUserAssignmentModal(false);
        rowsToUpdate.map((e) => ({
          ...e,
          roles: e.roles.sort((a, b) => a.label.localeCompare(b.label)),
        }));
        setTableStudies([...tableStudies, ...rowsToUpdate]);
        toast.showSuccessMessage(response.message);
      } else {
        toast.showErrorMessage(response.message);
      }
      setIsLoading(false);
    }
    setParentLoading(false);
  };

  const AssignmentInfoModal = React.memo(({ open, cancel, loading }) => {
    let rolesCount = 0;
    tableStudies.map((a) => {
      rolesCount += a.roles.length;
      return false;
    });
    return (
      <Modal
        open={open}
        onClose={cancel}
        className="save-confirm"
        variant="default"
        title="Removed assignments"
        buttonProps={[
          {
            variant: "primary",
            label: "Dismiss",
            onClick: cancel,
            disabled: loading,
          },
        ]}
        id="neutral2"
      >
        <Typography gutterBottom>
          {`${tableStudies.length} assignments were removed from ${rolesCount} studies as the Roles are now inactive:`}
          <br />
          <Grid container spacing={2}>
            {tableStudies.map((study) => {
              return (
                <>
                  <Grid item xs={5}>
                    {study.prot_nbr_stnd}
                  </Grid>
                  <Grid item xs={7}>
                    {study.roles.map((r) => r.label).join(", ")}
                  </Grid>
                </>
              );
            })}
          </Grid>
        </Typography>
      </Modal>
    );
  });

  const UserAssignmentModal = React.memo(({ open, cancel, loading }) => {
    const getModalStudyObj = (rowIndex = -1) => {
      return {
        index: rowIndex + 1,
        prot_nbr_stnd: "",
        prot_id: "",
        roles: [],
        alreadyExist: false,
      };
    };
    const lineRefs = React.useRef([React.createRef()]);
    const [lastEditedRow, setLastEditedRow] = useState();
    const [isLoading, setIsLoading] = useState(false);

    const [modalTableStudies, setModalTableStudies] = useState([
      getModalStudyObj(),
    ]);
    const [disableSaveBtn, setDisableSaveBtn] = useState(true);

    const editModalStudyRow = (e, value, reason, index, key) => {
      if (value) {
        setDisableSaveBtn(true);
        const tempModalTableStudies = modalTableStudies.map((s) => ({
          ...s,
          alreadyExist: false,
        }));
        const duplicateIndex1 = tempModalTableStudies.findIndex(
          (s) => s.prot_id === value?.prot_id
        );
        const duplicateIndex2 = tableStudies.findIndex(
          (s) => s.prot_id === value?.prot_id
        );
        tempModalTableStudies[index].protocolname = value?.prot_nbr_stnd;
        tempModalTableStudies[index].prot_nbr_stnd = value?.prot_nbr_stnd;
        tempModalTableStudies[index].prot_id = value?.prot_id;
        if (duplicateIndex1 > -1 || duplicateIndex2 > -1) {
          tempModalTableStudies[index].alreadyExist = true;
          setModalTableStudies([...tempModalTableStudies]);
        } else if (
          tempModalTableStudies[tempModalTableStudies.length - 1].index ===
          index
        ) {
          tempModalTableStudies.push({
            ...getModalStudyObj(index),
          });
          lineRefs.current = tempModalTableStudies.map((_, i) =>
            React.createRef()
          );
          setModalTableStudies([...tempModalTableStudies]);
          setTimeout(() => {
            lineRefs.current[
              index
            ].current?.childNodes[0]?.childNodes[0]?.childNodes[0]?.childNodes[1]?.childNodes[1]?.click();
          }, 500);
        } else {
          setModalTableStudies([...tempModalTableStudies]);
          setTimeout(() => {
            lineRefs.current[
              index
            ].current.childNodes[0].childNodes[0].childNodes[0].childNodes[2]?.childNodes[1]?.click();
          }, 500);
        }
      }
    };

    const EditableStudy = ({ row, column: { accessor: key } }) => {
      const editStudyRowIndex = studyList.findIndex((e) => e[key] === row[key]);
      return (
        <div className="study mr-4">
          <AutocompleteV2
            placeholder="Add new study and role"
            matchFrom="any"
            size="small"
            fullWidth
            forcePopupIcon
            source={studyList}
            value={studyList[editStudyRowIndex]}
            onChange={(e, v, r) => editModalStudyRow(e, v, r, row.index, key)}
            enableVirtualization
            error={
              row.alreadyExist ||
              (!initialRender &&
                !row[key] &&
                row.index !==
                  modalTableStudies[modalTableStudies.length - 1].index)
            }
            helperText={
              row.alreadyExist
                ? "Study already has assignments. Select a different study"
                : !initialRender &&
                  !row[key] &&
                  row.index !==
                    modalTableStudies[modalTableStudies.length - 1].index &&
                  "Required"
            }
          />
        </div>
      );
    };

    const EditableRoles = ({ row, column: { accessor: key } }) => {
      const tableIndex = modalTableStudies.findIndex(
        (el) => el.index === row.index
      );

      const currentRowData = modalTableStudies[tableIndex];
      const restModalTableStudies = [...modalTableStudies];

      restModalTableStudies.splice(tableIndex, 1);

      const [value, setValue] = useState(
        modalTableStudies[tableIndex]?.roles || []
      );

      const setLastEdited = (i) => {
        if (
          row.prot_id === STUDY_IDS.ALL_STUDY ||
          row.prot_id === STUDY_IDS.NO_STUDY
        ) {
          setLastEditedRow(i);
        }
      };
      if (row.index === modalTableStudies[modalTableStudies.length - 1]?.index)
        return false;

      const editModalRoleRow = (e, v, r) => {
        if (r === "remove-option") {
          setDisableSaveBtn(v.length ? false : true);
          const copy = [...modalTableStudies];
          copy[tableIndex].roles = [...v];
          if (!v.length) {
            copy[tableIndex].roleError = true;
          }
          setModalTableStudies(copy);
          setLastEdited(tableIndex);
          setLastEditedRow(v.length);
        }
        setValue([...v]);
      };
      const updateTableStudies = (v) => {
        const copy = [...modalTableStudies];
        copy[tableIndex].roles = [...v];
        setModalTableStudies(copy);
        setDisableSaveBtn(v.length ? false : true);
        setLastEdited(tableIndex);
      };

      const getErrorText = () => {
        return validateAllStudyNoStudy(currentRowData, restModalTableStudies);
      };
      return (
        <div className="role">
          <AutocompleteV2
            ref={lineRefs.current[row.index]}
            placeholder={!value.length ? "Choose one or more roles" : ""}
            size="small"
            fullWidth
            multiple
            forcePopupIcon
            showCheckboxes
            chipColor="white"
            source={allRoleLists}
            limitChips={5}
            value={value}
            onChange={(e, v, r) => editModalRoleRow(e, v, r)}
            onBlur={() => updateTableStudies(value)}
            filterSelectedOptions={false}
            blurOnSelect={false}
            clearOnBlur={false}
            disableCloseOnSelect
            alwaysLimitChips
            enableVirtualization
            error={
              (row.roleError && row.roles.length === 0) || getErrorText().length
            }
            helperText={
              (row.roleError && row.roles.length === 0 && "Select a role") ||
              (lastEditedRow === tableIndex ? getErrorText() : "")
            }
          />
        </div>
      );
    };

    const onModalRowDelete = (index) => {
      let prevTableStudies = [...modalTableStudies];
      const tableIndex = modalTableStudies.findIndex(
        (el) => el.index === index
      );
      const tableDuplicateIndex = prevTableStudies.findIndex(
        (el) =>
          prevTableStudies[tableIndex]?.prot_id === el?.prot_id &&
          el.index !== index
      );
      if (tableDuplicateIndex > -1) {
        prevTableStudies[tableDuplicateIndex].alreadyExist = false;
        if (
          prevTableStudies[tableDuplicateIndex].index ===
          prevTableStudies[prevTableStudies.length - 1].index
        ) {
          prevTableStudies.push(getModalStudyObj());
        }
      }
      prevTableStudies.splice(tableIndex, 1);
      prevTableStudies = prevTableStudies.map((e, i) => ({
        ...e,
        index: i,
      }));
      setModalTableStudies([...prevTableStudies]);
    };

    const DeleteModalRow = ({ row }) => {
      if (row.index === modalTableStudies[modalTableStudies.length - 1]?.index)
        return false;
      const { index } = row;
      return (
        <IconButton size="small" onClick={() => onModalRowDelete(index)}>
          <Trash />
        </IconButton>
      );
    };

    const updateModalAssignment = () => {
      setLoad(true);
      setIsLoading(true);
      let isErorr = false;
      const allStudies = [...tableStudies, ...modalTableStudies];
      const noStudyRowData = allStudies?.find(
        (e) => e?.prot_id === STUDY_IDS.NO_STUDY
      );
      const allStudyRowData = allStudies?.find(
        (e) => e?.prot_id === STUDY_IDS.ALL_STUDY
      );
      const commonRoles = allStudyRowData?.roles.filter((i) => {
        return !!noStudyRowData?.roles.find((j) => j.value === i.value);
      });
      if (commonRoles?.length) {
        const errMsg = `${commonRoles
          .map((r) => r.label)
          .join(", ")} ${ALL_NONE_STUDY_ERR_MSG}`;
        toast.showErrorMessage(errMsg);
        isErorr = true;
      }
      if (modalTableStudies.find((x) => x.alreadyExist)) {
        toast.showErrorMessage("Please remove duplicate values");
        isErorr = true;
      }
      if (!isErorr) {
        createUserAndAssignStudies(modalTableStudies, setIsLoading);
      } else {
        setIsLoading(false);
      }
    };

    const assignUserColumns = [
      {
        header: "Protocol Number",
        accessor: "prot_id",
        width: "49%",
        customCell: EditableStudy,
      },
      {
        header: "Role",
        accessor: "roles",
        width: "50%",
        customCell: EditableRoles,
      },
      {
        header: "",
        accessor: "delete",
        width: "40px",
        customCell: DeleteModalRow,
      },
    ];

    // const [openCancelModal, setOpenCancelModal] = useState(false);

    // const openConfirmModal = () => {
    //   setOpenCancelModal(true);
    // };

    return (
      <>
        {/* <Modal
          open={openCancelModal}
          onClose={(e) => setOpenCancelModal(false)}
          className="save-confirm"
          disableBackdropClick={true}
          variant="warning"
          title="Lose your work?"
          message="All unsaved changes will be lost."
          buttonProps={[
            { label: "Keep editing" },
            {
              label: "Leave without saving",
              onClick: cancel,
            },
          ]}
          id="neutral"
        /> */}

        <Modal
          open={open}
          onClose={cancel}
          className="save-confirm user-assignment-modal"
          variant="default"
          title="Add User Assignment"
          hideButtons={false}
          disableBackdropClick={true}
          scroll="paper"
          buttonProps={[
            {
              label: "Cancel",
              onClick: cancel,
              disabled: loading,
            },
            {
              label: "Save",
              onClick: updateModalAssignment,
            },
          ]}
          id="user-update-assignment-modal"
        >
          {isLoading && (
            <Loader isInner overlayClassName="user-assignment-loader" />
          )}
          <Table
            isLoading={!load}
            columns={assignUserColumns}
            rows={modalTableStudies}
            initialSortOrder="asc"
            hasScroll={true}
            maxHeight={440}
            rowProps={{ hover: false, className: "add-user-modal-row" }}
            hidePagination={true}
            onToggleFilters={(showFilters) => setShowEmptyTable(showFilters)}
            emptyProps={{ content: <EmptyTableContent /> }}
          />
        </Modal>
      </>
    );
  });

  const EmptyTableContent = () => {
    return showEmptyTable ? (
      <>
        <div>No data to display</div>
      </>
    ) : (
      <>
        <Typography variant="body2" className="empty-grey">
          <Rocket className="user-rocket-icon" />
        </Typography>
        <Typography variant="title1" className="title empty-grey">
          Nothing to See Here
        </Typography>
        <Typography variant="body2" className="empty-grey">
          At least one assignment is needed to access any CDAS product
        </Typography>
        {targetUser?.usr_stat === "Active" && canUpdate && (
          <Button
            // className="empty-user-assignment-btn"
            size="small"
            variant="secondary"
            disabled={userUpdating}
            onClick={() => setUserAssignmentModal(true)}
            className="add-user-assignment-btn"
          >
            <PlusIcon className="user-small-plus-icon mr-2" />
            Add user assignment
          </Button>
        )}
      </>
    );
  };

  const getUserAssignmentTable = React.useMemo(
    () => (
      <div className="study-table" ref={tableRef}>
        {showRolePopup && (
          <AssignmentInfoModal
            open={true}
            cancel={() => setShowRolePopup(false)}
            loading={false}
          />
        )}
        {showUserAssignmentModal && (
          <UserAssignmentModal
            open={true}
            cancel={() => {
              setUserAssignmentModal(false);
              dispatch(formComponentInActive());
              dispatch(hideAppSwitcher());
            }}
            loading={false}
          />
        )}
        {showCancelRowModal && (
          <AlertBox
            cancel={() => setShowCancelRowModal(false)}
            submit={() => cancelRowButton()}
          />
        )}
        <Table
          isLoading={!load || loading}
          title="User Assignments"
          columns={columns}
          rows={tableStudies.filter((e) => e.prot_id)}
          initialSortedColumn="prot_nbr_stnd"
          initialSortOrder="asc"
          rowProps={{ hover: false }}
          hidePagination={true}
          hasScroll={true}
          maxHeight={520}
          onToggleFilters={(showFilters) => setShowEmptyTable(showFilters)}
          CustomHeader={(props) => <CustomButtonHeader {...props} />}
          emptyProps={{ content: <EmptyTableContent /> }}
        />
      </div>
    ),
    [
      tableStudies,
      load,
      loading,
      showRolePopup,
      showUserAssignmentModal,
      targetUser,
      studyList,
      initialFilterRole,
      showEmptyTable,
      showCancelRowModal,
    ]
  );
  return getUserAssignmentTable;
};

export default UserAssignmentTable;
