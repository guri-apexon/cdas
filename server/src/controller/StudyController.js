const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");

/**
 * Study Search List.
 *
 * @returns {Object}
 */

exports.studyList = function (req, res) {
  try {
    const searchParam = req.params.query;
    const searchQuery = `SELECT * from cdascore1d.cdascore.cdas_study_master WHERE prot_nbr LIKE '%${searchParam}%' OR 
    spnsr_nm LIKE '%${searchParam}%' OR project_code LIKE '%${searchParam}%'`;

    DB.executeQuery(searchQuery).then((response) => {
      const studies = response.rows || [];
      if (studies.length > 0) {
        return apiResponse.successResponseWithData(
          res,
          "Operation success",
          studies
        );
      } else {
        return apiResponse.successResponseWithData(
          res,
          "Operation success",
          []
        );
      }
    });
  } catch (err) {
    //throw error in json response with status 500.
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getStudyList = async (req, res) => {
  try {
    //  const searchParam = req.params.query;
    //  DB.executeQuery(searchQuery).then( response => {
    //      const studies = response.rows || [];
    //      if(studies.length > 0){
    //          return apiResponse.successResponseWithData(res, "Operation success", studies);
    //      }else{
    //          return apiResponse.successResponseWithData(res, "Operation success", []);
    //      }
    //  });
  } catch (err) {
    //throw error in json response with status 500.
    return apiResponse.ErrorResponse(res, err);
  }
};
