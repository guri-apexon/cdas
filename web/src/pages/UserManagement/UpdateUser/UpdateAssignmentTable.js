/* eslint-disable no-debugger */
import React, { useContext, useEffect, useState } from "react";
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
import { getOverflowLimit, TextFieldFilter } from "../../../utils/index";

const UserAssignmentTable = ({
  updateChanges,
  userId,
  targetUser,
  showRolePopup,
  setShowRolePopup,
  userUpdating,
  readOnly,
  canUpdate,
}) => {
  const toast = useContext(MessageContext);
  const dispatch = useDispatch();
  const studyData = useSelector((state) => state.studyBoard);

  const [load, setLoad] = useState(false);
  const [studyList, setStudyList] = useState([]);
  const [tableStudies, setTableStudies] = useState([]);
  const [initialTableRoles, setInitialTableRoles] = useState({});
  const [initialRender, setInitialRender] = useState(true);
  const [roleLists, setroleLists] = useState([]);

  const [showUserAssignmentModal, setUserAssignmentModal] = useState(false);

  const getStudyObj = () => {
    const rowIndex = Math.max(...tableStudies.map((o) => o.index), 0) + 1;
    return {
      index: rowIndex + 1,
      prot_nbr_stnd: "",
      prot_id: "",
      roles: [],
    };
  };

  const MultiSelectFilter = ({ accessor, filters, updateFilterValue }) => {
    const [filterRole, setFilterRole] = useState([]);
    const updateTableStudies = (e) => {
      filters.roles = filterRole.map((r) => r.label);
      updateFilterValue(e);
    };
    const editRow = (e, v, r) => {
      setFilterRole([...v]);
      if (r === "remove-option") {
        filters.roles = v.map((ve) => ve.label);
        updateFilterValue(e);
      }
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
      return filterVal.every((e) => rowArray.includes(e));
    };
  };

  const getRoles = async () => {
    const result = await fetchRoles();
    setroleLists(result || []);
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
            label: `${study.prot_nbr_stnd}`,
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
    setStudyList(filtered);
    // getRoles();
  };

  useEffect(() => {
    getStudyList();
  }, [studyData]);

  const StudySelected = ({ isEdit, row }) => {
    return <div className={isEdit}>{row?.prot_nbr_stnd || ""}</div>;
  };

  const RolesSelected = ({ roles }) => {
    const uRoles = roles.length ? roles.map((e) => e.label).join(", ") : "";
    const charLimit = getOverflowLimit("50%", 80);
    return (
      <Tooltip
        variant="dark"
        title={uRoles}
        placement="left"
        style={{ marginRight: 48 }}
      >
        <Typography variant="body2" className="">
          {uRoles && uRoles.length > charLimit
            ? `${uRoles.slice(0, charLimit - 5)}[...]`
            : uRoles}
        </Typography>
      </Tooltip>
    );
  };

  const ViewStudy = ({ row, column: { accessor: key } }) => {
    const isEdit = row?.isEdit ? "editable-row" : "";
    console.log({ row });
    return (
      <div className="study">
        <StudySelected isEdit={isEdit} row={row} />
      </div>
    );
  };
  const [viewRoleLength, setViewRoleLength] = useState({});
  const ViewRoles = ({ row, column: { accessor: key } }) => {
    const tableIndex = tableStudies.findIndex((el) => el.index === row.index);
    const [viewRoleValue, setViewRoleValue] = useState(
      tableStudies[tableIndex]?.roles || []
    );
    const editViewRow = (e, v, r) => {
      setViewRoleLength({
        ...viewRoleLength,
        [tableStudies[tableIndex].prot_id]: v.length,
      });
      setViewRoleValue([...v]);
    };
    const updateTableStudies = (v) => {
      const copy = [...tableStudies];
      copy[tableIndex].roles = [...v];
      setTableStudies(copy);
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
            source={roleLists}
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
          />
        ) : (
          <RolesSelected roles={row?.roles || []} />
        )}
      </div>
    );
  };

  const updateEditMode = (rowIndex, editMode) => {
    const prevTableStudies = [...tableStudies];
    prevTableStudies[rowIndex].isEdit = editMode;
    setTableStudies([...prevTableStudies]);
  };

  const onVieweStudyDelete = async (rowIndex) => {
    setLoad(false);
    const email = targetUser.usr_mail_id;
    const uid = targetUser?.sAMAccountName;

    const formattedRows = [
      {
        protocolname: tableStudies[rowIndex].prot_nbr_stnd,
        id: tableStudies[rowIndex].prot_id,
        roles: tableStudies[rowIndex].roles.map((r) => r.label),
      },
    ];
    const newFormattedRows = formattedRows.filter((e) => e.id);
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
      tenent: "t1",
      ...insertUserStudy,
    };
    const response = await deleteUserAssignments(payload);
    if (response.status) {
      updateEditMode(rowIndex, false);
      toast.showSuccessMessage(
        response.message || "Assignment Deleted Successfully!"
      );
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
  };

  const DeleteViewStudy = ({ row }) => {
    if (targetUser?.usr_stat !== "Active" || readOnly) return false;
    const rowIndex = tableStudies.findIndex((e) => e.prot_id === row.prot_id);
    const handleMenuClick = (label) => () => {
      if (label === "edit") {
        setInitialTableRoles({
          ...initialTableRoles,
          [tableStudies[rowIndex].prot_id]: tableStudies[rowIndex].roles,
        });
        updateEditMode(rowIndex, true);
      } else {
        onVieweStudyDelete(rowIndex);
      }
    };

    const cancelEdit = () => {
      tableStudies[rowIndex].roles =
        initialTableRoles[tableStudies[rowIndex].prot_id];
      setTableStudies([...tableStudies]);
      updateEditMode(rowIndex, false);
    };

    const saveEdit = async (viewRow) => {
      if (!viewRoleLength[viewRow.prot_id]) {
        toast.showErrorMessage("A role is required");
      } else {
        const email = targetUser.usr_mail_id;
        const uid = targetUser?.sAMAccountName;
        const formattedRows = [
          {
            protocolname: tableStudies[rowIndex].prot_nbr_stnd,
            id: tableStudies[rowIndex].prot_id,
            roles: tableStudies[rowIndex].roles.map((r) => r.value),
          },
        ];
        const newFormattedRows = formattedRows.filter((e) => e.id);
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
        if (response.status) {
          updateEditMode(rowIndex, false);
          toast.showSuccessMessage(response.message || "Updated Successfully!");
        } else {
          toast.showErrorMessage(response.message || "Error in update!");
        }
      }
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
            >
              Save
            </Button>
          </div>
        ) : (
          <div className="flex flex-end w-100">
            <Tooltip disableFocusListener>
              <IconMenuButton id="actions-2" menuItems={menuItems} size="small">
                <EllipsisVertical />
              </IconMenuButton>
            </Tooltip>
          </div>
        )}
      </>
    );
  };

  const getUserStudyRoles = async () => {
    const userStudy = await getUserStudyAndRoles(userId);
    if (userStudy.status) {
      const userSutdyRes = userStudy.data.map((e, i) => ({ ...e, index: i }));
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
    getUserStudyRoles();
  }, []);

  const CustomButtonHeader = ({ toggleFilters }) => {
    return (
      <div>
        {targetUser?.usr_stat === "Active" && canUpdate && (
          <Button
            size="small"
            variant="secondary"
            icon={PlusIcon}
            disabled={userUpdating}
            onClick={() => setUserAssignmentModal(true)}
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
        >
          Filter
        </Button>
      </div>
    );
  };

  const columns = [
    {
      header: "Protocol Number",
      accessor: "prot_nbr_stnd",
      width: "25%",
      customCell: ViewStudy,
      sortFunction: compareStrings,
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
      width: "8%",
      customCell: DeleteViewStudy,
    },
  ];

  const createUserAndAssignStudies = async (rowsToUpdate) => {
    const email = targetUser.usr_mail_id;
    const uid = targetUser?.sAMAccountName;
    const formattedRows = rowsToUpdate.map((e) => {
      return {
        protocolname: e?.prot_nbr_stnd,
        id: e?.prot_id,
        roles: e.roles.map((r) => r.value),
      };
    });
    const newFormattedRows = formattedRows.filter((e) => e.id);
    const emptyRoles = newFormattedRows.filter((x) => x.roles.length === 0);
    if (emptyRoles.length) {
      toast.showErrorMessage(
        `This assignment is incomplete. Please select a study and a role to continue.`
      );
    } else {
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
      if (response.status === 1) {
        setUserAssignmentModal(false);
        setTableStudies([...tableStudies, ...rowsToUpdate]);
        toast.showSuccessMessage(response.message);
      } else {
        toast.showErrorMessage(response.message);
      }
    }
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

    const [modalTableStudies, setModalTableStudies] = useState([
      getModalStudyObj(),
    ]);
    const [disableSaveBtn, setDisableSaveBtn] = useState(true);

    const editModalStudyRow = (e, value, reason, index, key) => {
      setDisableSaveBtn(true);
      const tempModalTableStudies = modalTableStudies.map((s) => ({
        ...s,
        alreadyExist: false,
      }));
      const duplicateIndex1 = tempModalTableStudies.findIndex(
        (s) => s.prot_id === value.prot_id
      );
      const duplicateIndex2 = tableStudies.findIndex(
        (s) => s.prot_id === value.prot_id
      );
      tempModalTableStudies[index].protocolname = value.prot_nbr_stnd;
      tempModalTableStudies[index].prot_nbr_stnd = value.prot_nbr_stnd;
      tempModalTableStudies[index].prot_id = value.prot_id;
      if (duplicateIndex1 > -1 || duplicateIndex2 > -1) {
        tempModalTableStudies[index].alreadyExist = true;
      } else {
        tempModalTableStudies.push({
          ...getModalStudyObj(index),
        });
      }
      setModalTableStudies([...tempModalTableStudies]);
    };

    const EditableStudy = ({ row, column: { accessor: key } }) => {
      const editStudyRowIndex = studyList.findIndex((e) => e[key] === row[key]);
      return (
        <div className="study">
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
      const [value, setValue] = useState(
        modalTableStudies[tableIndex]?.roles || []
      );
      if (row.index === modalTableStudies[modalTableStudies.length - 1]?.index)
        return false;

      const editModalRoleRow = (e, v, r) => {
        if (r === "remove-option") {
          setDisableSaveBtn(v.length ? false : true);
          const copy = [...modalTableStudies];
          copy[tableIndex].roles = [...v];
          setModalTableStudies(copy);
        }
        setValue([...v]);
      };
      const updateTableStudies = (v) => {
        const copy = [...modalTableStudies];
        copy[tableIndex].roles = [...v];
        setModalTableStudies(copy);
        setDisableSaveBtn(v.length ? false : true);
      };
      return (
        <div className="role">
          <AutocompleteV2
            placeholder={!value.length ? "Choose one or more roles" : ""}
            size="small"
            fullWidth
            multiple
            forcePopupIcon
            showCheckboxes
            chipColor="white"
            source={roleLists}
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
          />
        </div>
      );
    };

    const onModalRowDelete = (index) => {
      let prevTableStudies = [...modalTableStudies];
      const tableIndex = modalTableStudies.findIndex(
        (el) => el.index === index
      );
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
      let isErorr = false;
      if (modalTableStudies.find((x) => x.alreadyExist)) {
        toast.showErrorMessage("Please remove duplicate values");
        isErorr = true;
      }
      if (!isErorr) {
        createUserAndAssignStudies(modalTableStudies);
      }
    };

    const assignUserColumns = [
      {
        header: "Protocol Number",
        accessor: "prot_id",
        width: "30%",
        customCell: EditableStudy,
      },
      {
        header: "Role",
        accessor: "roles",
        width: "70%",
        customCell: EditableRoles,
      },
      {
        header: "",
        accessor: "delete",
        width: "40px",
        customCell: DeleteModalRow,
      },
    ];

    const [openCancelModal, setOpenCancelModal] = useState(false);

    const openConfirmModal = () => {
      setOpenCancelModal(true);
    };

    return (
      <>
        <Modal
          open={openCancelModal}
          onClose={(e) => setOpenCancelModal(false)}
          className="save-confirm"
          disableBackdropClick="true"
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
        />

        <Modal
          open={open}
          onClose={cancel}
          className="save-confirm user-assignment-modal"
          variant="default"
          title="Add User Assignment"
          hideButtons={false}
          disableBackdropClick={true}
          buttonProps={[
            {
              label: "Cancel",
              onClick: openConfirmModal,
              disabled: loading,
            },
            {
              label: "Save",
              onClick: updateModalAssignment,
              disabled: disableSaveBtn,
            },
          ]}
          id="user-update-assignment-modal"
        >
          <Table
            isLoading={!load}
            columns={assignUserColumns}
            rows={modalTableStudies}
            initialSortOrder="asc"
            rowProps={{ hover: false }}
            hidePagination={true}
            emptyProps={{ content: <EmptyTableContent /> }}
          />
        </Modal>
      </>
    );
  });

  const EmptyTableContent = () => {
    return (
      <>
        <Typography variant="body2" className="">
          <Rocket />
        </Typography>
        <Typography variant="body2" className="">
          Nothing to See Here
        </Typography>
        <Typography variant="body2" className="">
          At least one assignment is needed to access any CDAS product
        </Typography>
        {targetUser?.usr_stat === "Active" && canUpdate && (
          <Button
            size="small"
            variant="secondary"
            icon={PlusIcon}
            disabled={userUpdating}
            onClick={() => setUserAssignmentModal(true)}
          >
            Add user assignment
          </Button>
        )}
      </>
    );
  };

  const getUserAssignmentTable = React.useMemo(
    () => (
      <>
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
            cancel={() => setUserAssignmentModal(false)}
            loading={false}
          />
        )}
        <Table
          isLoading={!load}
          title="User Assignments"
          columns={columns}
          rows={tableStudies.filter((e) => e.prot_id)}
          initialSortedColumn="prot_nbr_stnd"
          initialSortOrder="asc"
          rowProps={{ hover: false }}
          hidePagination={true}
          CustomHeader={(props) => <CustomButtonHeader {...props} />}
          emptyProps={{ content: <EmptyTableContent /> }}
        />
      </>
    ),
    [
      tableStudies,
      load,
      showRolePopup,
      showUserAssignmentModal,
      targetUser,
      studyList,
    ]
  );
  return getUserAssignmentTable;
};

export default UserAssignmentTable;
