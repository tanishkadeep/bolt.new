"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const node_1 = require("./defaults/node");
const react_1 = require("./defaults/react");
const prompts_1 = require("./prompts");
const cors_1 = __importDefault(require("cors"));
const { GoogleGenerativeAI } = require("@google/generative-ai");
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post("/template", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userPrompt = req.body.prompt;
    const prompt = "Here is the user prompt: " + userPrompt + "\n\n" + "Based on this prompt, Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra";
    const result = yield model.generateContent(prompt);
    const answer = result.response.text().trim(); // react or node
    if (answer == "react") {
        res.json({
            prompts: [prompts_1.BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${react_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [react_1.basePrompt]
        });
        return;
    }
    if (answer == "node") {
        res.json({
            prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${node_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [node_1.basePrompt]
        });
        return;
    }
    res.status(403).json({ message: "You cant access this" });
    return;
}));
app.post("/chat", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const messages = req.body.messages;
    const chat = model.startChat({
        history: messages,
    });
    // let result = await chat.sendMessageStream(getSystemPrompt());
    // for await (const chunk of result.stream) {
    //   const chunkText = chunk.text();
    //   process.stdout.write(chunkText);
    // }
    let result = yield chat.sendMessage((0, prompts_1.getSystemPrompt)());
    console.log(result.response.text());
    res.json({
        response: result.response.text()
    });
}));
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
