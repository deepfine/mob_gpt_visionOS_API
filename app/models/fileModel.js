var baseModel = require('./baseModel');

const FILE = {
    file:{
        id: null
        , delYn: null
        , regId: null
        , regDate: null
	},
	fileDtl:[]
};

const FILE_DTL = {
     id: null
     , parentId: null
     , originalName: null
     , mimetype: null
     , fileName: null
     , destination: null
     , path: null
     , size: null
};

const FILE_ALL = {
      fileId: null
    , fileRegId: null
    , fileDtlYn: null
    , fileRegDate: null
    , fileDtlId: null
    , fileParentId: null
    , fileOriginalName: null
    , fileMimeType: null
    , fileName: null
    , fileDestination: null
    , filePath: null
    , fileSize: null
}

exports.newFileModel = (opt) => {
	return baseModel.extend(FILE, opt);
};

exports.newFileDtlModel = (opt) => {
	return baseModel.extend(FILE_DTL, opt);
};

exports.newFileAllModel = (opt) => {
    return baseModel.extend(FILE_ALL, opt);
};

// ----------------------------- 스키마 정의 ------------------------------------------
/**
 * 스키마 정의, model에서  client에서 받을 데이터 작성하면서 같이 작성
 *
 * 형식
 * parameter명: {
 *     in: "검사범위 ['body', 'cookie', 'header', 'query', 'params']",
 *     -- 이하는 검사 옵션으로 아래 링크로 옵션 확인가능
 *     https://github.com/express-validator/express-validator/blob/master/src/chain/validators.ts
 *     exists: { // 파라미터 존재여부
 *         errorMessage: "poiCtgrGupId is required" // 옵션에 해당되지 않을때 발생시키는 에러 메세지
 *     },
 *     isUUID: { // uuid 인지 확인
 *         version: 4 // uuid 버전 (lx_api 경우 4버전)
 *         , errorMessage: "poiCtgrGupId is uuid check the value"
 *     }
 * },
 * */

/* vps 스키마 */
exports.fileSchema = {
    upload: {
        custom: {
            options: ( (value, {req}) => {
                if (Object.keys(req.files).length == 0) {
                    throw new Error("please upload file");
                } else{
                    return true;
                }
            }),
            bail: true,
        },
    },
    fileId: {
        exists: {
            errorMessage: "fileId is required"
        },
        notEmpty: {
            errorMessage: "fileId is required"
        },
        isUUID: {
            version: 4
            , errorMessage: "invalid value in fileId, please check the value"
        },
    },
}