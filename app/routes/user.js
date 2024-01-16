/**
 * 유저 정보에 대한 Router
 * @param express
 * @returns {*|Router|e.Router}
 */
module.exports = (express) => {
    const router = express.Router();
    const userController = require('../controllers/userController');
    const validator = require('../modules/validator');
    const userModel = require('../models/userModel');
    const userSchema = userModel.userSchema;

    /* 로그인 */
    router.all('/loginProc', validator.validate({
        loginId: userSchema.loginId
    }), userController.loginProc);

    return router;
}