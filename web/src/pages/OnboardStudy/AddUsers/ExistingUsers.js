/* eslint-disable no-return-assign */
/* eslint-disable no-use-before-define */
/* eslint-disable consistent-return */
/* eslint-disable no-script-url */
/* eslint-disable react/button-has-type */
import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, Link, useLocation } from "react-router-dom";
import FilterIcon from "apollo-react-icons/Filter";
import Table from "apollo-react/components/Table";
import PlusIcon from "apollo-react-icons/Plus";
import Button from "apollo-react/components/Button";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import Box from "apollo-react/components/Box";
import Grid from "apollo-react/components/Grid";
import Modal from "apollo-react/components/Modal";
import ProjectHeader from "apollo-react/components/ProjectHeader";
import EllipsisVerticalIcon from "apollo-react-icons/EllipsisVertical";
import Tooltip from "apollo-react/components/Tooltip";
import IconMenuButton from "apollo-react/components/IconMenuButton";
import "../OnboardStudy.scss";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import ChevronLeft from "apollo-react-icons/ChevronLeft";
import { MessageContext } from "../../../components/Providers/MessageProvider";
import {
  fetchRoles,
  getAssignedUsers,
  updateAssignUser,
  deleteAssignUser,
} from "../../../services/ApiServices";
import { getUserInfo } from "../../../utils";
import AddNewUserModal from "../../../components/AddNewUserModal/AddNewUserModal";

const ActionCell = ({ row }) => {
  const {
    indexId,
    onRowEdit,
    onRowSave,
    editMode,
    onCancel,
    editedRow,
    onRowDelete,
  } = row;
  const menuItems = [
    { text: "Edit", id: 1, onClick: () => onRowEdit(row.indexId) },
    { text: "Delete", id: 2, onClick: () => onRowDelete(row.indexId) },
  ];
  return editMode ? (
    <div style={{ marginTop: 8, whiteSpace: "nowrap" }}>
      <Button size="small" style={{ marginRight: 8 }} onClick={onCancel}>
        Cancel
      </Button>
      <Button
        size="small"
        variant="primary"
        onClick={onRowSave}
        disabled={
          Object.values(editedRow).some((item) => !item) ||
          (editMode &&
            !Object.keys(editedRow).some((key) => editedRow[key] !== row[key]))
        }
      >
        Save
      </Button>
    </div>
  ) : (
    <Tooltip title="Actions" disableFocusListener>
      <IconMenuButton id="actions" menuItems={menuItems} size="small">
        <EllipsisVerticalIcon />
      </IconMenuButton>
    </Tooltip>
  );
};

const ExistingUsers = () => {
  const history = useHistory();
  const userInfo = getUserInfo();
  const toast = useContext(MessageContext);

  const [tableUsers, setTableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleLists, setroleLists] = useState([]);
  const [stateMenuItems, setStateMenuItems] = useState([]);
  const studyData = useSelector((state) => state.studyBoard);
  const [addStudyOpen, setAddStudyOpen] = useState(false);
  const { selectedStudy } = studyData;
  const { prot_id: protocol } = selectedStudy;

  const getData = async (id) => {
    const data = await getAssignedUsers(id);
    const formattedData = await data.data.map((e, i) => {
      const userObj = {
        alreadyExist: false,
        editMode: false,
        indexId: i + 1,
        user: {
          userId: e.usr_id,
          email: e.usr_mail_id,
          label: `${e.usr_fst_nm} ${e.usr_lst_nm} (${e.usr_mail_id})`,
        },
        roles: e.roles.map((d) => ({ value: d.role_id, label: d.role_nm })),
      };
      return userObj;
    });
    console.log("formatted", formattedData);
    setTableUsers([...formattedData]);
    setLoading(false);
  };

  useEffect(() => {
    const updateData = [
      { label: "Protocol Number", value: selectedStudy?.protocolnumber },
      { label: "Sponsor", value: selectedStudy?.sponsorname },
      { label: "Phase", value: selectedStudy?.phase },
      { label: "Project Code", value: selectedStudy?.projectcode },
      { label: "Protocol Status", value: selectedStudy?.protocolstatus },
      { label: "Therapeutic Area", value: selectedStudy?.therapeuticarea },
    ];
    setStateMenuItems([...updateData]);
    getData(protocol);
  }, [selectedStudy]);

  const breadcrumpItems = [
    { href: "javascript:void(0)", onClick: () => history.push("/launchpad") },
    {
      href: "javascript:void(0)",
      title: "Study Setup",
      onClick: () => history.push("/study-setup"),
    },
    {
      title: "Manage Users",
    },
  ];

  const getRoles = async () => {
    const result = await fetchRoles();
    setroleLists(result || []);
  };

  useEffect(() => {
    getRoles();
  }, []);

  const editRow = (e, value, reason, index, key) => {
    setTableUsers((rows) =>
      rows.map((row) => {
        if (row.index === index) {
          return { ...row, [key]: value };
        }
        return row;
      })
    );
  };

  const EditableRoles = ({ row, column: { accessor: key } }) => {
    return (
      <AutocompleteV2
        size="small"
        fullWidth
        multiple
        forcePopupIcon
        chipColor="white"
        source={roleLists}
        value={row[key]}
        onChange={(e, v, r) => editRow(e, v, r, row.index, key)}
        error={!row[key]}
        helperText={!row[key] && "Required"}
      />
    );
  };

  const onRowDelete = async (index) => {
    const selected = await tableUsers.find((row) => row.index === index);
    deleteAssignUser({
      protocol,
      loginId: userInfo.user_id,
      users: [selected.userId],
    });
    setTableUsers(tableUsers.filter((row) => row.index !== index));
  };

  const onRowEdit = async (index) => {
    const selected = await tableUsers.find((row) => row.index === index);
    const tempTable = tableUsers.filter((row) => row.index !== index);
    selected.editMode = true;
    setTableUsers([...tempTable, selected]);
  };

  const columns = [
    {
      header: "User",
      accessor: "user",
      width: "50%",
    },
    {
      header: "Role",
      accessor: "roles",
      customCell: EditableRoles,
      width: "50%",
    },
    {
      accessor: "action",
      customCell: ActionCell,
      align: "right",
    },
  ];

  const CustomHeader = ({ toggleFilters }) => {
    return (
      <>
        <AddNewUserModal
          open={addStudyOpen}
          onClose={() => setAddStudyOpen(false)}
          users={tableUsers.map((e) => e.user)}
          protocol={protocol}
        />
        <div>
          <Button
            size="small"
            variant="secondary"
            icon={PlusIcon}
            onClick={() => setAddStudyOpen(!addStudyOpen)}
            style={{ marginRight: 16 }}
          >
            Add new users
          </Button>
          <Button
            size="small"
            variant="secondary"
            icon={FilterIcon}
            onClick={toggleFilters}
            // disabled={rows.length <= 0}
          >
            Filter
          </Button>
        </div>
      </>
    );
  };

  const backToSearch = () => {
    // setSelectedStudy(null);
  };

  return (
    <>
      <div className="container">
        <ProjectHeader
          menuItems={stateMenuItems}
          maxCellWidth={280}
          style={{ height: 64, zIndex: 998 }}
        />
      </div>
      <div className="existing-study-wrapper">
        <div className="top-content">
          <Box className="onboard-header">
            <BreadcrumbsUI className="breadcrump" items={breadcrumpItems} />
          </Box>
          <div className="header-title">Manage Users</div>
        </div>
        <div className="bottom-content">
          <Link to="/study-setup" className="removeUnderLine">
            <Button
              className="back-btn"
              variant="text"
              size="small"
              onClick={backToSearch}
            >
              <ChevronLeft style={{ width: 12, marginRight: 5 }} width={10} />
              Back to Study Setup
            </Button>
          </Link>
          <Grid item xs={12}>
            <div className="user-table">
              <Table
                loading={loading}
                title="User Assignments"
                columns={columns}
                rowId="indexId"
                rows={tableUsers.map((row) => ({
                  ...row,
                  onRowEdit,
                  onRowDelete,
                }))}
                rowProps={{ hover: false }}
                hidePagination={true}
                CustomHeader={CustomHeader}
              />
            </div>
          </Grid>
        </div>
      </div>
    </>
  );
};

export default ExistingUsers;
