/* ~/app/module/validator.js */
const { checkSchema, validationResult, buildSanitizeFunction  } = require("express-validator");

/**
 *  스키마 검사 로직 (정의된 스키마명으로 검사
 *  validator에서 에러 발생시 validationResult로 해당 에러가 넘어옴
 *  받아서 에러메세지 return
 *  문제없으면 다음 함수로
 *  */
exports.validate = (schema) => {
    return [
        /**
         *  checkSchema((검사할스키마), [검사범위])
         *  https://express-validator.github.io/docs/api/check-schema
         *  검사범위 ['body', 'cookie', 'header', 'query', 'params'],
         *  checkSchema(schema, ['body', 'query']);
         * */
        checkSchema((schema), ['body', 'headers', 'query']),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.json(funcCmmn.getReturnMessage({isErr: true, code: 400, message: errors.array()[0].msg}));
            }
            next();
        },
    ];
};

