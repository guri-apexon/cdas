import React from "react";
import ArrowRight from "apollo-react-icons/ArrowRight";
import Button from "apollo-react/components/Button";
import Typography from "apollo-react/components/Typography";
import Tooltip from "apollo-react/components/Tooltip";
import { useHistory } from "react-router-dom";
import CDIIcon from "./CDI_ICON_96x96.svg";
import CAIcon from "./CA_ICON_96x96.svg";
import CDMIcon from "./CDM_ICON_96x96.svg";
import CDRIcon from "./CDR_ICON_96x96.svg";
import DSWIcon from "./DSW_ICON_96x96.svg";

import "./LaunchPad.css";

function LaunchPad() {
  let history = useHistory();

  return (
    <div style={{ height: 'calc(100vh - 184px)', minHeight: 800 }}>
      <div className="header">
        <div>
          <p>Welcome, Oliver Queen</p>
          <h2>Harness the power of your clinical data</h2>
          <Button
            variant="secondary"
            icon={ArrowRight}
            style={{ marginRight: 10 }}
            onClick={() => history.push("study-admin")}
          >
            Quick Link to Study Admin
          </Button>
        </div>
      </div>
      <div className="products">
        <div className="gridContainer">
          <div
            className="productBox haveAccess"
            onClick={() => history.push("cdi")}
          >
            <img src={CDIIcon} alt="CDI Icon" />
            <Typography variant="title2" darkMode>
              Clinical Data Ingestion
            </Typography>
          </div>

          <div className="productBox" onClick={() => history.push("cdm")}>
            <img src={CDMIcon} alt="CDI Icon" />
            <Typography variant="title2" darkMode>
              Clinical Data Mapper
            </Typography>
          </div>
          <div className="productBox" onClick={() => history.push("cdr")}>
            <img src={CDRIcon} alt="CDI Icon" />
            <Typography variant="title2" darkMode>
              Clinical Data Review
            </Typography>
          </div>
          <Tooltip
            variant="light"
            extraLabels={[
              {title: "Clinical Analytics"},
              {  subtitle: "A data visualization platform that allows users to spot trends and anomalies across their study data in order to more quickly make decisions related to data cleanliness, operational efficiency, and drug safety."},
              { title: "Contact your System Administrator for access" },
            ]}
            // title="Clinical Analytics"
            // subtitle="A data visualization platform that allows users to spot trends and anomalies across their study data in order to more quickly make decisions related to data cleanliness, operational efficiency, and drug safety."
            placement="bottom"
          >
            <div className="productBox" onClick={() => history.push("ca")}>
              <img src={CAIcon} alt="CDI Icon" />
              <Typography variant="title2" darkMode>
                Clinical Analytics
              </Typography>
            </div>
          </Tooltip>
          <div className="productBox" onClick={() => history.push("dsw")}>
            <img src={DSWIcon} alt="CDI Icon" />
            <Typography variant="title2" darkMode>
              Data Science Workbench
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LaunchPad;
