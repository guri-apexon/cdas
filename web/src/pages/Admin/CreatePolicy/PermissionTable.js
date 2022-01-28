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
import Search from "apollo-react/components/Search";

const CustomHeader = ({ setSearchText, searchTxt }) => {
  const [txt, setText] = useState(searchTxt);
  const setTextHandler = (e) => {
    setText(e.target.value);
  };
  const onKeyPress = (e) => {
    if (e.key === "Enter") {
      setSearchText(e.target.value);
    }
  };
  return (
    <>
      <Search
        placeholder="Search"
        size="small"
        value={txt}
        onKeyPress={onKeyPress}
        onChange={setTextHandler}
      />
    </>
  );
};

const PermissionTable = ({ title, data, updateData, messageContext }) => {
  const [tableRows, settableRows] = useState(data);
  const [filteredData, setFilteredData] = useState(data);
  const [searchTxt, setSearchText] = useState("");
  const FeatureCell = ({ row, column: { accessor } }) => {
    return <span className="b-font">{row[accessor]}</span>;
  };
  const handleChange = (e, row) => {
    const { checked, accessor } = e.target;
    const type = e.target.getAttribute("data-accessor");
    row.permsn_nm[type] = checked;
    switch (type) {
      case "Create":
        if (checked) {
          if (row.permsn_nm.hasOwnProperty("Read"))
            row.permsn_nm.Read = checked;
        }
        break;
      case "Update":
        if (row.permsn_nm.hasOwnProperty("Read")) row.permsn_nm.Read = checked;
        if (!checked) {
          if (row.permsn_nm.hasOwnProperty("Delete"))
            row.permsn_nm.Delete = checked;
        }
        break;
      case "Read":
        if (!checked) {
          messageContext.showErrorMessage(
            "Deselecting Read will automatically remove the options for all other options",
            null,
            "info"
          );
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
        if (checked) {
          if (row.permsn_nm.hasOwnProperty("Read"))
            row.permsn_nm.Read = checked;
          if (row.permsn_nm.hasOwnProperty("Update"))
            row.permsn_nm.Update = checked;
        }
        break;
      case "Download":
        if (checked) {
          if (row.permsn_nm.hasOwnProperty("Read"))
            row.permsn_nm.Read = checked;
        }
        break;
      default:
        break;
    }
    const tableData = [
      ...new Set([...filteredData, ...tableRows].map((obj) => obj)),
    ];
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
      sortFunction: compareStrings,
      width: 150,
    },
    {
      header: <span className="b-font">Features</span>,
      accessor: "feat_nm",
      sortFunction: compareStrings,
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
    const newRows = tableRows.filter((row) => {
      return row.feat_nm.toLowerCase().includes(searchTxt);
    });
    setFilteredData(newRows);
  }, [searchTxt]);
  useEffect(() => {
    console.log("table Updated");
    settableRows(data);
    if (filteredData.length === 0) setFilteredData(data);
  }, [data]);
  return (
    <div className="permission-table-wrapper">
      <Table
        title="Permissions"
        subtitle={title}
        columns={columns}
        rows={filteredData}
        rowsPerPage={tableRows.length}
        CustomHeader={() => (
          <CustomHeader searchTxt={searchTxt} setSearchText={setSearchText} />
        )}
        initialSortedColumn="feat_nm"
        initialSortOrder="asc"
      />
    </div>
  );
};
export default memo(PermissionTable);
