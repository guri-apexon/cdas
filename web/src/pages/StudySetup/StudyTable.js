import React from "react";

import Table from "apollo-react/components/Table";
import { moreColumns } from "./columns";
import rows, { rowsWithExtra } from "./rows.data";

// const CustomHeader = ({
//   onBulkEdit,
//   onBulkDelete,
//   selectedRows,
//   toggleFilters,
// }) => {
//   const menuItems = [
//     {
//       text: "Edit",
//       onClick: onBulkEdit,
//     },
//     {
//       text: "Delete",
//       onClick: onBulkDelete,
//     },
//   ];

//   return (
//     <div>
//       <MenuButton
//         buttonText="Bulk actions"
//         size="small"
//         menuItems={menuItems}
//         disabled={selectedRows.length === 0}
//         style={{ marginRight: 8 }}
//       />
//       <Button
//         size="small"
//         variant="secondary"
//         icon={FilterIcon}
//         onClick={toggleFilters}
//       >
//         {"Filter"}
//       </Button>
//     </div>
//   );
// };

export default function StudyTable() {
  console.log("rowsWith", rowsWithExtra, rows);
  return (
    <div className="study-table">
      <Table
        title="Studies"
        columns={moreColumns}
        rows={rowsWithExtra}
        initialSortedColumn="name"
        initialSortOrder="asc"
        rowsPerPageOptions={[10, 50, 100, "All"]}
        tablePaginationProps={{
          labelDisplayedRows: ({ from, to, count }) =>
            `${count === 1 ? "Item " : "Items"} ${from}-${to} of ${count}`,
          truncate: true,
        }}
        columnSettings={{ enabled: true }}
        headerProps={{}}
      />
      ;
    </div>
  );
}
