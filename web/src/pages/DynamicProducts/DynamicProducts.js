import React from "react";
import { useLocation } from "react-router-dom";
import Typography from "apollo-react/components/Typography";
import "./DynamicProducts.scss";

const DynamicProducts = () => {
  const location = useLocation();
  const { pathname } = location;
  return (
    <div className="content-wrapper">
      <Typography style={{ margin: 20 }}>
        {`Dynamic Products ${pathname.slice(1)} `}
      </Typography>
      {console.log(location)}
    </div>
  );
};

export default DynamicProducts;
