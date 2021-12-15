const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");

/**
 * Study Search List.
 *
 * @returns {Object}
 */

exports.studyList = function (req, res) {
  try {
    const searchParam = req.params.query;
    const searchQuery = `SELECT * from cdascore1d.cdascore.cdas_study_master WHERE prot_nbr LIKE '%${searchParam}%' OR 
    spnsr_nm LIKE '%${searchParam}%' OR project_code LIKE '%${searchParam}%' LIMIT 60`;

    Logger.info({
      message: "studyList",
    });

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
    Logger.error("catch :studyList");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getStudyList = async (req, res) => {
  try {
    let searchData = req.body;
    let { pageNo, pageLimit, sortColumn, sortOrder, filterSelection } =
      searchData;
    const ist_update = new Date();

    const searchString = searchData.searchString ? searchData.searchString : "";
    const searchStringDataType = searchData.searchStringDataType
      ? searchData.searchStringDataType
      : "";

    const offset = pageNo > 1 ? (pageNo - 1) * pageLimit : 0;
    const query = "SELECT * from cdascore1d.cdascore.cdas_study_master";

    Logger.info({
      message: "getStudyList",
    });

    const $data = await DB.executeQuery(query);
    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      $data.rows
    );
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :studyList");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};
