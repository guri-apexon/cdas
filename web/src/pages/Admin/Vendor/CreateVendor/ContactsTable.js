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

const EditableCell = ({ row, column: { accessor: key } }) => {
  // const errorText = checkRequired(row[key]);
  return row.editMode ? (
    <TextField
      size="small"
      fullWidth
      value={row[key]}
      type={key === "columnName" ? "emailId" : "text"}
      onChange={(e) => row.editRow(row.vCId, key, e.target.value)}
      {...fieldStyles}
    />
  ) : (
    row[key]
  );
};

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

  const handleChange = (e, row) => {};
  const checkboxCell = ({ row, column: { accessor } }) => {
    if (!row.permsn_nm.hasOwnProperty(accessor)) {
      return false;
    }
    return (
      <input
        type="checkbox"
        className="custom-checkbox"
        data-accessor={accessor}
        checked={row.permsn_nm[accessor]}
        onChange={(e) => handleChange(e, row)}
      />
    );
  };

  const CustomHeader = ({ addAContact }) => {
    return (
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
  };

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

  const editRow = (vCId, key, value, errorTxt) => {
    // console.log(uniqueId, "ColumdId");
    setEditedRows((rws) =>
      rws.map((row) => {
        if (row.vCId === vCId) {
          if (row.isInitLoad) {
            return {
              ...row,
              [key]: value,
            };
          }
          return {
            ...row,
            [key]: value,
          };
        }
        return row;
      })
    );
  };

  const editMode = true;
  return (
    <div className="table-wrapper">
      <div className="search-header">
        <CustomHeader addAContact={addAContact} />
      </div>
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
        initialSortedColumn="contactName"
        initialSortOrder="asc"
      />
    </div>
  );
};
export default memo(ContactsTable);
