const DB =  require('../config/db');
const apiResponse = require("../helpers/apiResponse");
// Study Schema
function StudyData(data) {
}

/**
 * Study Search List.
 * 
 * @returns {Object}
 */
exports.studyList = function (req, res) {
    try {
        const searchParam = req.params.query.toLowerCase();
        const searchQuery = `SELECT * from cdascore1d.cdascore.cdas_study_master 
        WHERE LOWER(prot_nbr) LIKE '%${searchParam}%' OR 
        LOWER(spnsr_nm) LIKE '%${searchParam}%' OR 
        LOWER(project_code) LIKE '%${searchParam}%'
        LIMIT 60
        `;
        DB.executeQuery(searchQuery).then( response => {
            const studies = response.rows || [];
            if(studies.length > 0){
                return apiResponse.successResponseWithData(res, "Operation success", studies);
            }else{
                return apiResponse.successResponseWithData(res, "Operation success", []);
            }
        });
    } catch (err) {
        //throw error in json response with status 500. 
        return apiResponse.ErrorResponse(res, err);
    }
}

exports.noOnboardedStat = function (req, res) {
    try {
        const query = `SELECT 
        COUNT(DISTINCT CASE WHEN ob_stat = 'In Progress'   THEN prot_id END) inprogress_count,
        COUNT(DISTINCT CASE WHEN ob_stat = 'Failed' THEN prot_id END) faliure_count
 FROM cdascore1d.cdascore.cdas_study`;
        DB.executeQuery(query).then( response => {
            const studies = response.rows || [];
            if(studies.length > 0){
                return apiResponse.successResponseWithData(res, "Operation success", studies[0]);
            }else{
                return apiResponse.successResponseWithData(res, "Operation success", []);
            }
        });
    } catch (err) {
        //throw error in json response with status 500. 
        return apiResponse.ErrorResponse(res, err);
    }
}
