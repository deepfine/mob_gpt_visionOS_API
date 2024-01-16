const NODE_ENV = "dev";
const CONFIG = require(`./config.${NODE_ENV}.json`);

global.path = require('path');
global.ROOT = __dirname;
global.NODE_ENV = NODE_ENV;
global.CONFIG = CONFIG;
global.psql = require('./app/modules/db.psql');
global.funcCmmn = require('./app/modules/func-common');
global.crypto = require('./app/modules/crypto');
// global.moment = require('moment');
global.ALLOWED_METHODS = ['GET', 'POST'];

let http = require('http');
const express = require('express');
const fs = require('fs');
const constants = require('crypto').constants;
const logger = require('morgan');
const app = express();
const timeout = require('connect-timeout');

// cors 적용
const cors = require('cors');
const options = {
    origin: "https://localhost",// 접근 권한을 부여하는 도메인
    credentials: true,          // 응답 헤더에 Access-Control-Allow-Credentials 추가
    optionsSuccessStatus: 200,  // 응답 상태 200으로 설정
};
app.use(cors(options));

require('express-async-errors');
const path = require("path");

app.use('/upload', express.static(path.join('/upload')));

const routerUser = require('./app/routes/user')(express);
const routerCommon = require('./app/routes/common')(express);
const routerChat = require('./app/routes/chat')(express);

app.use(express.urlencoded({extended: false, limit:"200mb"}));
app.use(express.json({limit:"200mb"}));
app.use(timeout('600s'));

app.use(logger('dev'));
app.use('/user', routerUser);
app.use('/common', routerCommon);
app.use('/chat', routerChat);

app.use(function (req, res, next) {
    res.sendStatus(404);
});

app.use(function (err, req, res, next) {
    console.log(err);
    res.sendStatus(500);
});

let server;

const SSL_OPTION =
    CONFIG.node_server.isUseHttps
        ? {
            key: fs.readFileSync(CONFIG.node_server.sslKey)
            , cert: fs.readFileSync(CONFIG.node_server.sslCert)
            , secureOptions: constants.SSL_OP_NO_TLSv1 | constants.SSL_OP_NO_TLSv1_1
            , ciphers: getCapCiphers().join(':') + ':!RC4:!MD5:!aNULL'
        }

        : undefined;

if (SSL_OPTION) {
    http.createServer((req, res) => {
        const host = req.headers['host'];
        if (host) {
            const domain = host.substring(0, host.indexOf(':'));

            res.writeHead(301, {
                Location: 'https://' + domain + ':' + CONFIG.node_server.sslPort + req.url
            });
        }
        res.end();
    }).listen(CONFIG.node_server.port);

    http = require('https');

    server = http.createServer(SSL_OPTION, app).listen(CONFIG.node_server.sslPort, () => {
        console.log(`✅  Server is running at port ${server.address().port}.`);
        console.log(`✅  Activated environment: ${NODE_ENV}`);
    });
    server.setTimeout(10*60*1000);

} else {
    server = http.createServer(app).listen(CONFIG.node_server.port, () => {
        console.log(`✅  Server is running at port ${server.address().port}.`);
        console.log(`✅  Activated environment: ${NODE_ENV}`);
    });
}

function getCapCiphers() {
    return [
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'AES256-GCM-SHA384',
        'AES128-GCM-SHA256',
    ];
}