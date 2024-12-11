require("dotenv").config();
import express, { Request, Response } from "express";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
import { basePrompt as reactBasePrompt } from "./defaults/react";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import cors from "cors";

const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


const app = express();
app.use(cors())
app.use(express.json());

app.post("/template", async (req, res) => {
  const userPrompt = req.body.prompt;

  const prompt = "Here is the user prompt: " + userPrompt + "\n\n" + "Based on this prompt, Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra";

  const result = await model.generateContent(prompt);

  const answer = result.response.text().trim(); // react or node

  if (answer == "react") {
    res.json({
      prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
      uiPrompts: [reactBasePrompt]
    })
    return;
  }

  if (answer == "node") {
    res.json({
      prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
      uiPrompts: [nodeBasePrompt]
    })
    return;
  }

  res.status(403).json({ message: "You cant access this" })
  return;


});

app.post("/chat", async (req, res) => {
  const messages = req.body.messages;
  const chat = model.startChat({
    history: messages,
  });

  let result = await chat.sendMessageStream("Create a todo app.");
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    process.stdout.write(chunkText);
  }

  res.json({})
  return;
});



app.listen(3000);

// async function main() {
//   const genAI = new GoogleGenerativeAI(API_KEY);
//   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//   const userPrompt = "Explain how AI works";
//   // const result = await model.generateContent(userPrompt);
//   // console.log(result.response.text());

//   const result = await model.generateContentStream(userPrompt);

//   for await (const chunk of result.stream) {
//     const chunkText = chunk.text();
//     process.stdout.write(chunkText);
//   }

// }

// main();