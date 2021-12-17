import axios from 'axios';
const base_url = process.env.API_URL || 'http://localhost:443';
export const searchStudy = (searchQuery='') => {
    return axios.get(`${base_url}/api/study/search-study/${searchQuery}`).then(res=> {
        return res.data?.data || [];
    }).catch(err=> {

    });
}

export const getNotOnBoardedStudiesStat = () => {
    return axios.get(`${base_url}/api/study/notonboarded-studies-stat`).then(res=> {
        console.log(res, "service")
        return res.data?.data || [];
    }).catch(err=> {

    });
}

export const userLogOut = () => {
    return axios.get(`${base_url}/logout/`).then(res=> {
        return res.data || false;
    }).catch(err=> {
        console.log(err)
    });
}