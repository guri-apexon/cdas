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
  pingParent,
  updateUserAssign,
  setCheckUserAssignmentTableData,
  disableSaveBtn,
  userId,
  targetUser,
  showRolePopup,
  setShowRolePopup,
}) => {
  const toast = useContext(MessageContext);
  const dispatch = useDispatch();
  const studyData = useSelector((state) => state.studyBoard);

  const [load, setLoad] = useState(false);
  const [studyList, setStudyList] = useState([]);
  const [tableStudies, setTableStudies] = useState([]);
  const [initialRender, setInitialRender] = useState(true);
  const [roleLists, setroleLists] = useState([]);

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
      index: rowIndex,
      study: null,
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
    if (tableStudies.find((x) => x.study == null)) {
      setInitialRender(!initialRender);
      setTableStudies([...tableStudies]);
      toast.showErrorMessage(
        "Please fill study or remove blank rows to add new row"
      );
      return false;
    }
    const studyObj = getStudyObj();
    setTableStudies((u) => [...u, studyObj]);
    return true;
  };

  const getRoles = async () => {
    const result = await fetchRoles();
    setroleLists(result || []);
    addNewStudy();
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
    getRoles();
  };

  // useEffect(() => {
  //   if (
  //     !studyData.loading &&
  //     studyData?.studyboardFetchSuccess &&
  //     !tableStudies.length
  //   ) {
  //     getStudyList();
  //   }
  // }, [studyData]);

  const editRow = (e, value, reason, index, key) => {
    updateChanges();
    let alreadyExist;
    if (value) {
      setInitialRender(true);
    } else {
      setInitialRender(false);
    }
    if (key === "study" && value) {
      alreadyExist = tableStudies.find(
        (x) => x.study?.prot_id === value.prot_id
      )
        ? true
        : false;
    }
    const tableIndex = tableStudies.findIndex((el) => el.index === index);
    setTableStudies((rows) => {
      const newRows = rows.map((row) => {
        if (row.index === index) {
          if (key === "study") {
            return { ...row, [key]: value, alreadyExist };
          }
          return { ...row, [key]: value };
        }
        return row;
      });
      if (
        !alreadyExist &&
        key === "study" &&
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

  const EditableStudy = ({ row, column: { accessor: key } }) => {
    return (
      <div className="study">
        <StudySelected row={row} />
      </div>
    );
  };

  const EditableRoles = ({ row, column: { accessor: key } }) => {
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
              editRow(e, v, r, rowIndex, rowKey)
            }
          />
        ) : (
          <RolesSelected roles={row?.roles || []} />
        )}
      </div>
    );
  };

  const onDelete = (tableIndex) => {
    const prevTableStudies = [...tableStudies];
    prevTableStudies.splice(tableIndex, 1);
    const updatedTableStudies = prevTableStudies.map((e, i) => ({
      ...e,
      index: i + 1,
    }));
    setTableStudies([...updatedTableStudies]);
  };

  const enableEditMode = (rowIndex) => {
    const prevTableStudies = [...tableStudies];
    prevTableStudies[rowIndex].isEdit = true;
    setTableStudies([...prevTableStudies]);
  };
  const DeleteStudyCell = ({ row }) => {
    if (targetUser?.usr_stat !== "Active") return false;
    const rowIndex = tableStudies.findIndex((e) => e.prot_id === row.prot_id);
    const handleMenuClick = (label) => () => {
      if (label === "edit") {
        enableEditMode(rowIndex);
      } else {
        onDelete(rowIndex);
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
      <Tooltip title="Actions" disableFocusListener>
        <IconMenuButton id="actions-2" menuItems={menuItems} size="small">
          <EllipsisVertical />
        </IconMenuButton>
      </Tooltip>
    );
  };

  const AssignUser = async () => {
    updateUserAssign(tableStudies);
    return null;
  };

  // useEffect(() => {
  //   if (pingParent !== 0) {
  //     AssignUser();
  //   }
  // }, [pingParent]);

  useEffect(() => {
    // dispatch(getStudyboardData());
    getRoles();
    (async () => {
      const userStudy = await getUserStudyAndRoles(userId);
      if (userStudy.status) {
        setTableStudies(userStudy.data.map((e, i) => ({ ...e, index: i })));
      }
      setLoad(true);
    })();
  }, []);

  const CustomButtonHeader = ({ toggleFilters }) => {
    return (
      <div>
        {targetUser?.usr_stat === "Active" && (
          <Button
            size="small"
            variant="secondary"
            icon={PlusIcon}
            onClick={(e) => {
              lineRefs.current[
                tableStudies.length - 1
              ]?.current?.lastElementChild?.childNodes[0]?.firstElementChild?.childNodes[1]?.childNodes[1]?.click();
            }}
          >
            Add user assignment
          </Button>
        )}
        <Button
          size="small"
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
      width: "30%",
      customCell: EditableStudy,
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("prot_nbr_stnd"),
      filterComponent: TextFieldFilter,
    },
    {
      header: "Role",
      accessor: "roles",
      width: "70%",
      customCell: EditableRoles,
      filterFunction: compareStringOfArraySearchFilter("roles"),
      filterComponent: MultiSelectFilter,
    },
    {
      header: "",
      accessor: "delete",
      width: "40px",
      customCell: DeleteStudyCell,
    },
  ];

  const AssignmentInfoModal = React.memo(({ open, cancel, loading }) => {
    let rolesCount = 0;
    console.log({ tableStudies });
    tableStudies.map((a) => {
      rolesCount += a.roles.length;
      return false;
    });
    return (
      <Modal
        open={open}
        onClose={cancel}
        className="save-confirm"
        variant="secondary"
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
        <Table
          isLoading={!load}
          title="User Assignments"
          columns={columns}
          rows={tableStudies.map((row) => ({
            ...row,
          }))}
          initialSortedColumn="prot_nbr_stnd"
          initialSortOrder="asc"
          rowProps={{ hover: false }}
          hidePagination={true}
          CustomHeader={(props) => <CustomButtonHeader {...props} />}
          headerProps={{ addNewStudy }}
        />
      </>
    ),
    [tableStudies, load, showRolePopup]
  );
  return getUserAssignmentTable;
};

export default UserAssignmentTable;
