import axios from "axios";
import { baseURL, STUDYSEARCH, VENDOR_BASE } from "../constants";

export const searchStudy = async (searchQuery = "") => {
  try {
    const res = await axios.get(`${baseURL}/${STUDYSEARCH}/${searchQuery}`);
    return res.data?.data || [];
  } catch (err) {
    return console.log("Error", err);
  }
};

export const addPolicyService = async (reqBody) => {
  try {
    return new Promise((resolve, reject) => {
      axios
        .post(`${baseURL}/v1/api/policy/create`, reqBody)
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err.response.data);
        });
    });
  } catch (err) {
    return console.log("Error", err);
  }
};

export const updatePolicyService = async (reqBody) => {
  try {
    return new Promise((resolve, reject) => {
      axios
        .post(`${baseURL}/v1/api/policy/update`, reqBody)
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err.response.data);
        });
    });
  } catch (err) {
    return console.log("Error", err);
  }
};

export const addVendorService = async (reqBody) => {
  try {
    return new Promise((resolve, reject) => {
      axios
        .post(`${baseURL}/${VENDOR_BASE}/create`, reqBody)
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err.response.data);
        });
    });
  } catch (err) {
    return console.log("Error", err);
  }
};

export const updateVendorService = async (reqBody) => {
  try {
    return new Promise((resolve, reject) => {
      axios
        .post(`${baseURL}/${VENDOR_BASE}/update`, reqBody)
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err.response.data);
        });
    });
  } catch (err) {
    return console.log("Error", err);
  }
};

export const getVendorsList = async () => {
  try {
    return new Promise((resolve, reject) => {
      axios
        .get(`${baseURL}/${VENDOR_BASE}/list`)
        .then((res) => {
          resolve(res.data.data);
        })
        .catch((err) => {
          console.log("Err", err);
        });
    });
  } catch (err) {
    return console.log("Error", err);
  }
};

export const getVendorDetails = async (vId = "") => {
  try {
    return new Promise((resolve, reject) => {
      axios
        .get(`${baseURL}/${VENDOR_BASE}/Details/${vId}`)
        .then((res) => {
          resolve(res.data.data);
        })
        .catch((err) => {
          console.log("Err", err);
        });
    });
  } catch (err) {
    return console.log("Error", err);
  }
};

export const getPolicyPermissions = async (policyId = "") => {
  try {
    return new Promise((resolve, reject) => {
      axios
        .get(`${baseURL}/v1/api/policy/permission-list/${policyId}`)
        .then((res) => {
          resolve(res.data.data);
        })
        .catch((err) => {
          console.log("Err", err);
        });
    });
  } catch (err) {
    return console.log("Error", err);
  }
};

export const fetchProducts = async () => {
  try {
    return new Promise((resolve, reject) => {
      axios
        .get(`${baseURL}/v1/api/policy/products`)
        .then((res) => {
          resolve(res.data.data);
        })
        .catch((err) => {
          console.log("Err", err);
        });
    });
  } catch (err) {
    return console.log("Error", err);
  }
};

export const onboardStudy = (reqBody) => {
  try {
    return new Promise((resolve, reject) => {
      axios
        .post(`${baseURL}/v1/api/study/onboard`, reqBody)
        .then((res) => {
          resolve(res.data?.data || res.data);
        })
        .catch((err) => {
          if (err.response?.data) {
            resolve(err.response?.data);
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
