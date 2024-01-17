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
            res.json(funcCmmn.getReturnMessage({resultData: resultData, resultCnt: resultData.length}));
        }
    }

    psql.select(defaultMapper, 'selectPartners', chat, onSuccess, onError);
}

/**
 * 채팅 파트너 등록 및 채팅 시작
 */
exports.insertChatPartners = async (req, res) => {
    let chatPartner = chatModel.newChatPartnerModel(req);
    let chat = chatModel.newChatModel(req);

    if ( funcCmmn.isNull(chatPartner.profileFileId) ) {
        chatPartner.profileFileId = null;
    }

    let onError = (err) => {
        res.json(funcCmmn.getReturnMessage({isErr: true, code: 500, message:err.stack}));
        console.log(err);
    };

    // 채팅 방 생성 완료
    let onChatSuccess = (result) => {
        if (result == null) {
            res.json(funcCmmn.getReturnMessage({ isErr: true, code: 500, message: '등록중 오류가 발생하였습니다.' }));
        } else {
            res.json(funcCmmn.getReturnMessage({resultData: result, resultCnt: result.length}));
        }
    }

    // 채팅 파트너 등록 완료
    let onChatPartnerSuccess = (result) => {
        if (result) {
            // 채팅 방 생성 시작
            chat.chatPartnerId = result[0].id;
            chat.regId = chatPartner.targetUserKey;

            // insertChat
            psql.selectOne(defaultMapper, "insertChat", chat, onChatSuccess, onError)
        } else {
            res.json(funcCmmn.getReturnMessage({ isErr: true, code: 500, message: '등록중 오류가 발생하였습니다.' }));
        }
    }

    psql.insertReturn(defaultMapper, "insertChatPartners", chatPartner, onChatPartnerSuccess, onError)
}

/**
 * 메세지 데이터 만들기
 */
function makeChatMessageData(chatId, message, date) {
    return {chatId: chatId, message: message, date: date};
}

/**
 * ChatGPT API
 */
exports.chatMessage = async (req, res) => {
    const chatMessage = chatModel.newChatMessageModel(req);
    const sendGptMessages = [];
    const sendMessageTime = funcCmmn.getTimestamp();

    let client = await psql.getConnection();

    try {
        // 이전 데이터 조회
        const previousData = await client.query(psql.getStatement(defaultMapper, 'getChatMessage', {chatId: "766df3af-2f09-49b5-8252-48cc9d72a48d"}));

        if ( previousData ) {
            for (_d of previousData.rows) {
                sendGptMessages.push(_d.message);
            }
        }

        // GPT API 사용 될 메세지 세팅
        const sendMessage = {role: "user", content: chatMessage.prompt};
        sendGptMessages.push(sendMessage);

        // GPT 연동
        const gptApiResponse = await callChatGPT(sendGptMessages);

        if (gptApiResponse.code !== 200) {
            res.json(funcCmmn.getReturnMessage({ isErr: true, code: 500, message: gptApiResponse.messageData }));
            return;
        }

        // GPT 결과값 (Message)
        const getMessage = gptApiResponse.messageData.data.choices[0].message;

        if ( funcCmmn.isNull(getMessage) ) {
            res.json(funcCmmn.getReturnMessage({ isErr: true, code: 500, message: "GPT 리턴 데이터 NULL" }));
            return;
        }

        // tb_chat_msg Insert 데이터 생성
        const insertMessageData = [];

        // SEND 메시지 만들기
        insertMessageData.push(makeChatMessageData(chatMessage.chatId, sendMessage, sendMessageTime));
        // GET 메시지 만들기
        insertMessageData.push(makeChatMessageData(chatMessage.chatId, getMessage, funcCmmn.getTimestamp()));

        // Message Database Insert
        psql.insertReturn(defaultMapper, "insertChatMessage", {chatMessages: insertMessageData}, (result) => {
            res.json(funcCmmn.getReturnMessage({resultData: result, resultCnt: result.length}));
        }, (err) => {
            res.json(funcCmmn.getReturnMessage({ isErr: true, code: 500, message: "메세지 데이터 등록중 오류 발생" }));
        });

    } catch (err) {
        res.json(funcCmmn.getReturnMessage({ isErr: true, code: 500, message: "메세지 등록중 오류가 발생하였습니다." }));
        return;
    } finally {
        client.release();
    }
}