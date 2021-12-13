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
const authHandler = async (req, res) => {
  // read the code from the request
  const { code } = req.query;

  // Get the token
  try {
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
    // Do the upsert if it fails do not stop.
    //   try {
    //     const unpwAdminCfg = `${process.env.MULE_ADMINCFG_BASIC_AUTH_USERNAME}:${process.env.MULE_ADMINCFG_BASIC_AUTH_PASSWORD}`;
    //     const base64Encoded = btoa(unpwAdminCfg);
    //     const userAddUpdUrl = `${process.env.ADMINCFGAPI_ENDPOINT}/api/admin/users/${resp.data.userid}`;
    //     const url = new URL(userAddUpdUrl);
    //     const userAddUpd = await axios.post(userAddUpdUrl, userDetails, {
    //       headers: {
    //         Authorization: `Basic ${base64Encoded}`,
    //         tid: resp.data.userid + url.pathname + moment().unix(),
    //       },
    //     });
    //     // console.info(userAddUpd);
    //   } catch (err) {
    //     console.error(err);
    //   }
    Logger.info({
      message: "authHandler"
    });

    res.redirect("http://localhost:3000/launchpad");
    localStorage.setItem('userDetails', userDetails);

  } catch (e) {
    // console.error(e);
    Logger.error(e)
    res.redirect("http://localhost:3000/not-authenticated");
  }
};

exports.authHandler = authHandler;
