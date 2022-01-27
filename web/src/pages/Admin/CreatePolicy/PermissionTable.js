/* eslint-disable no-prototype-builtins */
import React, { memo, useEffect, useState } from "react";
import Table, {
  createSelectFilterComponent,
  createStringSearchFilter,
  dateFilterV2,
  numberSearchFilter,
  compareDates,
  compareNumbers,
  compareStrings,
} from "apollo-react/components/Table";
import Checkbox from "apollo-react/components/Checkbox";
import Search from "apollo-react/components/Search";

const CustomHeader = ({ setFeatureList }) => {
  return (
    <>
      <Search
        placeholder="Search"
        size="small"
        onChange={(e) => setFeatureList(e.target.value)}
      />
    </>
  );
};

const PermissionTable = ({ title, data, updateData }) => {
  const [tableRows, settableRows] = useState(data);
  const FeatureCell = ({ row, column: { accessor } }) => {
    return <span className="b-font">{row[accessor]}</span>;
  };
  const handleChange = (e, row) => {
    const { checked, accessor } = e.target;
    const type = e.target.getAttribute("data-accessor");
    row.permsn_nm[type] = checked;
    switch (type) {
      case "Create":
        if (row.permsn_nm.hasOwnProperty("Read")) row.permsn_nm.Read = checked;
        break;
      case "Update":
        if (row.permsn_nm.hasOwnProperty("Read")) row.permsn_nm.Read = checked;
        break;
      case "Read":
        if (!checked) {
          if (row.permsn_nm.hasOwnProperty("Create"))
            row.permsn_nm.Create = false;
          if (row.permsn_nm.hasOwnProperty("Update"))
            row.permsn_nm.Update = false;
          if (row.permsn_nm.hasOwnProperty("Delete"))
            row.permsn_nm.Delete = false;
          if (row.permsn_nm.hasOwnProperty("Download"))
            row.permsn_nm.Download = false;
        }
        break;
      case "Delete":
        if (row.permsn_nm.hasOwnProperty("Read")) row.permsn_nm.Read = checked;
        if (row.permsn_nm.hasOwnProperty("Update"))
          row.permsn_nm.Update = checked;
        break;
      case "Download":
        if (row.permsn_nm.hasOwnProperty("Read")) row.permsn_nm.Read = checked;
        break;
      default:
        break;
    }
    const tableData = [...tableRows];
    // settableRows(tableData);
    updateData({ product: title, data: tableData });
  };
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
  const columns = [
    {
      header: "Category",
      accessor: "ctgy_nm",
      width: 150,
    },
    {
      header: <span className="b-font">Features</span>,
      accessor: "feat_nm",
      customCell: FeatureCell,
    },
    {
      header: "Read",
      accessor: "Read",
      width: 100,
      customCell: checkboxCell,
    },
    {
      header: "Update",
      accessor: "Update",
      width: 100,
      customCell: checkboxCell,
    },
    {
      header: "Create",
      accessor: "Create",
      width: 100,
      customCell: checkboxCell,
    },
    {
      header: "Delete",
      accessor: "Delete",
      width: 100,
      customCell: checkboxCell,
    },
    {
      header: "Download",
      accessor: "Download",
      width: 100,
      customCell: checkboxCell,
    },
    {
      header: "Enable",
      accessor: "Enable",
      width: 100,
      customCell: checkboxCell,
    },
  ];
  const handleCheckox = (e, checked) => {
    console.log("columnName", checked);
  };
  useEffect(() => {
    console.log("table Updated");
    settableRows(data);
  }, [data]);
  return (
    <div className="permission-table-wrapper">
      <Table
        title="Permissions"
        subtitle={title}
        columns={columns}
        rows={tableRows}
        rowsPerPage={tableRows.length}
        CustomHeader={() => <CustomHeader />}
      />
    </div>
  );
};
export default memo(PermissionTable);
