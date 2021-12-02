import React, { useEffect } from 'react';
import { useHistory } from "react-router-dom";

const UnAuth = () => {
    let history = useHistory();
    useEffect(() => {
        window.location.href = `${process.env.REACT_APP_LAUNCH_URL}`;
        if(window.location.href.startsWith('https://dev2-fedsvc.solutions.iqvia.com/authenticationendpoint')){
            window.location.href = 'http://localhost:3000/oauth2client';
        }
    }, [])



    return (
        <div>

        </div>
    )
}

export default UnAuth
