require('dotenv').config();
const {Configuration, OpenAIApi} = require("openai");

async function callChatGPT(sendGptMessages) {
    // GPT KEY 는 나중에 properties로 관리해야함!!!
    const configuration = new Configuration({
        apiKey: "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",
        organization: "org-kqyxr55swOBXR6D77Pdzu1hR"
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