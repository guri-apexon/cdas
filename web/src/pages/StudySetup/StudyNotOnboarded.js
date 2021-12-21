import React, { useEffect, useState } from "react";
import Accordion from "apollo-react/components/Accordion";
import AccordionDetails from "apollo-react/components/AccordionDetails";
import AccordionSummary from "apollo-react/components/AccordionSummary";
import Divider from "apollo-react/components/Divider";
import Grid from "apollo-react/components/Grid";
import Paper from "apollo-react/components/Paper";
import Typography from "apollo-react/components/Typography";
import ApolloProgress from "apollo-react/components/ApolloProgress";
import Box from "apollo-react/components/Box";
import { ReactComponent as InProgressIcon } from "./Icon_In-progress_72x72.svg";
import { ReactComponent as InFailureIcon } from "./Icon_Failure_72x72.svg";

export default function StudyNotOnboarded({
  studyData,
  selectedStatus,
  selectedFilter,
}) {
  const { notOnBoardedStudyStatus } = studyData;
  const [totalCount, setTotalCount] = useState(0);
  const [totalInProgress, setInprogressCount] = useState(0);
  const [totalFailures, setFailureCouut] = useState(0);
  const [isLoading, setIsnLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const styles = {
    padding: "45px 15px",
    textAlign: "center",
    width: 216,
  };

  useEffect(() => {
    const inprogressCount =
      parseInt(notOnBoardedStudyStatus?.inprogress_count, 10) || 0;
    const faliureCount =
      parseInt(notOnBoardedStudyStatus?.faliure_count, 10) || 0;
    setTotalCount(inprogressCount + faliureCount);
    setInprogressCount(inprogressCount);
    setFailureCouut(faliureCount);
    setIsnLoading(false);
  }, [notOnBoardedStudyStatus]);

  useEffect(() => {
    setStatus(selectedFilter);
  }, [selectedFilter]);

  useEffect(() => {
    setExpanded(totalCount > 0 ?? false);
  }, [totalCount]);

  return (
    <div className="studies-not-onboarded">
      {isLoading && (
        <Box display="flex" className="loader-container">
          <ApolloProgress />
        </Box>
      )}
      <Accordion
        variant="alternate"
        defaultExpanded={totalCount > 0 ?? false}
        expanded={expanded}
        onChange={() => setExpanded(!expanded)}
        style={{ marginTop: "60px" }}
      >
        <AccordionSummary>
          <Typography>{`Studies Not Onboarded (${totalCount})`}</Typography>
        </AccordionSummary>
        <Divider />
        <AccordionDetails className="accordion-detail">
          <Grid container spacing={2}>
            <Grid item xs={3} />
            <Grid item xs={3}>
              <Paper
                style={styles}
                className={`in-progress-box ${
                  status === "In Progress" ? "selected" : null
                }`}
                onClick={() => selectedStatus("In Progress")}
              >
                <div className="full-width">
                  <InProgressIcon />
                  <Typography
                    variant="title1"
                    gutterBottom
                    style={{ color: "#015FF1" }}
                  >
                    {`${totalInProgress} In-progress`}
                  </Typography>
                </div>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper
                style={styles}
                className={`failure-box ${
                  status === "Failed" ? "selected" : null
                }`}
                onClick={() => selectedStatus("Failed")}
              >
                <div className="full-width">
                  <InFailureIcon />
                  <Typography
                    variant="title1"
                    gutterBottom
                    style={{ color: "#E20000" }}
                  >
                    {`${totalFailures} Failures`}
                  </Typography>
                </div>
              </Paper>
            </Grid>
            <Grid item xs={3} />
          </Grid>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
