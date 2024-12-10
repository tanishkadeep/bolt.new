require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = process.env.GEMINI_API_KEY;

async function main() {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const userPrompt = "Explain how AI works";
    // const result = await model.generateContent(userPrompt);
    // console.log(result.response.text());

    const result = await model.generateContentStream(userPrompt); 

    for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        process.stdout.write(chunkText);
      }

}

main();