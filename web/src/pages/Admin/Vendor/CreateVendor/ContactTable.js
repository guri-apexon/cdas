/* eslint-disable no-shadow */
/* eslint-disable no-useless-escape */
/* eslint-disable no-prototype-builtins */
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Button from "apollo-react/components/Button";
import Trash from "apollo-react-icons/Trash";
import IconButton from "apollo-react/components/IconButton";
import Tooltip from "apollo-react/components/Tooltip";
import Table, {
  compareStrings,
  compareNumbers,
} from "apollo-react/components/Table";
import TextField from "apollo-react/components/TextField";
import PlusIcon from "apollo-react-icons/Plus";

const initialRows = [
  {
    vCId: 1,
    name: "",
    email: "",
    isEmailValid: false,
    isNameValid: false,
    isStarted: false,
    isNew: true,
  },
];

const CustomButtonHeader = ({ addAContact }) => (
  <div>
    <Button
      size="small"
      variant="secondary"
      icon={PlusIcon}
      onClick={addAContact}
    >
      Add contact
    </Button>
  </div>
);

const fieldStyles = {
  style: {
    marginTop: 3,
    marginLeft: -8,
  },
};

const re =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const EditableCell = ({ row, column: { accessor: key, header } }) => {
  const { isStarted } = row;
  const hasError = !row[key] && isStarted;
  return row.editMode ? (
    <TextField
      size="small"
      fullWidth
      value={row[key]}
      type="text"
      placeholder={header}
      onChange={(e) => row.editName(row.vCId, key, e.target.value)}
      error={hasError}
      helperText={hasError && "Required"}
      {...fieldStyles}
    />
  ) : (
    row[key]
  );
};

const EmailEditableCell = ({ row, column: { accessor: key, header } }) => {
  const { isStarted, email } = row;
  return row.editMode ? (
    <TextField
      size="small"
      fullWidth
      value={row[key]}
      type="email"
      placeholder={header}
      onChange={(e) => row.editEmail(row.vCId, key, e.target.value)}
      error={isStarted && !re.test(row[key]) && email.length > 0}
      helperText={
        email.length > 0 &&
        ((isStarted && !row[key] && "Required") ||
          (isStarted && !re.test(row[key]) && "Invalid Email Format"))
      }
      {...fieldStyles}
    />
  ) : (
    row[key]
  );
};

const ActionCell = ({ row }) => {
  const { editMode } = row;
  const { vCId, onRowDelete } = row;
  return editMode ? (
    <Tooltip title="Delete contact">
      <IconButton
        size="small"
        onClick={() => onRowDelete(vCId)}
        style={{ marginTop: 7 }}
      >
        <Trash />
      </IconButton>
    </Tooltip>
  ) : (
    <></>
  );
};

const columns = [
  {
    header: "ID",
    accessor: "vCId",
    sortFunction: compareNumbers,
    hidden: true,
  },
  {
    header: "Contact Name",
    accessor: "name",
    sortFunction: compareStrings,
    customCell: EditableCell,
    type: "text",
  },
  {
    header: "Email Address",
    accessor: "email",
    sortFunction: compareStrings,
    customCell: EmailEditableCell,
    type: "email",
  },
  {
    header: "",
    accessor: "action",
    width: 50,
    customCell: ActionCell,
    align: "right",
  },
];

const TableEditableAll = ({ updateData, deleteAContact }) => {
  const [rows, setRows] = useState(initialRows);
  const [editedRows, setEditedRows] = useState(initialRows);
  const vendor = useSelector((state) => state.vendor);
  const { isEditPage, isCreatePage, selectedContacts } = vendor;

  const addAContact = () => {
    setEditedRows((rw) => [
      ...rw,
      {
        vCId: rw.length + 1,
        name: "",
        email: "",
        isEmailValid: false,
        isNameValid: false,
        isStarted: false,
        isNew: true,
      },
    ]);
  };

  useEffect(() => {
    if (isCreatePage) {
      setEditedRows(initialRows);
    } else if (isEditPage) {
      const updated = selectedContacts.map((c) => ({
        ...c,
        isEmailValid: true,
        isNameValid: true,
        isStarted: false,
        isNew: false,
      }));
      setEditedRows([...updated]);
    }
    // console.log("inside update");
  }, [isEditPage, isCreatePage]);

  useEffect(() => {
    updateData(editedRows);
  }, [editedRows]);

  const editEmail = (vCId, key, value) => {
    if (re.test(value)) {
      setEditedRows((rows) =>
        rows.map((row) =>
          row.vCId === vCId
            ? { ...row, [key]: value, isEmailValid: true, isStarted: true }
            : row
        )
      );
    } else {
      setEditedRows((rows) =>
        rows.map((row) =>
          row.vCId === vCId
            ? { ...row, [key]: value, isEmailValid: false, isStarted: true }
            : row
        )
      );
    }
  };

  const editName = (vCId, key, value) => {
    setEditedRows((rows) =>
      rows.map((row) =>
        row.vCId === vCId
          ? { ...row, [key]: value, isStarted: true, isNameValid: !!row[key] }
          : row
      )
    );
  };

  const onRowDelete = (vCId) => {
    setEditedRows(editedRows.filter((row) => row.vCId !== vCId));
    const allIds = selectedContacts.map((e) => e.vCId);
    if (allIds.includes(vCId)) {
      deleteAContact(vCId);
    }
  };

  const editMode = true;
  return (
    <Table
      title="Vendor Contacts"
      subtitle="CDAS Admin"
      columns={columns}
      rowId="vCId"
      rows={(editMode ? editedRows : rows).map((row) => ({
        ...row,
        onRowDelete,
        editEmail,
        editName,
        editMode,
      }))}
      initialSortedColumn="vCId"
      initialSortOrder="asc"
      rowProps={{ hover: false }}
      height="480px"
      tablePaginationProps={{
        labelDisplayedRows: ({ from, to, count }) =>
          `${count === 1 ? "Item" : "Items"} ${from}-${to} of ${count}`,
        truncate: true,
      }}
      CustomHeader={(props) => (
        <CustomButtonHeader addAContact={addAContact} {...props} />
      )}
    />
  );
};

export default TableEditableAll;
