import React, { useEffect } from 'react';

const UnAuth = () => {
    useEffect(() => {
        window.location.href = "https://dev2-fedsvc.solutions.iqvia.com/oauth2/authorize?response_type=code&scope=openid&client_id=VAcqdR22FH0soXpK2axx5N542jMa&redirect_uri=http://localhost:3000/oauth2client";
    }, [])

    return (
        <div>
            UnAuthorised Page
        </div>
    )
}

export default UnAuth
