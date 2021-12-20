/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import "./StudySetup.scss";
import Typography from "apollo-react/components/Typography";
import PlusIcon from "apollo-react-icons/Plus";
import FileAccountPlan from "apollo-react-icons/FileAccountPlan";
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

  const refreshData = () => {
    dispatch(getStudyboardData());
    dispatch(getNotOnBordedStatus());
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <div className="study-setup-wrapper">
      <AddStudyModal
        open={addStudyOpen}
        onClose={() => setAddStudyOpen(false)}
      />
      <div className="header-section">
        <div className="header-title">
          <FileAccountPlan style={{ marginRight: "18px" }} />
          <Typography variant="title1">Study Setup</Typography>
        </div>
        <Button
          variant="primary"
          icon={<PlusIcon />}
          size="small"
          style={{ float: "right" }}
          onClick={() => setAddStudyOpen(!addStudyOpen)}
        >
          Add New Study
        </Button>
      </div>
      <StudyNotOnboarded studyData={studyData} />
      <StudyTable studyData={studyData} refreshData={refreshData} />
    </div>
  );
};

export default StudySetup;
