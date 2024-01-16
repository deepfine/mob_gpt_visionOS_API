const express = require('express');
const axios = require('axios');
const {pipeline} = require("node:stream/promises")

const { callChatGPT } = require('./appGptModule');
const {Configuration, OpenAIApi} = require("openai");
const router = express.Router();

const app = express();
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.get('/ask', async (req, res) => {
  const prompt = req.query.prompt;
  const response = await callChatGPT(prompt);

  if (response) {
    res.json({ 'response': response });
  } else {
    res.status(500).json({ 'error': 'Failed to get response from ChatGPT API' });
  }
});


app.get('/test', async (req, res) => {
    const prompt = req.query.prompt;

    //const configuration = new Configuration({
    //  apiKey: "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"
    //});

    try {
      const aaaa = await axios.post("https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0,
            max_tokens: 25,
            n: 1,
            stream: true,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer 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`,
              //responseType: 'stream'
            }
          }
      );

      const stream = aaaa.data;

      stream.on('data', data => {
        console.log(`STREAM ==> ${data}`);
      });

      stream.on('end', () => {
        console.log("stream done");
      });


      // const test = await axios({
      //   method: "POST", // 요청 방식
      //   url: "https://api.openai.com/v1/chat/completions", // 요청 주소
      //   headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer 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`,
      //     },
      //   data: {
      //     model: "gpt-3.5-turbo",
      //     messages: [
      //       {
      //         role: "user",
      //         content: prompt,
      //       },
      //     ],
      //     temperature: 0,
      //     max_tokens: 25,
      //     n: 1,
      //     stream: true,
      //   }
      // });
      //
      // const reader = await test;
      //
      // console.log(reader);

      // while (true) {
      //   const chunk = await reader.read();
      //   const {done, value} = chunk;
      //
      //   if (done) {
      //     break;
      //   }
      //   console.log(value);
      // }

      //await pipeline(response.data, res);
      //res.json({ 'response': response.data.choices[0].message });
    } catch (error) {
      res.status(500).json({ 'error': `Failed to get response from ChatGPT API ::: ${error}`});
    }
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});