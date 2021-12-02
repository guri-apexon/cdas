import React from "react";
import ArrowRight from "apollo-react-icons/ArrowRight";
import Button from "apollo-react/components/Button";
import Typography from "apollo-react/components/Typography";
import CDIIcon from "./CDI_ICON_96x96.svg";
import CAIcon from "./CA_ICON_96x96.svg";
import CDMIcon from "./CDM_ICON_96x96.svg";
import CDRIcon from "./CDR_ICON_96x96.svg";
import DSWIcon from "./DSW_ICON_96x96.svg";

import "./LaunchPad.css";

function LaunchPad() {
  return (
    <div>
      <div className="header">
        <div>
          <p>Welcome, Oliver Queen</p>
          <h2>Harness the power of your clinical data</h2>
          <Button
            variant="secondary"
            icon={ArrowRight}
            style={{ marginRight: 10 }}
          >
            {" "}
            Quick Link to Study Admin{" "}
          </Button>
        </div>
      </div>
      <div className="products">
        <div className="gridContainer">
          <div className="productBox">
            <img src={CDIIcon} alt="CDI Icon" />
            <p>Clinical Data Ingestion</p>
          </div>
          <div className="productBox">
            <img src={CDMIcon} alt="CDI Icon" />
            <p>Clinical Data Mapper</p>
          </div>
          <div className="productBox">
            <img src={CDRIcon} alt="CDI Icon" />
            <p>Clinical Data Review</p>
          </div>
          <div className="productBox">
            <img src={CAIcon} alt="CDI Icon" />
            <p>Clinical Analytics</p>
          </div>
          <div className="productBox">
            <img src={DSWIcon} alt="CDI Icon" />
            <p>Data Science Workbench</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LaunchPad;
