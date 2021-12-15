const moment = require("moment");
const request = require("request");
const axios = require("axios");
const btoa = require("btoa");

const Logger = require("../config/logger");

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
  try {
    // read the code from the request
    const { code } = req.query;
    const CLIENT_ID = process.env.SDA_CLIENT_ID;
    const CLIENT_SECRET = process.env.SDA_CLIENT_SECRET;
    const CALLBACK_URL = process.env.SDA_CALLBACK_URL;
    const SSO_URL = process.env.SDA_SSO_URL;

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
    // Set the cookies
    res.cookie("user.token", response.id_token);
    res.cookie("user.id", resp.data.userid);
    res.cookie("user.first_name", resp.data.given_name);
    res.cookie("user.last_name", resp.data.family_name);
    res.cookie("user.email", resp.data.email);
    res.cookie("user.current_login_ts", moment().unix());

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

    console.debug(userDetails);
    Logger.info({
      message: "authHandler",
    });

    res.redirect("http://localhost:3000/launchpad");
  } catch (e) {
    // console.error(e);
    Logger.error(e);
    res.redirect("http://localhost:3000/not-authenticated");
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
  }
};
