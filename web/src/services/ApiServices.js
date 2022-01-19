import axios from "axios";
import { baseURL, STUDYSEARCH, remoteBaseUrl } from "../constants";

export const searchStudy = async (searchQuery = "") => {
  try {
    const res = await axios.get(`${baseURL}/${STUDYSEARCH}/${searchQuery}`);
    return res.data?.data || [];
  } catch (err) {
    return console.log("Error", err);
  }
};
export const onboardStudy = (reqBody) => {
  try {
    return new Promise((resolve, reject) => {
      axios
        .post(`${remoteBaseUrl}/study/onboard`, reqBody, {
          headers: {
            ClientId: "CDI",
            ClientSecret:
              "h+p78ADQ8Zwo1EiJdLPU9brxYe9qo64YUYoZAVq/VSjY1IOHsE3yiQ==",
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          if (err.response?.data) {
            resolve(err.response.data);
          } else {
            resolve({ status: "BAD_REQUEST", message: "Something went wrong" });
          }
        });
    });
  } catch (err) {
    return console.log("Error", err);
  }
};

export const userLogOut = () => {
  return axios
    .get(`${baseURL}/logout`)
    .then((res) => {
      return res.data || false;
    })
    .catch((err) => {
      console.log(err);
    });
};
