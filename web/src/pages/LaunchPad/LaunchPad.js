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

const productArr = [
  {
    title: 'Clinical Data Ingestion',
    haveAccess: true,
    imgUrl: CDIIcon,
    url: 'cdi'
  },
  {
    title: 'Clinical Data Mapper',
    haveAccess: false,
    imgUrl: CDMIcon,
    url: 'cdm'
  },
  {
    title: 'Clinical Data Review',
    haveAccess: false,
    imgUrl: CDRIcon,
    url: 'cdr'
  },
  {
    title: 'Clinical Analytics',
    haveAccess: false,
    imgUrl: CAIcon,
    url: 'ca'
  },
  {
    title: 'Data Science Workbench',
    haveAccess: false,
    imgUrl: DSWIcon,
    url: 'dsw'
  },
];

function LaunchPad() {
  let history = useHistory();

  return (
    <div className="lauchpad-wrapper">
      <div className="header">
        <div>
        <Typography gutterBottom darkMode>
        Welcome, Oliver Queen
        </Typography>
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
          {productArr.map((product, i)=>{
            const productBox = (<div className="full-width"
              onClick={() => history.push(product.url)}
            >
              <img src={product.imgUrl} alt={product.title} />
              <Typography variant="title2" darkMode>
                {product.title}
              </Typography>
            </div>);
            return (<div key={i}
              className={'productBox ' +(product.haveAccess ? 'haveAccess' : '')}>
              {!product.haveAccess ? (<Tooltip
            variant="light"
            title={product.title}
            subtitle="A data visualization platform that allows users to spot trends and anomalies across their study data in order to more quickly make decisions related to data cleanliness, operational efficiency, and drug safety."
            extraLabels={[
              { title: "Contact your System Administrator for access" },
            ]}
            placement="bottom"
          >
            {productBox}
          </Tooltip>) :
            productBox}
            </div>)
          })}
          

          
        </div>
      </div>
    </div>
  );
}

export default LaunchPad;
