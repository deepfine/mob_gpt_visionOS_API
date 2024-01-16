let baseModel = require('./baseModel');
const {body} = require("express-validator");

let CHAT_PARTNER = {
    id: null,
    targetUserKey: null,
    name: null,
    hobby: null,
    job: null,
    personality: null,
    language: null,
    delYn: null,
    regDate: null,
    profileFileId: null
}

exports.newChatPartnerModel = (opt) => {
    return baseModel.extend(CHAT_PARTNER, opt);
};

exports.chatSchema = {
    targetUserKey : {
        exists: {
            errorMessage: "targetUserKey is required"
        },
        notEmpty: {
            errorMessage: "targetUserKey is required"
        },
    }
}