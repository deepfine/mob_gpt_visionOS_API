require('dotenv').config();
const {Configuration, OpenAIApi} = require("openai");
const defaultMapper = 'key';

async function getGptKey(dbConn) {
    const keyData = await dbConn.query(psql.getStatement(defaultMapper, 'getKey', {type: "ChatGPT"}));
    return keyData.rows[0].configuration;
}

async function callChatGPT(keyData, sendGptMessages) {
    const configuration = new Configuration(keyData);

    try {
        const openai = new OpenAIApi(configuration);

        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: sendGptMessages,
        });

        return {code: 200, messageData: response};

        //return response.data.choices[0].message;
    } catch (error) {
        return {code: 500, messageData: `${error.message}`};
    }
}

async function callImageGenerate(keyData, prompt) {
    // createImage
    const configuration = new Configuration(keyData);

    try {
        const openai = new OpenAIApi(configuration);

        const response = await openai.createImage({
            model: "dall-e-2",
            prompt: prompt,
            size: "512x512",
            response_format: "url",
            n: 3
        });

        return {code: 200, messageData: response};

        //return response.data.choices[0].message;
    } catch (error) {
        return {code: 500, messageData: `${error.message}`};
    }
}

module.exports = { callChatGPT, getGptKey, callImageGenerate }