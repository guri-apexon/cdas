import React from "react";
import { useLocation } from "react-router-dom";
import { useHistory } from "react-router";
import Typography from "apollo-react/components/Typography";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import "./UpdateUser.scss";

const DynamicProducts = () => {
  const location = useLocation();
  const history = useHistory();
  const { pathname } = location;
  const userListURL = "/user-management";
  const breadcrumpItems = [
    { href: "", onClick: () => history.push("/launchpad") },
    {
      title: "User Management",
      onClick: () => history.push(userListURL),
    },
    {
      title: "View User Assignment",
    },
  ];
  return (
    <div className="content-wrapper">
      <BreadcrumbsUI className="breadcrump" items={breadcrumpItems} />
      <Typography style={{ margin: 20 }}>
        {`User Assignment for: ${pathname.slice(1).split("/")[1]} `}
      </Typography>
      {console.log(location)}
    </div>
  );
};

export default DynamicProducts;
