let baseModel = require('./baseModel');
const {body} = require("express-validator");

let CHAT = {
    chatPartnerId: null,
    regId: null
}

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

let CHAT_MESSAGE = {
    userId: null,
    chatId: null,
    name: null,
    hobby: null,
    personality: null,
    job: null,
    language: null,
    prompt: null
}

exports.newChatModel = (opt) => {
    return baseModel.extend(CHAT, opt);
};

exports.newChatPartnerModel = (opt) => {
    return baseModel.extend(CHAT_PARTNER, opt);
};

exports.newChatMessageModel = (opt) => {
    return baseModel.extend(CHAT_MESSAGE, opt);
};

exports.chatSchema = {
    targetUserKey : {
        exists: {
            errorMessage: "targetUserKey required"
        },
        notEmpty: {
            errorMessage: "targetUserKey required"
        },
    },
    prompt : {
        exists: {
            errorMessage: "prompt required"
        },
        notEmpty: {
            errorMessage: "prompt required"
        },
    },
    chatId : {
        exists: {
            errorMessage: "chatId required"
        },
        notEmpty: {
            errorMessage: "chatId required"
        },
        isUUID: {
            version: 4
            , errorMessage: "invalid value in fileId, please check the value"
        },
    },
    userId : {
        exists: {
            errorMessage: "userKey required"
        },
        notEmpty: {
            errorMessage: "userKey required"
        },
        isUUID: {
            version: 4
            , errorMessage: "invalid value in fileId, please check the value"
        },
    }
}