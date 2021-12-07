import React from 'react'
import Button from 'apollo-react/components/Button';
import Typography from 'apollo-react/components/Typography';
import { Redirect } from 'react-router';

function StudySetup() {
    return (
        <div style={{ textAlign: 'center', height: 'calc(100vh - 184px)', minHeight: 800 }}>
            <Typography>StudySetup</Typography>
            <Redirect to="/launchpad" />
        </div>
    )
}

export default StudySetup
