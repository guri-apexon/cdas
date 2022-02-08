/* eslint-disable no-shadow */
/* eslint-disable no-useless-escape */
/* eslint-disable no-prototype-builtins */
import React, { useEffect, useState } from "react";

import Button from "apollo-react/components/Button";
import Trash from "apollo-react-icons/Trash";
import IconButton from "apollo-react/components/IconButton";
import Table, { compareStrings } from "apollo-react/components/Table";
import TextField from "apollo-react/components/TextField";

// const initialRows = [
//   {
//     vCId: 8473,
//     name: "Bob Henderson",
//     email: "bhenderson@abc-corp.com",
//   },
//   {
//     vCId: 4856,
//     name: "Lakshmi Patel",
//     email: "lpatel@abc-corp.com",
//   },
//   {
//     vCId: 2562,
//     name: "Cathy Simoyan",
//     email: "csimoyan@abc-corp.com",
//   },
//   {
//     vCId: 2563,
//     name: "Mike Zhang",
//     email: "mzhang@abc-corp.com",
//   },
//   {
//     vCId: 1945,
//     name: "Kai Vongvilay",
//     email: "kvongvilay@abc-corp.com",
//   },
//   {
//     vCId: 2518,
//     name: "Dennis Smith",
//     email: "dsmith@abc-corp.com",
//   },
//   {
//     vCId: 7455,
//     name: "Dennis Reynolds",
//     email: "dreynolds@abc-corp.com",
//   },
// ];
const initialRows = [
  {
    vCId: 1,
    name: "",
    email: "",
    isEmailValid: false,
    isNameValid: false,
    isStarted: false,
  },
];

const CustomHeader = ({ addAContact }) => (
  <Button size="small" variant="secondary" onClick={addAContact}>
    Add Contact
  </Button>
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
  const { isStarted } = row;
  return row.editMode ? (
    <TextField
      size="small"
      fullWidth
      value={row[key]}
      type="email"
      placeholder={header}
      onChange={(e) => row.editEmail(row.vCId, key, e.target.value)}
      error={isStarted && !re.test(row[key])}
      helperText={
        (isStarted && !row[key] && "Required") ||
        (isStarted && !re.test(row[key]) && "Invalid Email Format")
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
    <IconButton
      size="small"
      onClick={() => onRowDelete(vCId)}
      style={{ marginTop: 5 }}
    >
      <Trash />
    </IconButton>
  ) : (
    <></>
  );
};

const columns = [
  {
    header: "ID",
    accessor: "vCId",
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
    width: 50,
    customCell: ActionCell,
    align: "right",
  },
];

const TableEditableAll = ({ updateData }) => {
  const [rows, setRows] = useState(initialRows);
  const [editedRows, setEditedRows] = useState(initialRows);

  // if (sendContacts.length > 1) {
  //   // setRows(sendContacts);
  //   // setEditedRows(sendContacts);
  // } else {
  // setRows(initialRows);
  // setEditedRows(initialRows);
  // }

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
      },
    ]);
  };

  useEffect(() => {
    updateData(editedRows);
  }, [editedRows]);

  //   const onEditAll = () => {
  //     setEditedRows(rows);
  //   };

  //   const onSave = () => {
  //     setRows(editedRows);
  //     setEditedRows([]);
  //   };

  //   const onCancel = () => {
  //     setEditedRows([]);
  //   };

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
      initialSortedColumn="name"
      initialSortOrder="asc"
      rowProps={{ hover: false }}
      height="480px"
      tablePaginationProps={{
        labelDisplayedRows: ({ from, to, count }) =>
          `${count === 1 ? "Items" : "Items"} ${from}-${to} of ${count}`,
        truncate: true,
      }}
      CustomHeader={CustomHeader}
      headerProps={{ addAContact }}
    />
  );
};

export default TableEditableAll;