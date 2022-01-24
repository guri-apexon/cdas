/* eslint-disable react/button-has-type */
import React, { useState } from "react";
import Box from "apollo-react/components/Box";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import Switch from "apollo-react/components/Switch";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import "./CreatePolicy.scss";
import Typography from "apollo-react/components/Typography";

const breadcrumpItems = [
  { href: "/" },
  {
    title: "Policy Management",
    href: "/policy-management",
  },
  {
    title: "Create New Policy",
  },
];

const CreatePolicy = () => {
  const [value, setValue] = useState(true);
  const handleChange = (e, checked) => {
    setValue(checked);
  };
  return (
    <div className="create-policy-wrapper">
      <Box className="top-content">
        <BreadcrumbsUI className="breadcrump" items={breadcrumpItems} />
        <>
          <Switch
            label="Label"
            className="inline-checkbox"
            checked={value}
            onChange={handleChange}
            size="small"
          />
          <ButtonGroup
            alignItems="right"
            buttonProps={[
              {
                label: "Cancel",
                size: "small",
                // onClick: () => (),
              },
              {
                label: "Save",
                size: "small",
                // onClick: ,
              },
            ]}
          />
        </>
      </Box>
      <Box>
        <div className="flex title">
          <Typography variant="title" className="b-font">
            New Policy
          </Typography>
        </div>
      </Box>
    </div>
  );
};

export default CreatePolicy;
