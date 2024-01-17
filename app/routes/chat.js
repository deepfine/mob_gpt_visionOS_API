/**
 * 채팅 정보에 대한 Router
 * @param express
 * @returns {*|Router|e.Router}
 */
const validator = require("../modules/validator");
const chatController = require("../controllers/chatController");
module.exports = (express) => {
    const router = express.Router();
    const chatController = require('../controllers/chatController');
    const validator = require('../modules/validator');
    const chatModel = require('../models/chatModel');
    const chatSchema = chatModel.chatSchema;

    /* 채팅 파트너 등록 */
    router.post('/insertChatPartners', validator.validate({
        targetUserKey: chatSchema.targetUserKey
    }), chatController.insertChatPartners);

    /* 채팅 파트너 조회 */
    router.get('/getChatPartners', validator.validate({

    }), chatController.getChatPartners);

    /* 채팅 */
    router.get('/chatMessage', validator.validate({
        prompt: chatSchema.prompt,
        chatId: chatSchema.chatId,
        userId: chatSchema.userId,
    }), chatController.chatMessage);

    return router;
}