/* eslint-disable no-prototype-builtins */
import React, { memo, useEffect, useState } from "react";
import Table, { compareStrings } from "apollo-react/components/Table";
import Search from "apollo-react/components/Search";

const CustomHeader = ({ setSearchText, searchTxt }) => {
  const [txt, setText] = useState(searchTxt);
  const setTextHandler = (e) => {
    setText(e.target.value);
    setSearchText(e.target.value);
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
        autoFocus
        onKeyPress={onKeyPress}
        onChange={setTextHandler}
      />
    </>
  );
};

const PermissionTable = ({
  title,
  data,
  updateData,
  messageContext,
  disabled,
}) => {
  const [tableRows, settableRows] = useState(data);
  const [filteredData, setFilteredData] = useState(data);
  const [searchTxt, setSearchText] = useState("");
  const FeatureCell = ({ row, column: { accessor } }) => {
    return <span className="b-font">{row[accessor]}</span>;
  };
  const handleChange = (e, row) => {
    const { checked, accessor } = e.target;
    const type = e.target.getAttribute("data-accessor");
    const filtered = row.permsn_nm.find((x) => x.name === type);
    filtered.value = checked;
    filtered.updated = true;
    const Read = row.permsn_nm.find((x) => x.name === "Read");
    const Update = row.permsn_nm.find((x) => x.name === "Update");
    const Delete = row.permsn_nm.find((x) => x.name === "Delete");
    const Create = row.permsn_nm.find((x) => x.name === "Create");
    const Download = row.permsn_nm.find((x) => x.name === "Download");
    const updateValue = (obj, val) => {
      obj.value = val;
      obj.updated = true;
    };
    switch (type) {
      case "Create":
        if (checked) {
          if (Read) updateValue(Read, checked);
        }
        break;
      case "Read":
        if (!checked) {
          messageContext.showErrorMessage(
            "Deselecting Read will automatically remove the options for all other options",
            null,
            "info"
          );
          if (Create && Create.value) updateValue(Create, false);
          if (Update && Update.value) updateValue(Update, false);
          if (Delete && Delete.value) updateValue(Delete, false);
          if (Download && Download.value) updateValue(Download, false);
        }
        break;
      case "Delete":
        if (checked) {
          if (Read) updateValue(Read, checked);
          if (Update) updateValue(Update, checked);
        }
        break;
      case "Update":
        if (checked) {
          if (Read) updateValue(Read, checked);
        }
        if (!checked) {
          if (Delete) updateValue(Delete, checked);
        }
        break;
      case "Download":
        if (checked) {
          if (Read) updateValue(Read, checked);
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
    const filtered = row.permsn_nm.find((x) => x.name === accessor);
    if (!filtered) {
      return false;
    }
    return (
      <input
        type="checkbox"
        disabled={disabled}
        className="custom-checkbox"
        data-accessor={accessor}
        checked={filtered.value}
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
      return (
        row.feat_nm.toLowerCase().includes(searchTxt) ||
        row.ctgy_nm.toLowerCase().includes(searchTxt)
      );
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
      <div className="search-header">
        <CustomHeader searchTxt={searchTxt} setSearchText={setSearchText} />
      </div>
      <Table
        title="Permissions"
        subtitle={title === "Admin" ? "CDAS Admin" : title}
        columns={columns}
        rows={filteredData}
        rowsPerPage={tableRows.length}
        initialSortedColumn="ctgy_nm"
        initialSortOrder="asc"
        hasScroll
        maxHeight="calc(100vh - 300px)"
      />
    </div>
  );
};
export default memo(PermissionTable);
