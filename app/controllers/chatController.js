const { callChatGPT, getGptKey, callImageGenerate } = require('../modules/chatgpt');
const defaultMapper = 'chat';
const chatModel = require('../models/chatModel');

/**
 * 채팅 파트너 검색
 */
exports.getPartnerSearch = async (req, res) => {
    let chat = chatModel.newChatMessageModel(req);

    let client = await psql.getConnection();

    try {
        // GPT KEY 데이터 조회
        const gptKey = await getGptKey(client);

        // GPT API 호출 데이터 만들기
        const charactersInfo =
            { charactersInfo: [
                {"name": "", "personality": "", "job": "", "hobby": "", "language": ""},
                {"name": "", "personality": "", "job": "", "hobby": "", "language": ""},
                {"name": "", "personality": "", "job": "", "hobby": "", "language": ""}]
            };

        const contents = "Create three characters that match the title of " + chat.prompt + " using the following JSON." + "\n" + JSON.stringify(charactersInfo);

        // GPT API 호출 (병렬 처리)
        let [ gptImageApiResponse, gptApiResponse] =
            await Promise.all([callImageGenerate(gptKey, chat.prompt), callChatGPT(gptKey, [{role: "user", content: contents}])]);

        if ( gptImageApiResponse.code !== 200 ) {
            res.json(funcCmmn.getReturnMessage({ isErr: true, code: 500, message: gptImageApiResponse.messageData }));
            return;
        }

        const gptImageData = gptImageApiResponse.messageData.data.data;

        if ( funcCmmn.isNull(gptImageData) ) {
            res.json(funcCmmn.getReturnMessage({isErr: true, code: 500, message: "GPT 이미지 데이터 NULL"}));
            return;
        }

        const getMessage = gptApiResponse.messageData.data.choices[0].message;

        if ( funcCmmn.isNull(getMessage) ) {
            res.json(funcCmmn.getReturnMessage({isErr: true, code: 500, message: "GPT 리턴 데이터 NULL"}));
            return;
        }

        res.json(funcCmmn.getReturnMessage({resultData: {
                users: getMessage.content,
                images: gptImageData
            }, resultCnt: 1}));

    } catch (e) {
        res.json(funcCmmn.getReturnMessage({ isErr: true, code: 500, message: "메세지 등록중 오류가 발생하였습니다." }));
    } finally {
        client.release();
    }
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
 * 채팅 룸 리스트 조회
 */
exports.chatRoomList = async (req, res) => {
    let chat = chatModel.newChatMessageModel(req);

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

    psql.select(defaultMapper, 'selectChatRoomList', chat, onSuccess, onError);
}

/**
 * 채팅방 대화 리스트 조회
 */
exports.chatList = async (req, res) => {
    let chat = chatModel.newChatMessageModel(req);

    let onError = (err) => {
        res.json(funcCmmn.getReturnMessage({isErr: true, code: 500, message:err.stack}));
        console.log(err);
    };

    let onSuccess = (result) => {
        let resultData = result;
        if (result == null){
            res.json(funcCmmn.getReturnMessage({isErr: true, code: 500, message: 'no data'}));
        } else{
            res.json(funcCmmn.getReturnMessage({resultData: resultData, resultCnt: resultData.length}));
        }
    }

    psql.select(defaultMapper, 'selectChatList', chat, onSuccess, onError);
}

/**
 * 채팅방 삭제
 */
exports.deleteChat = async (req, res) => {
    let chat = chatModel.newChatMessageModel(req);

    let onError = (err) => {
        res.json(funcCmmn.getReturnMessage({isErr: true, code: 500, message:err.stack}));
        console.log(err);
    };

    let onSuccess = (result) => {
        let resultData = result;
        if (result == null){
            res.json(funcCmmn.getReturnMessage({isErr: true, code: 500, message: 'no data'}));
        } else{
            res.json(funcCmmn.getReturnMessage({}));
        }
    }

    psql.update(defaultMapper, 'deleteChat', chat, onSuccess, onError);
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
    let sendGptMessages = [];
    const sendMessageTime = funcCmmn.getTimestamp();

    let client = await psql.getConnection();

    try {
        // 채팅방 여부 확인
        const isValidChatRoom = await client.query(psql.getStatement(defaultMapper, 'isChatRoomCheck', chatMessage));

        if ( isValidChatRoom.rows[0].cnt === '0' ) {
            res.json(funcCmmn.getReturnMessage({ isErr: true, code: 500, message: "존재하지 않는 채팅방 입니다." }));
            return;
        }

        // 이전 데이터 조회
        const previousData = await client.query(psql.getStatement(defaultMapper, 'getPreviousConversation', {chatId: chatMessage.chatId}));

        if ( previousData && previousData.rows[0].messages ) {
            sendGptMessages = previousData.rows[0].messages;
        }

        // Partner 성격, 이름 등 조회
        const chatPartnerData = await client.query(psql.getStatement(defaultMapper, 'selectPartners', {chatId: chatMessage.chatId}));

        if ( chatPartnerData ) {
            // GPT API 사용 전 파트너에 대한 정보를 같이 Message로 넣어준다
            sendGptMessages.unshift({
                role: "system",
                content: "Your name is " + chatPartnerData.rows[0].name + " \n" +
                    "Your personality is " + chatPartnerData.rows[0].personality + " \n" +
                    "Your job is " + chatPartnerData.rows[0].job + " \n" +
                    "Your hobby is " + chatPartnerData.rows[0].hobby + " \n" +
                    "You have to answer by making a tone that fits this information. " + " \n" +
                    "And you must answer using " + chatPartnerData.rows[0].language
            });
        }

        // GPT API 사용 될 메세지 세팅
        const sendMessage = {role: "user", content: chatMessage.prompt};
        sendGptMessages.push(sendMessage);

        // GPT KEY 데이터 조회
        const gptKey = await getGptKey(client);

        // GPT API 호출
        const gptApiResponse = await callChatGPT(gptKey, sendGptMessages);

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
    } finally {
        client.release();
    }
}