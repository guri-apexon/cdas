import React, { useEffect } from 'react';
import { useLocation } from "react-router";
import { useHistory } from "react-router-dom";

// const [cookies, setCookie, removeCookie] = useCookies(["user.id"]);


const Auth = (props) => {
    
  let location = useLocation();
  let history = useHistory();


    const parseParams = (params = "") => {
        const rawParams = params.replace("?", "").split("&");
        const extractedParams = {};
        rawParams.forEach((item) => {
          item = item.split("=");
          extractedParams[item[0]] = item[1];
        });
        return extractedParams;
      };

    useEffect(() => {
        // const params = parseParams(props?.location?.search); 
        console.log('test', );
        let userData = parseParams(location.search);
        localStorage.setItem('userDetails', JSON.stringify(userData));
        history.push('/dashboard');

    }, [props])


    return (
        <div>
            Auth Page
        </div>
    )
}

export default Auth
