let baseModel = require('./baseModel');
const {body} = require("express-validator");

let USER = {
    loginId: null
}

exports.newModel = (opt) => {
    return baseModel.extend(USER, opt);
};

exports.userSchema = {
    loginId : {
        exists: {
            errorMessage: "lgnId is required"
        },
        notEmpty: {
            errorMessage: "lgnId is required"
        },
    }
}