import axios from "axios";

const baseUrl = process.env.API_URL || "http://localhost:443";

const searchStudy = async (searchQuery = "") => {
  try {
    const res = await axios.get(
      `${baseUrl}/api/study/search-study/${searchQuery}`
    );
    return res.data?.data || [];
  } catch (err) {
    return console.log("Error", err);
  }
};

export default searchStudy;
