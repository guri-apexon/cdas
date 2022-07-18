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

import { fetchRoles } from "../../../services/ApiServices";
import { MessageContext } from "../../../components/Providers/MessageProvider";
import { getStudyboardData } from "../../../store/actions/StudyBoardAction";
import MultiSelect from "../../../components/MultiSelect";
import {
  studyOptions,
  STUDY_IDS,
  STUDY_LABELS,
  ALL_NONE_STUDY_ERR_MSG,
} from "../helper";

const UserAssignmentTable = ({
  updateChanges,
  pingParent,
  updateUserAssign,
  setCheckUserAssignmentTableData,
  disableSaveBtn,
}) => {
  const toast = useContext(MessageContext);
  const dispatch = useDispatch();
  const studyData = useSelector((state) => state.studyBoard);

  const [load, setLoad] = useState(false);
  const [studyList, setStudyList] = useState([]);
  const [tableStudies, setTableStudies] = useState([]);
  const [initialRender, setInitialRender] = useState(true);
  const [roleLists, setroleLists] = useState([]);
  const [lastEditedRow, setLastEditedRow] = useState();

  const lineRefs = React.useRef([]);
  const lineRefs2 = React.useRef([]);
  const flags = {};
  useEffect(() => {
    if (tableStudies.length === 0) {
      setLoad(false);
    } else {
      setLoad(true);
    }
    setCheckUserAssignmentTableData(tableStudies);

    if (tableStudies.length > 1) {
      disableSaveBtn(false);
    } else {
      disableSaveBtn(true);
    }

    lineRefs.current = tableStudies.map((_, i) => React.createRef());
    lineRefs2.current = tableStudies.map((_, i) => React.createRef());
    flags.tableStudiesUpdating = false;
  }, [tableStudies]);

  const getStudyObj = () => {
    const rowIndex = Math.max(...tableStudies.map((o) => o.index), 0) + 1;
    return {
      index: rowIndex,
      study: null,
      roles: [],
    };
  };

  const addNewStudy = () => {
    if (flags?.tableStudiesUpdating === true) return true;
    flags.tableStudiesUpdating = true;
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
    setStudyList([...studyOptions, ...filtered]);
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
        setTimeout(() => {
          lineRefs2.current[
            tableIndex
          ].current?.childNodes[0]?.childNodes[0]?.childNodes[0]?.childNodes[1]?.childNodes[1]?.click();
        }, 500);
        return [...newRows, getStudyObj()];
      }
      setTimeout(() => {
        lineRefs2.current[
          tableIndex
        ].current?.childNodes[0]?.childNodes[0]?.childNodes[0]?.childNodes[2]?.childNodes[1]?.click();
      }, 500);

      return newRows;
    });
  };

  const EditableStudy = ({ row, column: { accessor: key } }) => {
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
              ? "This study already has assignments."
              : !initialRender &&
                !row[key] &&
                row.index !== tableStudies[tableStudies.length - 1].index &&
                "Required"
          }
        />
      </div>
    );
  };

  const validateAllStudyNoStudy = (currentRowData, moreStudies = []) => {
    if (!currentRowData) {
      return "";
    }
    const ts = [...tableStudies].map((e) => ({
      ...e,
      prot_id: e?.study?.prot_id,
    }));
    if (currentRowData?.study?.prot_id === STUDY_IDS.ALL_STUDY) {
      const noStudyRowData = [...ts, ...moreStudies].find(
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
    if (currentRowData?.study?.prot_id === STUDY_IDS.NO_STUDY) {
      const allStudyRowData = [...ts, ...moreStudies].find(
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

  const EditableRoles = ({ row, column: { accessor: key } }) => {
    const tableIndex = tableStudies.findIndex((el) => el.index === row.index);

    const currentRowData = tableStudies[tableIndex];

    const [value, setValue] = useState(currentRowData?.roles || []);
    if (row.index === tableStudies[tableStudies.length - 1]?.index)
      return false;

    const editRoleRow = (e, v, r) => {
      setLastEditedRow(tableIndex);
      if (r === "remove-option") {
        const copy = [...tableStudies];
        copy[tableIndex].roles = [...v];
        setTableStudies(copy);
      }
      setValue([...v]);
    };
    const updateStudyRoles = (v) => {
      const copy = [...tableStudies];
      copy[tableIndex].roles = [...v];
      setTableStudies(copy);
    };

    const getErrorText = () => {
      return validateAllStudyNoStudy(currentRowData);
    };
    return (
      <div className="role">
        <AutocompleteV2
          ref={lineRefs2.current[row.index - 1]}
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
          onChange={(e, v, r) => editRoleRow(e, v, r)}
          onBlur={() => updateStudyRoles(value)}
          filterSelectedOptions={false}
          blurOnSelect={false}
          clearOnBlur={false}
          disableCloseOnSelect
          alwaysLimitChips
          enableVirtualization
          error={getErrorText().length}
          helperText={lastEditedRow === tableIndex ? getErrorText() : ""}
        />
      </div>
    );
  };
  const DeleteStudyCell = ({ row }) => {
    if (row.index === tableStudies[tableStudies.length - 1]?.index)
      return false;
    const { index, onDelete } = row;
    return (
      <IconButton size="small" onClick={() => onDelete(index)}>
        <Trash />
      </IconButton>
    );
  };

  const onDelete = (index) => {
    let prevTableStudies = tableStudies;
    const tableIndex = tableStudies.findIndex((el) => el.index === index);
    const tableDuplicateIndex = tableStudies.findIndex(
      (el) =>
        tableStudies[tableIndex]?.study?.prot_id === el?.study?.prot_id &&
        el.index !== index
    );
    if (tableDuplicateIndex > -1) {
      tableStudies[tableDuplicateIndex].alreadyExist = false;
    }
    setTableStudies([...tableStudies]);
    prevTableStudies.splice(tableIndex, 1);
    prevTableStudies = prevTableStudies.map((e, i) => ({
      ...e,
      index: i + 1,
    }));
    if (prevTableStudies.length === 1) {
      prevTableStudies[0].study = null;
    }
    setTableStudies([...prevTableStudies]);
  };

  const AssignUser = async () => {
    updateUserAssign(tableStudies);
    return null;
  };

  useEffect(() => {
    let isError = false;
    if (pingParent !== 0) {
      const allStudies = [...tableStudies].map((e) => ({
        ...e,
        prot_id: e?.study?.prot_id,
      }));
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
        isError = true;
      }

      if (!isError) {
        AssignUser();
      }
    }
  }, [pingParent]);

  useEffect(() => {
    dispatch(getStudyboardData());
  }, []);

  const CustomHeader = ({ focusLastStudy }) => {
    return (
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
    );
  };
  const columns = [
    {
      header: "Protocol Number",
      accessor: "study",
      width: "30%",
      customCell: EditableStudy,
    },
    {
      header: "Role",
      accessor: "roles",
      width: "65.5%",
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
          isLoading={!load}
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
