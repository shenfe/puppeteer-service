module.exports = function () {
    const ss = {};
    const get = key => {
        return ss[key];
    };
    const put = (key, s) => {
        if (ss.hasOwnProperty(key)) return false;
        return ss[key] = s;
    };
    const del = key => {
        return delete ss[key];
    };
    return { get, put, del };
};
