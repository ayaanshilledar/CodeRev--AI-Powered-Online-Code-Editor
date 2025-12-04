import { NextResponse } from "next/server";
const { GoogleGenerativeAI } = require("@google/generative-ai");

export async function POST(request) {
    try {
        const { code, language } = await request.json();
        if (!code) {
            return NextResponse.json({ error: "Code is required" }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


        const prompt = `
        Generate detailed documentation for the following code.
        The documentation should be in plain text format, NOT as code comments.
        Do not include any code blocks or markdown formatting like bold or italics if possible, just clean text.
        Explain the purpose, functionality, and key components of the code.
        Do not include the original code in the response.
        Code:
        ${code}
        `;

        const result = await model.generateContent(prompt);
        let documentation = result.response.text().trim();

        // Ensure the response doesn't contain the code or markdown
        //documentation = documentation.replace(/```[\s\S]*?```/g, ""); // Remove triple backticks if any
        documentation = documentation.replace(code, "").trim(); // Remove the code if it appears
        documentation = documentation.replace(language, "").trim();
        documentation = documentation.replace(/`{3}/g, "").replace(/`{3}$/g, "");



        return NextResponse.json({ documentation }, { status: 200 });
    } catch (error) {
        console.error("Gemini API Error:", error.response?.data || error.message);
        return NextResponse.json({ error: "Failed to generate documentation" }, { status: 500 });
    }
}
