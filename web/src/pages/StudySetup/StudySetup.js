import React, { useState, useEffect } from "react";
import Typography from "apollo-react/components/Typography";
import { withRouter } from "react-router";
import Modal from "apollo-react/components/Modal";
import "./StudySetup.scss";
import Search from "apollo-react/components/Search";
import Table from "apollo-react/components/Table";
import Box from "apollo-react/components/Box";
import Button from "apollo-react/components/Button";
import ChevronLeft from "apollo-react-icons/ChevronLeft";
import ApolloProgress from "apollo-react/components/ApolloProgress";

function StudySetup() {
  return (
    <div
      style={{
        textAlign: "center",
        height: "calc(100vh - 184px)",
        minHeight: 800,
      }}
    >
      <Typography>StudySetup</Typography>
    </div>
  );
}

export default StudySetup;
