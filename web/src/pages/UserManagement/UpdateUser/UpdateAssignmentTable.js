/* eslint-disable no-debugger */
import React, { useContext, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

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
  createSelectFilterComponent,
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
import MultiSelect from "../../../components/MultiSelect";
import {
  TextFieldFilter,
  createStringArraySearchFilter,
  getOverflowLimit,
} from "../../../utils/index";

const UserAssignmentTable = ({
  updateChanges,
  userId,
  targetUser,
  showRolePopup,
  setShowRolePopup,
  userUpdating,
}) => {
  const toast = useContext(MessageContext);
  const dispatch = useDispatch();
  const studyData = useSelector((state) => state.studyBoard);

  const [load, setLoad] = useState(false);
  const [studyList, setStudyList] = useState([]);
  const [tableStudies, setTableStudies] = useState([]);
  const [initialRender, setInitialRender] = useState(true);
  const [roleLists, setroleLists] = useState([]);
  const [showUserAssignmentModal, setUserAssignmentModal] = useState(false);

  const lineRefs = React.useRef([]);
  // useEffect(() => {
  //   if (tableStudies.length === 0) {
  //     setLoad(false);
  //   } else {
  //     setLoad(true);
  //   }
  //   setCheckUserAssignmentTableData(tableStudies);

  //   if (tableStudies.length > 1) {
  //     disableSaveBtn(false);
  //   } else {
  //     disableSaveBtn(true);
  //   }

  //   lineRefs.current = tableStudies.map((_, i) => React.createRef());
  // }, [tableStudies]);

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

  const addNewStudy = () => {
    // if (tableStudies.find((x) => x.study == null)) {
    //   setInitialRender(!initialRender);
    //   setTableStudies([...tableStudies]);
    //   toast.showErrorMessage(
    //     "Please fill study or remove blank rows to add new row"
    //   );
    //   return false;
    // }
    // const studyObj = getStudyObj();
    // setTableStudies((u) => [...u, studyObj]);
    return true;
  };

  const getRoles = async () => {
    const result = await fetchRoles();
    setroleLists(result || []);
    // addNewStudy();
  };

  const getStudyList = async () => {
    const data = [...studyData?.studyboardData];
    console.log({ data });
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
    console.log({ filtered });
    setStudyList(filtered);
    // getRoles();
  };

  useEffect(() => {
    // if (
    //   !studyData.loading &&
    //   studyData?.studyboardFetchSuccess &&
    //   !tableStudies.length
    // ) {
    getStudyList();
    // }
  }, [studyData]);

  const editStudyRow = (e, value, reason, index, key) => {
    updateChanges();
    let alreadyExist;
    if (value) {
      setInitialRender(true);
    } else {
      setInitialRender(false);
    }
    if (key === "prot_id" && value) {
      alreadyExist = tableStudies.find((x) => x.prot_id === value.prot_id)
        ? true
        : false;
    }
    const tableIndex = tableStudies.findIndex((el) => el.index === index);
    setTableStudies((rows) => {
      const newRows = rows.map((row) => {
        console.log({ row });
        if (row.index === index) {
          if (key === "prot_id") {
            return {
              ...row,
              [key]: value.prot_id,
              id: value.prot_id,
              prot_nbr_stnd: value.prot_nbr_stnd,
              alreadyExist,
            };
          }
          return {
            ...row,
            [key]: value.prot_id,
            id: value.prot_id,
            prot_nbr_stnd: value.prot_nbr_stnd,
          };
        }
        return row;
      });
      if (
        !alreadyExist &&
        key === "prot_id" &&
        value &&
        tableIndex + 1 === tableStudies.length
      ) {
        return [...newRows, getStudyObj()];
      }
      console.log({ newRows });
      return newRows;
    });
  };
  const editRoleRow = (e, value, reason, index, key) => {
    updateChanges();
    let alreadyExist;
    if (value) {
      setInitialRender(true);
    } else {
      setInitialRender(false);
    }
    if (key === "prot_nbr_stnd" && value) {
      alreadyExist = tableStudies.find(
        (x) => x.prot_nbr_stnd === value.prot_nbr_stnd
      )
        ? true
        : false;
    }
    const tableIndex = tableStudies.findIndex((el) => el.index === index);
    setTableStudies((rows) => {
      const newRows = rows.map((row) => {
        if (row.index === index) {
          if (key === "prot_nbr_stnd") {
            return { ...row, [key]: value.prot_nbr_stnd, alreadyExist };
          }
          return { ...row, [key]: value.prot_nbr_stnd };
        }
        return row;
      });
      if (
        !alreadyExist &&
        key === "prot_nbr_stnd" &&
        value &&
        tableIndex + 1 === tableStudies.length
      ) {
        return [...newRows, getStudyObj()];
      }
      return newRows;
    });
  };

  const StudySelected = ({ row }) => {
    return row?.prot_nbr_stnd || "";
  };

  const RolesSelected = ({ roles }) => {
    const uRoles = roles.length ? roles.map((e) => e.label).join(", ") : "";
    return (
      <Tooltip
        variant="light"
        title={uRoles}
        placement="left"
        style={{ marginRight: 48 }}
      >
        <Typography variant="body2" className="">
          {uRoles.length > 50 ? `${uRoles.substring(0, 50)} ...` : uRoles}
        </Typography>
      </Tooltip>
    );
  };

  const ViewStudy = ({ row, column: { accessor: key } }) => {
    return (
      <div className="study">
        <StudySelected row={row} />
      </div>
    );
  };

  const ViewRoles = ({ row, column: { accessor: key } }) => {
    return (
      <div className="role">
        {row.isEdit ? (
          <MultiSelect
            roleLists={roleLists}
            row={row}
            rowKey={key}
            tableStudies={tableStudies}
            setTableStudies={setTableStudies}
            editRow={(e, v, r, rowIndex, rowKey) =>
              editRoleRow(e, v, r, rowIndex, rowKey)
            }
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
    const employeeId = targetUser?.extrnl_emp_id?.trim() || "";

    const formattedRows = [
      {
        protocolname: tableStudies[rowIndex].prot_nbr_stnd,
        id: tableStudies[rowIndex].prot_id,
        roles: tableStudies[rowIndex].roles.map((r) => r.label),
      },
    ];

    console.log(tableStudies[rowIndex]);

    const newFormattedRows = formattedRows.filter((e) => e.id);
    console.log({ formattedRows, newFormattedRows });
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
    console.log({ response });
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
    console.log("saveEdit", response);
  };

  const DeleteViewStudy = ({ row }) => {
    if (targetUser?.usr_stat !== "Active") return false;
    const rowIndex = tableStudies.findIndex((e) => e.prot_id === row.prot_id);
    const handleMenuClick = (label) => () => {
      if (label === "edit") {
        updateEditMode(rowIndex, true);
      } else {
        onVieweStudyDelete(rowIndex);
      }
    };

    const cancelEdit = () => {
      updateEditMode(rowIndex, false);
    };

    const saveEdit = async () => {
      const email = targetUser.usr_mail_id;
      const uid = targetUser?.sAMAccountName;
      const employeeId = targetUser?.extrnl_emp_id?.trim() || "";

      const formattedRows = [
        {
          protocolname: tableStudies[rowIndex].prot_nbr_stnd,
          id: tableStudies[rowIndex].prot_id,
          roles: tableStudies[rowIndex].roles.map((r) => r.value),
        },
      ];

      console.log(tableStudies[rowIndex]);

      const newFormattedRows = formattedRows.filter((e) => e.id);
      console.log({ formattedRows, newFormattedRows });
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
      console.log("saveEdit", response);
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
              onClick={() => saveEdit()}
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

  // useEffect(() => {
  //   if (pingParent !== 0) {
  //     AssignUser();
  //   }
  // }, [pingParent]);

  const getUserStudyRoles = async () => {
    const userStudy = await getUserStudyAndRoles(userId);
    if (userStudy.status) {
      const userSutdyRes = userStudy.data.map((e, i) => ({ ...e, index: i }));
      console.log({ userSutdyRes });
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
    // getStudyList();
    getRoles();
    getUserStudyRoles();
  }, []);

  const CustomButtonHeader = ({ toggleFilters }) => {
    return (
      <div>
        {targetUser?.usr_stat === "Active" && (
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
      width: "55%",
      customCell: ViewRoles,
      filterFunction: compareStringOfArraySearchFilter("roles"),
      filterComponent: MultiSelectFilter,
    },
    {
      header: "",
      accessor: "delete",
      width: "20%",
      customCell: DeleteViewStudy,
    },
  ];

  const onDelete = (index) => {
    let prevTableStudies = tableStudies;
    const tableIndex = tableStudies.findIndex((el) => el.index === index);
    prevTableStudies.splice(tableIndex, 1);
    prevTableStudies = prevTableStudies.map((e, i) => ({ ...e, index: i + 1 }));
    setTableStudies([...prevTableStudies]);
  };

  const DeleteStudyCell = ({ row }) => {
    if (row.index === tableStudies[tableStudies.length - 1]?.index)
      return false;
    const { index } = row;
    return (
      <IconButton size="small" onClick={() => onDelete(index)}>
        <Trash />
      </IconButton>
    );
  };

  const createUserAndAssignStudies = async (rowsToUpdate) => {
    const email = targetUser.usr_mail_id;
    const uid = targetUser?.sAMAccountName;
    const employeeId = targetUser?.extrnl_emp_id?.trim() || "";

    const formattedRows = rowsToUpdate.map((e) => {
      console.log({ e });
      return {
        protocolname: e?.prot_nbr_stnd,
        id: e?.prot_id,
        roles: e.roles.map((r) => r.value),
      };
    });

    console.log({ rowsToUpdate });

    const newFormattedRows = formattedRows.filter((e) => e.id);

    const emptyRoles = newFormattedRows.filter((x) => x.roles.length === 0);
    if (emptyRoles.length) {
      toast.showErrorMessage(
        `This assignment is incomplete. Please select a study and a role to continue.`
      );
    } else {
      console.log({ formattedRows, newFormattedRows });
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
        setTableStudies(rowsToUpdate);
        toast.showSuccessMessage(response.message);
      } else {
        toast.showErrorMessage(response.message);
      }
    }
    // return null;
  };

  const updateUserAssignment2 = () => {
    // if (!studiesRows) {
    //   return false;
    // }
    // if (!selectedUser) {
    //   toast.showErrorMessage("Select a user or create a new one");
    //   return false;
    // }
    // if (!studiesRows.length) {
    //   toast.showErrorMessage("Add some studies to proceed");
    //   return false;
    // }
    // if (studiesRows.find((x) => x.study == null)) {
    //   // setInitialRender(!initialRender);
    //   // setTableStudies([...studiesRows]);
    //   toast.showErrorMessage("Please fill study or remove blank rows");
    //   return false;
    // }
    // if (studiesRows.find((x) => x.alreadyExist)) {
    //   toast.showErrorMessage("Please remove duplicate values");
    //   return false;
    // }
    // const emptyRoles = studiesRows.filter((x) => x.roles.length === 0);
    // if (emptyRoles.length) {
    //   toast.showErrorMessage(
    //     `This assignment is incomplete. Please select a study and a role to continue.`
    //   );
    //   return false;
    // }
    setLoad(true);
    createUserAndAssignStudies();
  };

  const AssignmentInfoModal = React.memo(({ open, cancel, loading }) => {
    let rolesCount = 0;
    // console.log({ tableStudies });
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
    const [modalTableStudies, setModalTableStudies] = useState([
      ...tableStudies,
    ]);

    const editModalStudyRow = (e, value, reason, index, key) => {
      updateChanges();
      let alreadyExist;
      if (value) {
        setInitialRender(true);
      } else {
        setInitialRender(false);
      }
      if (key === "prot_id" && value) {
        alreadyExist = modalTableStudies.find(
          (x) => x.prot_id === value.prot_id
        )
          ? true
          : false;
      }
      const tableIndex = modalTableStudies.findIndex(
        (el) => el.index === index
      );
      setModalTableStudies((rows) => {
        const newRows = rows.map((row) => {
          console.log({ row });
          if (row.index === index) {
            if (key === "prot_id") {
              return {
                ...row,
                [key]: value.prot_id,
                id: value.prot_id,
                prot_nbr_stnd: value.prot_nbr_stnd,
                alreadyExist,
              };
            }
            return {
              ...row,
              [key]: value.prot_id,
              id: value.prot_id,
              prot_nbr_stnd: value.prot_nbr_stnd,
            };
          }
          return row;
        });
        if (
          !alreadyExist &&
          key === "prot_id" &&
          value &&
          tableIndex + 1 === modalTableStudies.length
        ) {
          return [...newRows, getStudyObj()];
        }
        console.log({ newRows });
        return newRows;
      });
    };

    const editModalRoleRow = (e, value, reason, index, key) => {
      updateChanges();
      let alreadyExist;
      if (value) {
        setInitialRender(true);
      } else {
        setInitialRender(false);
      }
      if (key === "prot_nbr_stnd" && value) {
        alreadyExist = modalTableStudies.find(
          (x) => x.prot_nbr_stnd === value.prot_nbr_stnd
        )
          ? true
          : false;
      }
      const tableIndex = modalTableStudies.findIndex(
        (el) => el.index === index
      );
      setModalTableStudies((rows) => {
        const newRows = rows.map((row) => {
          if (row.index === index) {
            if (key === "prot_nbr_stnd") {
              return { ...row, [key]: value.prot_nbr_stnd, alreadyExist };
            }
            return { ...row, [key]: value.prot_nbr_stnd };
          }
          return row;
        });
        if (
          !alreadyExist &&
          key === "prot_nbr_stnd" &&
          value &&
          tableIndex + 1 === modalTableStudies.length
        ) {
          return [...newRows, getStudyObj()];
        }
        return newRows;
      });
    };

    const EditableStudy = ({ row, column: { accessor: key } }) => {
      const editStudyRowIndex = studyList.findIndex((e) => e[key] === row[key]);
      return (
        <div className="study">
          <AutocompleteV2
            ref={lineRefs.current[row.index - 1]}
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
                ? "This study already has assignments. Please select a different study to continue."
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
      if (row.index === modalTableStudies[modalTableStudies.length - 1]?.index)
        return false;
      return (
        <div className="role">
          <MultiSelect
            roleLists={roleLists}
            row={row}
            rowKey={key}
            tableStudies={modalTableStudies}
            setTableStudies={setModalTableStudies}
            editRow={(e, v, r, rowIndex, rowKey) =>
              editModalRoleRow(e, v, r, rowIndex, rowKey)
            }
          />
        </div>
      );
    };

    const onModalRowDelete = (index) => {
      console.log("need to update");
      let prevTableStudies = [...modalTableStudies];
      const tableIndex = modalTableStudies.findIndex(
        (el) => el.index === index
      );
      prevTableStudies.splice(tableIndex, 1);
      prevTableStudies = prevTableStudies.map((e, i) => ({
        ...e,
        index: i + 1,
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
      console.log({ modalTableStudies });
      // const emptyRoles = modalTableStudies.filter((x) => x.roles.length === 0);
      // if (emptyRoles.length) {
      //   toast.showErrorMessage(
      //     `This assignment is incomplete. Please select a study and a role to continue.`
      //   );
      //   isErorr = true;
      // }
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
    return (
      <Modal
        open={open}
        onClose={cancel}
        className="save-confirm user-assignment-modal"
        variant="default"
        title="Add User Assignment"
        buttonProps={[
          {
            label: "Cancel",
            onClick: cancel,
            disabled: loading,
          },
          {
            label: "Save",
            onClick: updateModalAssignment,
            disabled: loading,
          },
        ]}
        id="neutral2"
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
        <Button
          size="small"
          variant="secondary"
          icon={PlusIcon}
          disabled={userUpdating}
          onClick={() => setUserAssignmentModal(true)}
        >
          Add user assignment
        </Button>
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
          headerProps={{ addNewStudy }}
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
