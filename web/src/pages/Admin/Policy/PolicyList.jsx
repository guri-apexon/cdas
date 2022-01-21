/* eslint-disable react/button-has-type */
import React, { useState, useContext, useEffect } from "react";
import * as XLSX from "xlsx";
import { pick } from "lodash";

import Table, {
  createSelectFilterComponent,
  createStringSearchFilter,
  numberSearchFilter,
  compareNumbers,
  compareStrings,
} from "apollo-react/components/Table";
import Button from "apollo-react/components/Button";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import DownloadIcon from "apollo-react-icons/Download";
import FilterIcon from "apollo-react-icons/Filter";
import Link from "apollo-react/components/Link";
import IconButton from "apollo-react/components/IconButton";
import { TextField } from "apollo-react/components/TextField/TextField";
import Progress from "../../../components/Progress";
import { MessageContext } from "../../../components/MessageProvider";

import {
  createAutocompleteFilter,
  TextFieldFilter,
  IntegerFilter,
  DateFilter,
  createStringArraySearchFilter,
} from "../../../utils/index";

function PolicyList() {
  return (
    <div className="policy-list-wrapper">
      <button>Add a new Policy</button>
    </div>
  );
}

export default PolicyList;
