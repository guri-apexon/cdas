import React from "react";
import "./StudySetup.scss";
import Typography from "apollo-react/components/Typography";
import PlusIcon from "apollo-react-icons/Plus";
import FileAccountPlan from "apollo-react-icons/FileAccountPlan";
import Button from "apollo-react/components/Button";
import Container from "apollo-react/components/Container";

import StudyNotOnboarded from "../../components/StudySetup/StudyNotOnboarded";

const StudySetup = () => {
  return (
    <Container>
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
        >
          Add New Study
        </Button>
      </div>
      <StudyNotOnboarded />
    </Container>
  );
};

export default StudySetup;
