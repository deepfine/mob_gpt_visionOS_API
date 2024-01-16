module.exports = (express) => {
    const router = express.Router();
    const commonController = require('../controllers/commonController');
    const validator = require('../modules/validator');
    const fileModel = require('../models/fileModel');
    const fileSchema = fileModel.fileSchema;
    const upload = funcCmmn.getMulter();

    /* 파일 업로드 (단/다건) */
    router.post('/uploadFile', upload.fields([{name: 'upload'}]),
        validator.validate({
            upload: fileSchema.upload,
        }), commonController.uploadFile);

    /* 파일 읽기 */
    router.all('/readFile',
        validator.validate({

        }), commonController.readFile);

    return router;
};