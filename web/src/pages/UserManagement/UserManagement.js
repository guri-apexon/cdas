import React from 'react'
import Button from 'apollo-react/components/Button';
import Typography from 'apollo-react/components/Typography';
import { Redirect } from 'react-router';

function UserManagement() {
    return (
        <div style={{ textAlign: 'center', height: 'calc(100vh - 184px)', minHeight: 800 }}>
            <Typography>UserManagement</Typography>
            <Redirect to="/launchpad" />
        </div>
    )
}

export default UserManagement
