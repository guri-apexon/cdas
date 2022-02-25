import axios from "axios";
import {
  API_URL,
  baseURL,
  POLICY_LIST_FETCH,
  ROLES_LIST,
  STUDYSEARCH,
  VENDOR_BASE,
} from "../constants";
import { getCookie } from "../utils";

const userId = getCookie("user.id");

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
        .post(`${API_URL}/policy/create`, reqBody)
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

export const addRoleService = async (reqBody) => {
  try {
    return new Promise((resolve, reject) => {
      axios
        .post(`${API_URL}/role/create`, reqBody)
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

export const updateRoleService = async (reqBody) => {
  try {
    return new Promise((resolve, reject) => {
      axios
        .post(`${API_URL}/role/update`, reqBody)
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
        .post(`${API_URL}/policy/update`, reqBody)
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
  // console.log("add", reqBody);
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
  // console.log("edit", reqBody);
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

export const deleteVendorContact = async (reqBody) => {
  try {
    return new Promise((resolve, reject) => {
      axios
        .post(`${baseURL}/${VENDOR_BASE}/contact/delete`, reqBody)
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

export const statusUpdate = async (vId, vStatus) => {
  try {
    return new Promise((resolve, reject) => {
      axios
        .post(`${baseURL}/${VENDOR_BASE}/statusUpdate`, {
          vId,
          vStatus,
          userId,
        })
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          console.log("Err", err);
          if (err.response) {
            resolve(err.response.data);
          }
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
        .get(`${API_URL}/policy/permission-list/${policyId}`)
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

export const getPolicySnapshot = async (policyId = "") => {
  try {
    return new Promise((resolve, reject) => {
      axios
        .get(`${API_URL}/policy/snapshot/${policyId}`)
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

export const fetchRoles = async (roleId) => {
  try {
    return new Promise((resolve, reject) => {
      axios
        .get(`${API_URL}/${ROLES_LIST}`)
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
export const getRolePolicies = async (roleId) => {
  try {
    return new Promise((resolve, reject) => {
      axios
        .get(`${baseURL}/${POLICY_LIST_FETCH}/${roleId}`)
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

export const getOnboardUsers = async (reqBody) => {
  try {
    return new Promise((resolve, reject) => {
      axios
        .get(`${API_URL}/get-sdk-users`)
        .then((res) => {
          resolve(res.data?.data || []);
        })
        .catch((err) => {
          resolve(null);
        });
    });
  } catch (err) {
    return console.log("Error", err);
  }
};

export const getRoleDetails = async (roleId) => {
  try {
    return new Promise((resolve, reject) => {
      axios
        .get(`${API_URL}/role/${roleId}`)
        .then((res) => {
          resolve(res.data.data);
        })
        .catch((err) => {
          resolve(null);
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
        .get(`${API_URL}/policy/products`)
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
        .post(`${API_URL}/study/onboard`, reqBody)
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
