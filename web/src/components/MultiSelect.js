import React, { useState } from "react";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";

export default function MultiSelect({ roleLists, row, tableStudies }) {
  const [value, setValue] = useState(tableStudies[row.index - 1]?.roles || []);
  const editRow = (e, v, r) => {
    setValue([...v]);
    tableStudies[row.index - 1].roles = [...v];
  };
  return (
    <div>
      <AutocompleteV2
        placeholder={!value.length ? "Choose one or more roles" : ""}
        size="small"
        fullWidth
        multiple
        forcePopupIcon
        showCheckboxes
        chipColor="white"
        source={roleLists}
        limitChips={5}
        value={value}
        onChange={(e, v, r) => editRow(e, v, r)}
        filterSelectedOptions={false}
        blurOnSelect={false}
        clearOnBlur={false}
        disableCloseOnSelect
        alwaysLimitChips
        enableVirtualization
      />
    </div>
  );
}
