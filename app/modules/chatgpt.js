require('dotenv').config();
const {Configuration, OpenAIApi} = require("openai");

async function callChatGPT(sendGptMessages) {
    // GPT KEY 는 나중에 properties로 관리해야함!!!
    const configuration = new Configuration({
       apiKey: "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"
    });

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

module.exports = { callChatGPT }