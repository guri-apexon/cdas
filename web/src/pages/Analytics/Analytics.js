import React from "react";
import Typography from "apollo-react/components/Typography";
import { Redirect } from "react-router";

function Analytics() {
  return (
    <div
      style={{
        textAlign: "center",
        height: "calc(100vh - 184px)",
        minHeight: 800,
      }}
    >
      <Typography>Default Page</Typography>
      <Redirect to="/launchpad" />
    </div>
  );
}

export default Analytics;
