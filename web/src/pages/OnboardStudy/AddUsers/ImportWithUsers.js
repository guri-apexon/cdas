/* eslint-disable no-script-url */
/* eslint-disable react/button-has-type */
import React from "react";
import { useHistory } from "react-router-dom";
import Typography from "apollo-react/components/Typography";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import Paper from "apollo-react/components/Paper";
import Box from "apollo-react/components/Box";
import Grid from "apollo-react/components/Grid";
import "../OnboardStudy.scss";

const ImportWithUsers = () => {
  const history = useHistory();
  const breadcrumpItems = [
    { href: "javascript:void(0)", onClick: () => history.push("/launchpad") },
    {
      href: "javascript:void(0)",
      title: "Study Setup",
      onClick: () => history.push("/study-setup"),
    },
    {
      title: "Assign Users",
    },
  ];
  const actionBtns = [
    {
      variant: "text",
      size: "small",
      label: "Import without assigning",
    },
    {
      variant: "secondary",
      size: "small",
      label: "Cancel import",
    },
    {
      variant: "primary",
      size: "small",
      label: "Import and assign",
    },
  ];
  return (
    <div className="import-with-users-wrapper">
      <Box className="onboard-header">
        <BreadcrumbsUI className="breadcrump" items={breadcrumpItems} />
        <Typography variant="title1">Import and Assign Users</Typography>
      </Box>
      <Box px={4} py={4} className="">
        <ButtonGroup
          className="action-btns"
          alignItems="right"
          buttonProps={actionBtns}
        />
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Paper>
              <Typography variant="body2">xs=12</Typography>
            </Paper>
          </Grid>
          <Grid item xs={9}>
            <Paper>
              <Typography variant="body2">xs=12</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default ImportWithUsers;
