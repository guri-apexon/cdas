import React, { useEffect } from 'react';

const UnAuth = () => {
    useEffect(() => {
        window.location.href = `${process.env.REACT_APP_LAUNCH_URL}`;
        console.log('dotenv :', process.env.REACT_APP_LAUNCH_URL);
    }, [])

    return (
        <div>

        </div>
    )
}

export default UnAuth
