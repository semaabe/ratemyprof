import { NextResponse } from 'next/server';
const { GoogleGenerativeAI } = require("@google/generative-ai");


export async function POST(req) {
    const apiKey = process.env.GOOGLE_API_KEY; // Securely accessing API key
    const genAI = new GoogleGenerativeAI(apiKey);


    try {
        const data = await req.json();
        const userMessage = data.message || "Hello, welcome to rate my professor chat box! Name a professor below with the univeristy/college they teach at";


        const systemPrompt =  `
        You are a helpful assistant that provides concise and accurate information about professors in different colleges/univeristies. You get reviews directly and provide useful responses based on the professor given by the user. You should return in the following JSON format:
        {
            "reviews": [
              {
                "professor": "Prof1",
                "review": "Great professor...",
                "subject": "Math",
                "stars": 5
              },
              // ... more reviews ...
            ]
          }
          `;


        const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });


        const chat = model.startChat({
            systemPrompt: systemPrompt,
            generationConfig: {
                maxOutputTokens: 100,
            },
        });


        const result = await chat.sendMessage(userMessage);
        const response = await result.response.text();


        return new NextResponse(response, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
        });


    } catch (error) {
        console.error('Error with Gemini API:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

