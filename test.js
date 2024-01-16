/*
const openai = require('openai');
const api_key = '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';

const prompt = 'Once upon a time,';
const model = 'gpt-3.5-turbo';

openai.api_key = api_key;

const params = {
    prompt: prompt,
    model: model,
    max_tokens: 50
};

openai.completions.create(params, function (err, response) {
    if (err) throw err;

    console.log(response.choices[0].text);
});*/


const app = require("express")();
const axios = require("axios");
// We configure the server to use cors and body-parser middleware
//  to handle cross-origin requests and parse JSON and URL-encoded data, respectively.
const bodyParser = require('body-parser');
const cors = require('cors');
//import Configuration, and OpenAIApi from the openai package.
const { Configuration, OpenAIApi } = require("openai");

const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// create a new instance of Configuration
// by passing the organization and apiKey provided by OpenAI.
const configuration = new Configuration({
    organization: "org-7MPhMOWHIuaXBmGaCDpe7LxA",
    apiKey: "qw-mLLPFJLIhLFPQB8jgycbY6UlcjFJreajtWindPNZo3mkerIOP",
});

// create a new instance of OpenAIApi by passing the configuration object.
const openai = new OpenAIApi(configuration);

app.post('/createchat', async (req, res) => {
    try {
        const ASSISTANT = {"role": "system", "content": "How You can help me ?"};
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                ASSISTANT,
            ]
        });
        res.send(response.data);
    } catch (e) {
        console.log({ e });
    }
});

app.listen(PORT, () => {
    console.log(`App listening on PORT - ${PORT}`);
});