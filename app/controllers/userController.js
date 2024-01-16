const defaultMapper = 'user';
const userModel = require('../models/userModel');

/**
 * 로그인 프로세스
 */
exports.loginProc = async (req, res) => {
    let user = userModel.newModel(req);

    // const client = await psql.getConnection();

    let onError = (err) => {
        res.json(funcCmmn.getReturnMessage({isErr: true, code: 500, message:err.stack}));
        console.log(err);
    };

    let onCheckId = (result) => {
        if (result) {
            let userInfo = {
                loginKey: result.id,
                loginId: result.loginId,
                userName: result.userName
            };

            res.json(funcCmmn.getReturnMessage({resultData: userInfo}));
        } else {
            /* 입력한 아이디와 일치하는 계정 없는 case */
            res.json(funcCmmn.getReturnMessage({isErr: true, code: 505, message: '계정이 존재하지 않습니다.'}));
        }
    };

    psql.selectOne(defaultMapper, 'loginCheckId', user, onCheckId, onError);
}