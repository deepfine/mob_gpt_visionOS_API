const defaultMapper = 'upload';
const fileModel = require('../models/fileModel');
const fs = require('fs');

exports.dbInsertFile = async (req, tagName, onSuccess, onError) => {
	if (!req.files[tagName]) {
		onError(null);
	} else {
		const client = await psql.getConnection();

		let regId = req.body.userKey || null;

		try {
			let returnFiles = [];
			let fileCount = req.files[tagName].length;
			let insertFileCount = 0;

			for (let thisFile of req.files[tagName]) {
				console.log(`thisFile.filename >> ${thisFile.filename}`)

				let fileNewModel = fileModel.newFileAllModel(req);

				// tb_file 정보
				let fileId = funcCmmn.getUUID();
				fileNewModel.fileId = fileId;
				fileNewModel.fileRegId = regId;
				fileNewModel.fileDtlYn = 'N';

				// tb_file_dtl 정보
				fileNewModel.fileDtlId = funcCmmn.getUUID();
				fileNewModel.fileParentId = fileId;
				fileNewModel.fileOriginalName = thisFile.originalname;
				fileNewModel.fileMimeType = thisFile.mimetype;
				fileNewModel.fileName = thisFile.filename;
				fileNewModel.fileDestination = thisFile.destination;
				fileNewModel.filePath = thisFile.path;
				fileNewModel.fileSize = thisFile.size;

				// Todo : 파일 업로드 용량 체크(Trial:20MB, PRO:100MB), maxSize 변수 이용
				if ( fileNewModel.fileSize > 100 * 1024 * 1024 ) {
					onError('FILE_SIZE_EXCEEDED');
					return false;
				}

				psql.insert(defaultMapper, 'insertFile', fileNewModel,
					(result) => {
						insertFileCount++;
						returnFiles.push(fileNewModel);

						if (insertFileCount == fileCount) {
							if (typeof onSuccess === 'function') {
								onSuccess(returnFiles);
							} else {
								onError('Error');
							}
						}
					}, (err) => {
						if (typeof onError === 'function') {
							onError(err);
						} else {
							return err;
						}
					}
				)
			}
		} catch (err) {
			await client.query('ROLLBACK');
			onError(err);
		} finally {
			client.release();
		}
	}
};

// 파일 복제
/*
exports.dbInsertCopyFile = (req, files, onSuccess, onError) => {

	if (typeof files !== 'object' || files.length <= 0) {
		onError(null);
	} else {
		let successCnt = 0;
		let failCnt = 0;

		for (let file of files) {
			let filePath = file.path;

			// 파일 경로 존재 여부 체크
			let isExist = fs.existsSync(filePath);

			if (isExist) {
				let fileDestination = file.destination;
				let copyFileDestination = fileDestination + '\\copy'
				let fileName = file.fileName;
				let copyFilePath = copyFileDestination + '\\' + fileName;

				let id = funcCmmn.getUUID();
				let rgtrId = req.body.rgtrId || null;
				let regIp = funcCmmn.getRequestIp(req);
				let regAgent = funcCmmn.getRequestUserAgent(req);
				let corpId = req.body.corpId || null;

				let fileMst = fileModel.newFileModel(req);
				//file 속성
				fileMst.file.id = id;
				fileMst.file.rgtrId = rgtrId;
				fileMst.file.regIp = regIp;
				fileMst.file.regAgent = regAgent;
				fileMst.file.fileGroupCd = req.body.fileGroupCd || 'my_storage';
				fileMst.file.etc = req.body.etc || null;
				fileMst.corpId = corpId;

				let i = 0; // 업로드 카운트 변수

				fs.readFile(filePath, function(err, data) {
					if (err) {
					} else {
						if (!fs.existsSync(copyFileDestination)) {
							fs.mkdirSync(copyFileDestination, { recursive: true });
						}
						fs.writeFile(copyFilePath, data, function(err) {

						});
					}
				});



				let fileDtl = fileModel.newFileDtlModel(req);

				//여기부터 fileDtl 속성
				fileDtl.parentId = id;//부모의 id => file의 id
				fileDtl.originalName = file.originalName;
				fileDtl.fileSeq = i++;//파일 업로드 순서
				fileDtl.mimetype = file.mimetype;
				fileDtl.fileName = file.fileName;
				fileDtl.destination = copyFileDestination;
				fileDtl.path = copyFilePath;
				fileDtl.size = file.size;

				fileMst.fileDtl.push(fileDtl);

				psql.insert(defaultMapper, 'insertFile', fileMst,
					(result) => {
						successCnt++;
					}, (err) => {
						failCnt++;
					}
				)
			} else {
				failCnt++;
			}
		}

		let cntJson = {success: successCnt, fail: failCnt};
		onSuccess(cntJson);
	}
};
*/