import React, { useEffect, useState } from 'react'
import Accordion from 'apollo-react/components/Accordion';
import AccordionDetails from 'apollo-react/components/AccordionDetails';
import AccordionSummary from 'apollo-react/components/AccordionSummary';
import Divider from 'apollo-react/components/Divider';
import Grid from 'apollo-react/components/Grid';
import Paper from 'apollo-react/components/Paper';
import Typography from 'apollo-react/components/Typography';
import Clock from 'apollo-react-icons/Clock'
import StatusExclamation from 'apollo-react-icons/StatusExclamation'
import ApolloProgress from "apollo-react/components/ApolloProgress";
import Box from "apollo-react/components/Box";
import { getNotOnBoardedStudiesStat } from "../../services/ApiServices";
const StudyNotOnboarded = () => {
    const [totalCount, setTotalCount] = useState(0)
    const [totalInProgress, setInprogressCount] = useState(0)
    const [totalFailures, setFailureCouut] = useState(0)
    const [isLoading, setIsnLoading] = useState(true)
    const styles = {
        padding: '45px 15px',
        textAlign: 'center',
        width: 216
      };

    useEffect(() => {
        getNotOnBoardedStudiesStat().then((res) => {
            const inprogress_count = parseInt(res.inprogress_count)
            const faliure_count = parseInt(res.faliure_count)
            setTotalCount(inprogress_count + faliure_count)
            setInprogressCount(inprogress_count)
            setFailureCouut(faliure_count)
            setIsnLoading(false)
        }).catch(err => {
            console.log(err)
            setIsnLoading(false)
        })
    }, [])
    return (
        <div className="studies-not-onboarded">
            {isLoading && <Box display='flex' className="loader-container">
              <ApolloProgress />
            </Box>
            }
            <Accordion variant="alternate" defaultExpanded={true || totalCount > 0}  style={{ marginTop: '60px' }}>
                <AccordionSummary>
                    <Typography>Studies Not Onboarded ({totalCount})</Typography>
                </AccordionSummary>
                <Divider />
                <AccordionDetails className="accordion-detail">
                    <Grid container spacing={2}>
                        <Grid item xs={3}></Grid>
                        <Grid item xs={3}>
                            <Paper style={styles} className="in-progress-box">
                                <div className="full-width">
                                    <Clock style={{ fontSize: 72, color: "#10558A", marginBottom: "15px" }} />
                                    <Typography variant="title1" gutterBottom style={{ color: "#015FF1" }}>
                                        {totalInProgress} In-progress
                                    </Typography>
                                </div>
                            </Paper>
                        </Grid>
                        <Grid item xs={3}>
                            <Paper style={styles} className="failure-box">
                                <div className="full-width">
                                    <StatusExclamation style={{ fontSize: 72, color: "#E20000", marginBottom: "15px"  }} />
                                    <Typography variant="title1"  gutterBottom style={{ color: "#E20000" }}>
                                        {totalFailures} Failures
                                    </Typography>
                                </div>
                            </Paper>
                        </Grid>
                        <Grid item xs={3}></Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </div>
    )
}

export default StudyNotOnboarded
