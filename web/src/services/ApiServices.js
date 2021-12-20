import axios from "axios";
import { baseURL, STUDYSEARCH } from "../constants";

const searchStudy = async (searchQuery = "") => {
  try {
    const res = await axios.get(`${baseURL}/${STUDYSEARCH}/${searchQuery}`);
    return res.data?.data || [];
  } catch (err) {
    return console.log("Error", err);
  }
};

export default searchStudy;

export const getNotOnBoardedStudiesStat = () => {
  return axios
    .get(`${baseURL}/api/study/notonboarded-studies-stat`)
    .then((res) => {
      return res.data?.data || [];
    })
    .catch((err) => {
      console.log(err);
    });
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
