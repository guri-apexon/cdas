/* eslint-disable import/no-cycle */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useSearchParams } from "react";
import { Link, Route, Switch, BrowserRouter as Router } from "react-router-dom";
import "./ExistingStudyAssignment.scss";
import Typography from "apollo-react/components/Typography";
import PlusIcon from "apollo-react-icons/Plus";
import Button from "apollo-react/components/Button";
import { useDispatch, useSelector } from "react-redux";
import Backdrop from "apollo-react/components/Backdrop";
import CircularProgress from "apollo-react/components/CircularProgress";
import ChevronLeft from "apollo-react-icons/ChevronLeft";
import ChevronRight from "apollo-react-icons/ChevronRight";
import ExistingStudyTable from "./ExistingStudyTable";
import { ReactComponent as StudyDataIcon } from "../../components/Icons/Icon_StudyData_72x72.svg";

import {
  getStudyboardData,
  getNotOnBordedStatus,
} from "../../store/actions/StudyBoardAction";
import AddStudyModal from "../../components/AddStudyModal/AddStudyModal";
import StudySetup from "../StudySetup/StudySetup";

const ExistingStudyAssignment = () => {
  const dispatch = useDispatch();
  const studyData = useSelector((state) => state.studyBoard);
  const [addStudyOpen, setAddStudyOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [selectedStudy, setSelectedStudy] = useState(null);
  const refreshData = () => {
    dispatch(getStudyboardData());
    dispatch(getNotOnBordedStatus());
    setSelectedFilter("");
  };

  const selectedStatus = (val) => {
    setSelectedFilter(val);
  };

  useEffect(() => {
    refreshData();
    setSelectedStudy(null);
  }, []);

  const { studyboardData: Studydata } = studyData;
  const backToSearch = () => {
    setSelectedStudy(null);
  };

  const studyboardData = selectedFilter
    ? Studydata.filter((e) => e.onboardingprogress === selectedFilter)
    : Studydata;

  return (
    <>
      <div className="header-section">
        <div className="header-title">
          <Typography variant="title1">
            <ChevronRight style={{ width: 12, marginRight: 5 }} width={10} />
            Study Setup
          </Typography>
          <Typography variant="title1">
            <ChevronRight style={{ width: 12, marginRight: 5 }} width={10} />
            Manage Users
          </Typography>
        </div>
      </div>

      <div className="header-section">
        <Typography variant="title1">
          <h4>Manage users</h4>
        </Typography>
      </div>

      <Link to="/study-setup" onClick={() => console.log(`link clicked`)}>
        <Button
          className="back-btn"
          variant="text"
          size="small"
          onClick={backToSearch}
        >
          <ChevronLeft style={{ width: 12, marginRight: 5 }} width={10} />
          Back to search
        </Button>
      </Link>

      <ExistingStudyTable
        studyData={studyData}
        studyboardData={studyboardData}
        refreshData={refreshData}
        selectedFilter={selectedFilter}
      />
    </>
  );
};

export default ExistingStudyAssignment;
