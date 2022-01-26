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

const CustomHeader = () => {
  return (
    <>
      <Search placeholder="Search" size="small" />
    </>
  );
};

const PermissionTable = ({ data }) => {
  const [tableRows, settableRows] = useState(data);
  const FeatureCell = ({ row, column: { accessor } }) => {
    return <span className="b-font">{row[accessor]}</span>;
  };
  const handleChange = (e, row) => {
    const { checked, accessor } = e.target;
    const type = e.target.getAttribute("data-accessor");
    switch (type) {
      case "create":
        break;
      default:
        break;
    }
    console.log("columnName", checked, type, row);
  };
  const checkboxCell = ({ row, column: { accessor } }) => {
    return (
      <>
        {row.permsn_nm.includes(accessor) && (
          <input
            type="checkbox"
            className="custom-checkbox"
            data-accessor={accessor}
            onChange={(e) => handleChange(e, row)}
          />
        )}
      </>
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
    settableRows(data);
  }, [data]);
  return (
    <div className="permission-table-wrapper">
      <Table
        title="Permissions"
        subtitle="CDAS Admin"
        columns={columns}
        rows={tableRows}
        rowsPerPage={tableRows.length}
        CustomHeader={() => <CustomHeader />}
      />
      {/* <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>
              <span className="b-font">Features</span>
            </th>
            <th>Read</th>
            <th>Update</th>
            <th>Create</th>
            <th>Delete</th>
            <th>Download</th>
            <th>Enable</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row, i) => {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <tr key={i}>
                <td>{row.prod_nm}</td>
                <td>{row.ctgy_nm}</td>
                <td>
                  <Checkbox onChange={handleCheckox} />
                </td>
                <td>
                  <Checkbox onChange={handleCheckox} />
                </td>
                <td>
                  <Checkbox onChange={handleCheckox} />
                </td>
                <td>
                  <Checkbox onChange={handleCheckox} />
                </td>
                <td>
                  <Checkbox onChange={handleCheckox} />
                </td>
                <td>
                  <Checkbox onChange={handleCheckox} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table> */}
    </div>
  );
};
export default memo(PermissionTable);
