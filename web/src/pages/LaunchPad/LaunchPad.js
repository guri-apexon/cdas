/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/no-array-index-key */
import React from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import ArrowRight from "apollo-react-icons/ArrowRight";
import Button from "apollo-react/components/Button";
import Typography from "apollo-react/components/Typography";
import Tooltip from "apollo-react/components/Tooltip";
import { useHistory } from "react-router-dom";
import { titleCase, getUserInfo } from "../../utils/index";
import CDIIcon from "./CDI_ICON_96x96.svg";
import CAIcon from "./CA_ICON_96x96.svg";
import CDMIcon from "./CDM_ICON_96x96.svg";
import CDRIcon from "./CDR_ICON_96x96.svg";
import DSWIcon from "./DSW_ICON_96x96.svg";
import "./LaunchPad.scss";

const CustomTooltip = withStyles(() => ({
  tooltip: {
    maxWidth: 400,
    padding: "10px 16px",
  },
}))(Tooltip);

const productArr = [
  {
    title: "Clinical Data Ingestion",
    haveAccess: true,
    imgUrl: CDIIcon,
    url: "cdi",
    tooltipText:
      "Business friendly technology to accelerate the setup and management of clinical study data ingestion acquisition from any source, for any data type, for any data type.",
  },
  {
    title: "Clinical Data Mapper",
    haveAccess: false,
    imgUrl: CDMIcon,
    url: "cdm",
    tooltipText:
      "Intelligent data transformation tool to harmonize study data into standardized datasets.",
  },
  {
    title: "Clinical Data Review",
    haveAccess: false,
    imgUrl: CDRIcon,
    url: "cdr",
    tooltipText:
      "An end-to-end data review experience that enables cross team collaboration and empowerment for a more effective, accelerated, and personalized review experience.",
  },
  {
    title: "Clinical Analytics",
    haveAccess: false,
    imgUrl: CAIcon,
    url: "ca",
    tooltipText:
      "Business Intelligence and visualization capabilities enabling data-driven decision making related to data quality, operational efficiency, and drug safety.",
  },
  {
    title: "Data Science Workbench",
    haveAccess: false,
    imgUrl: DSWIcon,
    url: "dsw",
    tooltipText:
      "Programming toolkit providing self-service data science and statistical programming.",
  },
];

const LaunchPad = () => {
  const history = useHistory();
  const userInfo = getUserInfo();

  const { fullName } = userInfo;

  return (
    <div className="lauchpad-wrapper">
      <div className="header">
        <div>
          <Typography gutterBottom darkMode>
            {`Welcome, ${titleCase(fullName)}`}
          </Typography>
          <h2>Harness the power of your clinical data</h2>
          <Button
            variant="secondary"
            icon={ArrowRight}
            style={{ marginRight: 10 }}
            onClick={() => history.push("study-setup")}
          >
            Quick Link to Study Setup
          </Button>
        </div>
      </div>
      <div className="products">
        <div className="gridContainer">
          {productArr.map((product, i) => {
            const productBox = (
              <div className="full-width">
                <img src={product.imgUrl} alt={product.title} />
                <Typography variant="title2" darkMode>
                  {product.title}
                </Typography>
              </div>
            );
            return (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events
              <div
                key={i}
                onClick={() => product.haveAccess && history.push(product.url)}
                className={
                  // eslint-disable-next-line prefer-template
                  "productBox " + (product.haveAccess ? "haveAccess" : "")
                }
              >
                <CustomTooltip
                  variant="light"
                  title={
                    // eslint-disable-next-line react/jsx-wrap-multilines
                    <span style={{ fontSize: 16, fontWeight: 600 }}>
                      {product.title}
                    </span>
                  }
                  subtitle={
                    // eslint-disable-next-line react/jsx-wrap-multilines
                    <span style={{ fontSize: 14, color: "#444444" }}>
                      {product.tooltipText}
                    </span>
                  }
                  extraLabels={
                    product.haveAccess
                      ? null
                      : [
                          {
                            title: (
                              <span style={{ fontSize: 14, fontWeight: 600 }}>
                                Contact your System Administrator for access
                              </span>
                            ),
                          },
                        ]
                  }
                  placement="bottom"
                >
                  {productBox}
                </CustomTooltip>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LaunchPad;
