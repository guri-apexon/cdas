/* eslint-disable no-prototype-builtins */
import React, { memo, useEffect, useState } from "react";
import Table, { compareStrings } from "apollo-react/components/Table";
import Button from "apollo-react/components/Button";
import PlusIcon from "apollo-react-icons/Plus";
import TextField from "apollo-react/components/TextField";
import Trash from "apollo-react-icons/Trash";
import IconButton from "apollo-react/components/IconButton";

const fieldStyles = {
  style: {
    marginTop: 3,
    marginLeft: -8,
  },
};

// const checkRequired = (value) => {
//   if (!value || (typeof value === "string" && !value.trim())) {
//     return "Required";
//   }
//   return false;
// };

// const EditableCell = ({ row, column: { accessor: key } }) => {
//   // const errorText = checkRequired(row[key]);
//   return row.editMode ? (
//     <TextField
//       size="small"
//       fullWidth
//       value={row[key]}
//       type={key === "columnName" ? "emailId" : "text"}
//       onChange={(e) => row.editRow(row.vCId, key, e.target.value)}
//       {...fieldStyles}
//     />
//   ) : (
//     row[key]
//   );
// };

// const EditableCell = ({ row, column: { accessor: key } }) =>
//   row.editMode ? (
//     <TextField
//       size="small"
//       fullWidth
//       value={row.editedRow[key]}
//       onChange={(e) => row.editRow(key, e.target.value)}
//       type={key === "columnName" ? "emailId" : "text"}
//       error={!row.editedRow[key]}
//       helperText={!row.editedRow[key] && "Required"}
//       {...fieldStyles}
//     />
//   ) : (
//     row[key]
//   );

const EditableCell = ({ row, column: { accessor: key } }) =>
  row.editMode ? (
    <TextField
      size="small"
      fullWidth
      value={row[key]}
      type={key === "contactName" ? "email" : "text"}
      onChange={(e) => row.editRow(row.vCId, key, e.target.value)}
      // error={!row[key]}
      // helperText={!row[key] && "Required"}
      {...fieldStyles}
    />
  ) : (
    row[key]
  );

const ActionCell = ({ row }) => {
  const eMode = row.editMode ?? true;
  const { vCId, onRowDelete } = row;
  return eMode ? (
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

const CustomHeader = ({ addAContact }) => (
  <>
    <Button
      variant="secondary"
      icon={<PlusIcon />}
      size="small"
      style={{ marginRight: "8px", marginTop: "16px", border: "none" }}
      onClick={addAContact}
    >
      Add Contact
    </Button>
  </>
);

const ContactsTable = ({ messageContext }) => {
  const initialRows = [
    {
      vCId: 1,
      contactName: "",
      emailId: "",
      isInitLoad: true,
      isHavingError: false,
    },
  ];

  const [tableRows, setTableRows] = useState(initialRows);
  const [editedRows, setEditedRows] = useState(initialRows);

  const columns = [
    {
      header: "Contact Name",
      accessor: "contactName",
      sortFunction: compareStrings,
      customCell: EditableCell,
    },
    {
      header: "Email Address",
      accessor: "emailId",
      customCell: EditableCell,
    },
    {
      header: "",
      width: 50,
      customCell: ActionCell,
      align: "right",
    },
  ];

  const addAContact = () => {
    setEditedRows((rw) => [
      ...rw,
      {
        vCId: rw.length + 1,
        contactName: "",
        emailId: "",
        isInitLoad: true,
        isHavingError: false,
      },
    ]);
  };

  const onRowDelete = (vCId) => {
    setTableRows(tableRows.filter((row) => row.vCId !== vCId));
    setEditedRows(editedRows.filter((row) => row.vCId !== vCId));
  };

  const editRow = (vCId, key, value) => {
    setEditedRows((rows) =>
      rows.map((row) => (row.vCId === vCId ? { ...row, [key]: value } : row))
    );
  };

  // const editRow = (vCId, key, value) => {
  //   setEditedRows((rws) =>
  //     rws.map((row) => {
  //       if (row.vCId === vCId) {
  //         return {
  //           ...row,
  //           [key]: value,
  //         };
  //       }
  //       return row;
  //     })
  //   );
  // };

  const editMode = true;
  return (
    <div className="table-wrapper">
      <Table
        title="Vendor Contacts"
        subtitle="CDAS Admin"
        columns={columns}
        rows={(editMode ? editedRows : tableRows).map((row) => ({
          ...row,
          onRowDelete,
          editRow,
          editMode,
        }))}
        initialSortedColumn="vCId"
        initialSortOrder="asc"
        tablePaginationProps={{
          labelDisplayedRows: ({ from, to, count }) =>
            `${count === 1 ? "Items" : "Items"} ${from}-${to} of ${count}`,
          truncate: true,
        }}
        CustomHeader={CustomHeader}
        headerProps={{ addAContact }}
      />
    </div>
  );
};
export default memo(ContactsTable);
