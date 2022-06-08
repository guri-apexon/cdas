/* eslint-disable no-debugger */
import React, { useContext, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Table from "apollo-react/components/Table";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import IconButton from "apollo-react/components/IconButton";
import Trash from "apollo-react-icons/Trash";
import Button from "apollo-react/components/Button";
import PlusIcon from "apollo-react-icons/Plus";

import {
  fetchRoles,
  getOnboardUsers,
  onboardStudy,
} from "../../../services/ApiServices";
import { MessageContext } from "../../../components/Providers/MessageProvider";
import {
  getStudyboardData,
  getNotOnBordedStatus,
} from "../../../store/actions/StudyBoardAction";

const UserAssignmentTable = ({
  loading,
  setLoading,
  selectedUser,
  updateChanges,
  pingParent,
  isNewUser,
}) => {
  const toast = useContext(MessageContext);
  const dispatch = useDispatch();
  const studyData = useSelector((state) => state.studyBoard);
  const history = useHistory();

  const [load, setLoad] = useState(false);
  const [studyList, setStudyList] = useState([]);
  const [tableStudies, setTableStudies] = useState([]);
  const [initialRender, setInitialRender] = useState(true);
  const [roleLists, setroleLists] = useState([]);

  useEffect(() => {
    console.log("tableStudies", tableStudies);
    if (tableStudies.length === 0) {
      setLoad(false);
    } else {
      setLoad(true);
    }
  }, [tableStudies]);

  const getStudyObj = () => {
    return {
      index: Math.max(...tableStudies.map((o) => o.index), 0) + 1,
      study: null,
      roles: [],
    };
  };

  const addNewStudy = () => {
    console.log("adding new study");
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
      data.map((study) => {
        return {
          ...study,
          label: `${study.protocolnumber}`,
        };
      }) || [];
    filtered.sort(function (a, b) {
      if (a.firstName < b.firstName) {
        return -1;
      }
      if (a.firstName > b.firstName) {
        return 1;
      }
      return 0;
    });
    setStudyList(filtered);
    getRoles();
  };

  useEffect(() => {
    if (
      !studyData.loading &&
      studyData?.studyboardFetchSuccess &&
      !tableStudies.length
    ) {
      getStudyList();
    }
  }, [studyData]);

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

  const EditableStudy = ({ row, column: { accessor: key } }) => {
    return (
      <div className="study">
        <AutocompleteV2
          matchFrom="any"
          size="small"
          fullWidth
          forcePopupIcon
          source={studyList}
          value={row[key]}
          onChange={(e, v, r) => editRow(e, v, r, row.index, key)}
          enableVirtualization
          error={
            row.alreadyExist ||
            (!initialRender &&
              !row[key] &&
              row.index !== tableStudies[tableStudies.length - 1].index)
          }
          helperText={
            row.alreadyExist
              ? "This study already has assignments. Please select a different study to continue."
              : !initialRender &&
                !row[key] &&
                row.index !== tableStudies[tableStudies.length - 1].index &&
                "Required"
          }
        />
      </div>
    );
  };

  const EditableRoles = ({ row, column: { accessor: key } }) => {
    if (
      row.study === null &&
      row.index === tableStudies[tableStudies.length - 1]?.index
    )
      return false;
    return (
      <div className="role">
        <AutocompleteV2
          showSelectAll
          size="small"
          fullWidth
          multiple
          forcePopupIcon
          showCheckboxes
          chipColor="white"
          source={roleLists}
          limitChips={2}
          value={row[key]}
          onChange={(e, v, r) => editRow(e, v, r, row.index, key)}
          error={!row[key]}
          helperText={!row[key] && "Required"}
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
  const DeleteStudyCell = ({ row }) => {
    if (
      row.study === null &&
      row.index === tableStudies[tableStudies.length - 1]?.index
    )
      return false;
    const { index, onDelete } = row;
    return (
      <IconButton size="small" onClick={() => onDelete(index)}>
        <Trash />
      </IconButton>
    );
  };

  const onDelete = (index) => {
    setTableStudies((rows) => {
      const newRows = rows.filter((row) => row.index !== index);
      const tableIndex = tableStudies.findIndex((el) => el.index === index);
      if (tableIndex + 1 === tableStudies.length) {
        return [...newRows, getStudyObj()];
      }
      return newRows;
    });
  };

  const AssignUser = async (assign = true) => {
    const studiesRows = [...tableStudies].slice(0, -1);
    if (assign) {
      if (!selectedUser) {
        toast.showErrorMessage("Select a user or create a new one");
        return false;
      }
      if (!studiesRows.length) {
        toast.showErrorMessage("Add some studies to proceed");
        return false;
      }
      if (studiesRows.find((x) => x.study == null)) {
        setInitialRender(!initialRender);
        setTableStudies([...tableStudies]);
        toast.showErrorMessage("Please fill study or remove blank rows");
        return false;
      }
      if (studiesRows.find((x) => x.alreadyExist)) {
        toast.showErrorMessage("Please remove duplicate values");
        return false;
      }
      const emptyRoles = studiesRows.filter((x) => x.roles.length === 0);
      if (emptyRoles.length) {
        toast.showErrorMessage(
          `This assignment is incomplete. Please select a study and a role to continue.`
        );
        return false;
      }
    }

    // const { spnsr_nm_stnd: sponsorNameStnd, prot_nbr_stnd: protNbrStnd } =
    //   selectedUser;
    // const reqBody = {
    //   sponsorNameStnd,
    //   protNbrStnd,
    //   userId: userInfo.user_id,
    //   insrt_tm: new Date().toISOString(),
    //   updt_tm: new Date().toISOString(),
    // };
    // if (assign) {
    //   reqBody.studies = studiesRows;
    // }
    // setLoading(true);
    // // TODO change api
    // const response = await onboardStudy(reqBody);
    // setLoading(false);
    // if (response.status === "OK") {
    //   toast.showSuccessMessage(response.message, 0);
    //   // unblockRouter();
    //   history.push("/user-management");
    // } else {
    //   toast.showErrorMessage(response.message, 0);
    // }
    return null;
  };

  const AssignUserCopy = () => {
    if (!selectedUser) {
      toast.showErrorMessage("Select a user or create a new one");
      return false;
    }
    return null;
  };

  useEffect(() => {
    if (pingParent !== 0) {
      AssignUserCopy();
    }
  }, [pingParent]);

  useEffect(() => {
    // TODO: Remove Below Comment to load studies data
    // dispatch(getStudyboardData());

    // TODO: Remove Below Line if above is uncommented
    addNewStudy();
  }, []);

  const CustomHeader = ({ focusLastStudy }) => {
    return (
      <Button
        size="small"
        variant="secondary"
        icon={PlusIcon}
        onClick={(e) => {
          document
            .querySelector(".study-table tr:nth-last-child(2) .study input")
            .focus();
        }}
      >
        Add new user assignment
      </Button>
    );
  };
  const columns = [
    {
      header: "Protocol Number",
      accessor: "study",
      width: "50%",
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
      customCell: DeleteStudyCell,
    },
  ];

  const getUserAssignmentTable = React.useMemo(
    () => (
      <>
        <Table
          // isLoading={!load}
          title="User Assignments"
          columns={columns}
          rows={tableStudies.map((row) => ({
            ...row,
            onDelete,
          }))}
          rowProps={{ hover: false }}
          hidePagination={true}
          CustomHeader={CustomHeader}
          headerProps={{ addNewStudy }}
        />
      </>
    ),
    [tableStudies, load]
  );
  return getUserAssignmentTable;
};

export default UserAssignmentTable;
