/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import "./StudySetup.scss";
import Typography from "apollo-react/components/Typography";
import PlusIcon from "apollo-react-icons/Plus";
import Button from "apollo-react/components/Button";
import { useDispatch, useSelector } from "react-redux";
import StudyNotOnboarded from "./StudyNotOnboarded";
import StudyTable from "./StudyTable";

import {
  getStudyboardData,
  getNotOnBordedStatus,
} from "../../store/actions/StudyBoardAction";

import AddStudyModal from "../../components/AddStudyModal/AddStudyModal";

const StudySetup = () => {
  const dispatch = useDispatch();
  const studyData = useSelector((state) => state.studyBoard);
  const [addStudyOpen, setAddStudyOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("");
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
  }, []);

  const { studyboardData: Studydata } = studyData;

  const studyboardData = selectedFilter
    ? Studydata.filter((e) => e.onboardingprogress === selectedFilter)
    : Studydata;

  return (
    <div className="study-setup-wrapper">
      {/* <Backdrop style={{ zIndex: 9 }} open={studyData?.loading ?? false}>
        <CircularProgress variant="indeterminate" size="small" />
      </Backdrop> */}
      <AddStudyModal
        open={addStudyOpen}
        onClose={() => setAddStudyOpen(false)}
      />
      <div className="header-section">
        <div className="header-title">
          <Typography className="study-setup-wrapper-title" variant="title1">
            Study Setup
          </Typography>
        </div>
        <Button
          variant="primary"
          icon={<PlusIcon />}
          size="small"
          style={{ float: "right" }}
          onClick={() => setAddStudyOpen(!addStudyOpen)}
        >
          Add new study
        </Button>
      </div>
      <StudyNotOnboarded
        studyData={studyData}
        selectedStatus={selectedStatus}
        selectedFilter={selectedFilter}
      />
      <StudyTable
        studyData={studyData}
        studyboardData={studyboardData}
        refreshData={refreshData}
      />
    </div>
  );
};

export default StudySetup;
