const multer = require('multer');
const fs = require('fs');
const moment = require('moment');
const uuid4 = require("uuid4");
moment.locale('ko');

/**
 * getTimestamp
 * timestamp 조회
 * @returns timestamp
 */
exports.getTimestamp = () => {
    return Date.now().toString();
};

/**
 * 비동기 통신(AJAX)의 리턴 메시지 format
 * @param isErr: boolean
 * @param code: int
 * @param message: string
 * @param resultData: object
 * @param resultCnt: int
 * @returns {{resultYn: 'Y'|'N', statusCode: *, statusMessage: (*|string), errorCode: *, errorMessage: (*|string), resultData: (*|{}), resultCnt: *}}
 */
exports.getReturnMessage = ({ isErr = false, code = 200, message = '성공', resultData = null, resultCnt = 0 }) => {
    if (isErr) {
        return {
            resultYn: 'N'
            , statusCode: code
            , statusMessage: message
            , errorCode: code
            , errorMessage: message
        }
    } else {
        return {
            resultYn: 'Y'
            , statusCode: code
            , statusMessage: message
            , errorCode: null
            , errorMessage: ''
            , resultData
            , resultCnt
        }
    }
};

/**
 * getUUID
 * 신규 UUID 값 생성
 * @returns 신규 UUID
 */
exports.getUUID = () => {
    return require('uuid4')();
};

/**
 * isNull
 * null 여부 조회
 * @param obj
 * @returns true, false
 */
exports.isNull = (obj) => {
    return obj === '' || obj == null || obj === 'null' || typeof obj === 'undefined';
};

/**
 * snakeToCamel
 * @param json 변경할 json
 * @description json의 key를 snake case => camel case로 변환
 * @return json
 */
exports.snakeToCamel = (json) => {

    if (Array.isArray(json)) {
        for (let data of json) {
            for(let key in data) {
                const oldKey = data[key];
                const newKey = key.replace(/_[a-z]/g, letter => letter.toUpperCase().replace("_", ""));

                delete data[key];
                data[newKey] = oldKey;
            }
        }
    } else {
        for(let key in json) {
            const oldKey = json[key];
            const newKey = key.replace(/_[a-z]/g, letter => letter.toUpperCase().replace("_", ""));

            delete json[key];
            json[newKey] = oldKey;
        }
    }

    return json;
};

/**
 * getUploadPath
 * 첨부파일 경로 조회 및 디렉토리 생성
 * @param fileGroup 첨부파일 경로1 (파일 그룹)
 * @returns {Socket|string|*}
 */
exports.getUploadPath = (fileGroup = 'attach', userKey = '') => {
    let rootDir = "/upload/visionPRO";
    let dirPath = "";

    if (fileGroup == 'friends') {
        dirPath = path.join(rootDir, fileGroup, userKey, (moment().format('YYYY') + moment().format('MM') + moment().format('DD')));
    } else {
        dirPath = path.join(rootDir, fileGroup, moment().format('YYYY'), moment().format('MM'), moment().format('DD'));
    }

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    return dirPath;
};

/**
 * getMulter
 * 파일 업로드 package (multer) 개체 얻기
 * @param fileGroup
 * @param rule
 * @returns {*}
 */
exports.getMulter = (fileGroup, rule) => {
    let storage = multer.diskStorage({
        destination: (req, file, callback) => {
            const fileDir = funcCmmn.isNull(req.body.fileGroup) ? fileGroup : req.body.fileGroup
            const userKey = funcCmmn.isNull(req.body.userKey) ? "" : req.body.userKey
            const destination = funcCmmn.getUploadPath(fileDir, userKey);
            callback(null, destination);
        },
        filename: (req, file, callback) => {
            let fileName = "";
            // 한글명 파일 인코딩 깨짐 현상 수정
            file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
            if(fileGroup == "mapping"){
                fileName = file.originalname;
            }else{
                fileName = uuid4() + path.extname(file.originalname);
            }

            callback(null, fileName);
        }
    });

    return multer({storage: storage});
};