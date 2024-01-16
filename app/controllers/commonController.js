const uploadMapper = 'upload';
const fileModule = require('../modules/file');
const fileModel = require('../models/fileModel')
const fs = require('fs')

/* 파일 단/다건 업로드 */
exports.uploadFile = (req, res) => {
    const onError = (err) => {
        if(err === null) {
            res.json(funcCmmn.getReturnMessage({ isErr: true, code: 415, message: '지원하지 않는 확장자' }));
        } else if (err === 'FILE_SIZE_EXCEEDED') {
            res.json(funcCmmn.getReturnMessage({ isErr: true, code: 400, message: '파일 사이즈 초과' }));
        } else {
            res.json(funcCmmn.getReturnMessage({ isErr: true, code: 500, message: '파일 업로드 실패' }));
        }
    };

    const onSuccess = (files) => {
        let onError2 = (err) => {
            console.log(err);
            res.json(funcCmmn.getReturnMessage({ isErr: true, code: 500, message: '파일 업로드 실패' }));
        };

        let onSuccess2 = (data) => {
            res.json(funcCmmn.getReturnMessage({ resultData: data, resultCnt: data.length }));
        };

        // 파일 상세 정보 조회
        if(files.length === 1) {
            psql.selectOne(uploadMapper, 'selectFileDtlByFileDtlId', {fileDtl: new Array({fileId: files[0].fileId})}, onSuccess2, onError2);
        } else {
            psql.select(uploadMapper, 'selectFileDtlByFileDtlId', {fileDtl: files}, onSuccess2, onError2);
        }
    };

    fileModule.dbInsertFile(req, 'upload', onSuccess, onError);
}

/* 파일 읽기 */
exports.readFile = (req, res) => {
    let file = fileModel.newFileAllModel(req);

    psql.selectOne(uploadMapper, 'selectFileReadStream', file, (result) => {
        if (funcCmmn.isNull(result)) {
            res.json(funcCmmn.getReturnMessage({isErr: true, code: 404, message: 'file is not found'}));
        } else {
            let filePath = result.filePath;
            let filestream = fs.createReadStream(filePath);

            console.log(filePath);

            filestream.on('open', function () {
                filestream.pipe(res);
            });

            filestream.on('error', function(err) {
                res.json(funcCmmn.getReturnMessage({isErr: true, code: 500, message: err.message}));
            });
        }
    }, (err) =>{
        res.json(funcCmmn.getReturnMessage({isErr: true, code: 500, message: err.message}));
    });
}