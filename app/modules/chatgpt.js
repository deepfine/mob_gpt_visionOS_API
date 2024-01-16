require('dotenv').config();
const {Configuration, OpenAIApi} = require("openai");

async function callChatGPT(prompt) {
    // GPT KEY 는 나중에 properties로 관리해야함!!!
    const configuration = new Configuration({
       apiKey: "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"
    });

    try {
        const openai = new OpenAIApi(configuration);

        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{role: "user", content: prompt}],
        });

        return response.data.choices[0].message;
    } catch (error) {
        console.log(`ERROR >> ${error.message}`)
        return null;
    }
}

module.exports = { callChatGPT }