/* eslint-disable no-prototype-builtins */
import React, { memo, useEffect, useState } from "react";
import Table, { compareStrings } from "apollo-react/components/Table";
import Button from "apollo-react/components/Button";
import PlusIcon from "apollo-react-icons/Plus";

const ContactsTable = ({ title, data, messageContext }) => {
  const [tableRows, settableRows] = useState(data);
  const [filteredData, setFilteredData] = useState(data);

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
        >
          Add Contact
        </Button>
      </>
    );
  };

  const columns = [
    {
      header: "Contact Name",
      accessor: "ctgy_nm",
      sortFunction: compareStrings,
    },
    {
      header: "Email Address",
      accessor: "Download",
      customCell: checkboxCell,
    },
    {
      header: "",
      accessor: "Enable",
      width: 100,
      customCell: checkboxCell,
    },
  ];

  const addAContact = () => {};
  return (
    <div className="permission-table-wrapper">
      <div className="search-header">
        <CustomHeader addAContact={addAContact} />
      </div>
      <Table
        title="Vendor Contacts"
        subtitle={title}
        columns={columns}
        rows={filteredData}
        rowsPerPage={tableRows.length}
        initialSortedColumn="ctgy_nm"
        initialSortOrder="asc"
      />
    </div>
  );
};
export default memo(ContactsTable);
