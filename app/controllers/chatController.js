const { callChatGPT } = require('../modules/chatgpt');
const defaultMapper = 'chat';
const chatModel = require('../models/chatModel');

/**
 * 채팅 파트너 목록 조회
 */
exports.getChatPartners = async (req, res) => {
    let chat = chatModel.newChatPartnerModel(req);

    let onError = (err) => {
        res.json(funcCmmn.getReturnMessage({isErr: true, code: 500, message:err.stack}));
        console.log(err);
    };

    let onSuccess = (result) => {
        let resultData = result;
        if(result == null){
            res.json(funcCmmn.getReturnMessage({isErr: true, code: 500, message: 'no data'}));
        } else{
            console.log(result);
            res.json(funcCmmn.getReturnMessage({resultData: resultData, resultCnt: resultData.length}));
        }
    }

    psql.select(defaultMapper, 'selectPartners', chat, onSuccess, onError);
}

/**
 * 채팅 파트너 등록 및 채팅 시작
 */
exports.insertChatPartners = async (req, res) => {
    let chat = chatModel.newChatPartnerModel(req);

    if ( funcCmmn.isNull(chat.profileFileId) ) {
        chat.profileFileId = null;
    }

    let onError = (err) => {
        res.json(funcCmmn.getReturnMessage({isErr: true, code: 500, message:err.stack}));
        console.log(err);
    };

    let onSuccess = (result) => {
        if (result) {
            res.json(funcCmmn.getReturnMessage({}));
        } else {
            res.json(funcCmmn.getReturnMessage({ isErr: true, code: 500, message: '등록중 오류가 발생하였습니다.' }));
        }
    }

    psql.insert(defaultMapper, "insertChatPartners", chat, onSuccess, onError)
}

/**
 * ChatGPT API
 */
exports.chatGpt = async (req, res) => {
    const prompt = req.query.prompt;

    if (prompt) {
        const response = await callChatGPT(prompt);

        if (response) {
            res.json(funcCmmn.getReturnMessage({resultData: response}));
        } else {
            res.json(funcCmmn.getReturnMessage({ isErr: true, code: 500, message: 'ChatGPT Call Error' }));
        }
    }
    else {
        res.json(funcCmmn.getReturnMessage({ isErr: true, code: 500, message: 'Prompt Not Found' }));
    }
}