const moment = require("moment");
const request = require("request");
const axios = require("axios");
const btoa = require("btoa");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const userController = require("./UserController");
const {getDomainWithoutSubdomain, getCurrentTime} = require("../helpers/customFunctions");

const getToken = (code, clientId, clientSecret, callbackUrl, ssoUrl) => {
  return new Promise((resolve, reject) => {
    const base64 = btoa(`${clientId}:${clientSecret}`);
    const options = {
      method: "POST",
      url: `https://${ssoUrl}/oauth2/token`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
        Authorization: `Basic ${base64}`,
      },
      form: {
        code,
        grant_type: "authorization_code",
        redirect_uri: callbackUrl,
      },
    };
    request(options, (error, response) => {
      if (!error && response.statusCode === 200) {
        resolve(response.body);
      } else if (!error && response.statusCode !== 200) {
        reject(response.body);
      } else {
        reject(error);
      }
    });
  });
};

// Handler for the /sda path
exports.authHandler = async (req, res) => {
  // Get the token
  const REACT_APP_URL = process.env.REACT_APP_URL;
  try {
    // read the code from the request
    const { code } = req.query;
    const CLIENT_ID = process.env.SDA_CLIENT_ID;
    const CLIENT_SECRET = process.env.SDA_CLIENT_SECRET;
    const CALLBACK_URL = process.env.SDA_CALLBACK_URL;
    const SSO_URL = process.env.SDA_SSO_URL;
    const loginMaxMinutes = (parseInt(process.env.SESSION_EXP_TIME || 24*60)) * 60000;
    // console.log("loginMaxMinutes", loginMaxMinutes, 24*60*60000);

    const body = await getToken(
      code,
      CLIENT_ID,
      CLIENT_SECRET,
      CALLBACK_URL,
      SSO_URL
    );
    // eslint-disable-next-line camelcase
    const response = JSON.parse(body);
    const authStr = "Bearer ".concat(response.access_token);
    const ssoUserInfoUrl = `https://${SSO_URL}/oauth2/userinfo`;

    const resp = await axios.get(ssoUserInfoUrl, {
      headers: { Authorization: authStr },
    });
    const appUser = await userController.getUser(resp.data.userid);
    if (!appUser) {
      await userController.addUser({
        usr_id: resp.data.userid?.toLowerCase(),
        usr_fst_nm: resp.data.given_name,
        usr_lst_nm: resp.data.family_name,
        usr_mail_id: resp.data.email,
        insrt_tm: getCurrentTime(true),
        updt_tm: getCurrentTime(true),
      });
    }
    let lastLoginTime = 'first_time';
    const last_login_tm = await userController.getLastLoginTime(resp.data.userid);

    if (last_login_tm) {
      lastLoginTime = moment(last_login_tm).unix();
    }
    const loginDetails = {
      usrId: resp.data.userid,
      logout_tm: moment()
        .add(response.expires_in, "seconds")
        .utc(),
    };
    await userController.addLoginActivity(loginDetails);
    // Set the cookies
    const domainUrlObj = new URL(REACT_APP_URL);
    const domainName = getDomainWithoutSubdomain(REACT_APP_URL);
    const cookieDomainObj = {domain: domainName, maxAge: loginMaxMinutes, secure: domainUrlObj?.protocol==="https:" };

    res.cookie("user.last_login_ts", lastLoginTime, cookieDomainObj);
    res.cookie("user.token", response.id_token, cookieDomainObj);
    res.cookie("user.id", resp.data.userid?.toLowerCase(), cookieDomainObj);
    res.cookie("user.first_name", resp.data.given_name, cookieDomainObj);
    res.cookie("user.last_name", resp.data.family_name, cookieDomainObj);
    res.cookie("user.email", resp.data.email, cookieDomainObj);
    res.cookie("user.current_login_ts", moment().unix(), cookieDomainObj);

    // Prepare for an Upsert
    const userDetails = {
      first_name: resp.data.given_name,
      last_name: resp.data.family_name,
      email: resp.data.email,
      is_act: true,
      created_ts: moment().unix(),
      created_by: "SYS",
      current_login_ts: moment().unix(),
    };

    // res.cookie("userDetails", userDetails);

    Logger.info({
      message: "authHandler",
    });

    res.redirect(`${REACT_APP_URL}/launchpad`);
  } catch (e) {
    // console.error(e);
    Logger.error(e);
    res.redirect(`${REACT_APP_URL}/not-authenticated`);
  }
};

exports.logoutHandler = async (req, res) => {
  try {
    const SSO_URL = process.env.SDA_SSO_URL;
    //const authStr = "Bearer ".concat(response.access_token);
    const ssologoutUrl = `https://${SSO_URL}/oidc/logout`;
    const resp = await axios.get(ssologoutUrl, {
      //headers: { Authorization: authStr },
    });
    Logger.info({
      message: "LogOut",
    });
    const ok = resp.status > 199 && resp.status < 400;
    if (!ok) {
      return res.status(resp.status).json(false);
    } else {
      return res.status(200).json(true);
    }
  } catch (e) {
    // console.error(e);
    Logger.error(e);
    return apiResponse.ErrorResponse(res, e);
  }
};