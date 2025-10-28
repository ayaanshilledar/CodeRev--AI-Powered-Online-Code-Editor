import { NextResponse } from "next/server";
const { GoogleGenerativeAI } = require("@google/generative-ai");

export async function POST(request) {
  try {
    const { code } = await request.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Valid code string is required" },
        { status: 400 }
      );
    }

    // Try to fix code with AI
    let fixedCode = await fixCodeWithAI(code);

    // If we got fixed code, return it
    if (fixedCode) {
      return NextResponse.json({ fixedCode, aiFixed: true }, { status: 200 });
    }

    // If AI couldn't fix it, return original code
    return NextResponse.json(
      {
        fixedCode: code,
        aiFixed: false,
        message: "No fixes needed or could not determine fixes",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/get-errors:", error);
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// 🔹 AI-Based Auto-Fix for Code
async function fixCodeWithAI(code) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Prefer a model known to work (same as documentation endpoint),
    // then fall back to other stable options.
    const candidateModels = [
        "gemini-2.5-flash",
        "gemini-1.5-pro",
        "gemini-1.5-flash"
    ];

    // Single prompt used for all attempts
    const prompt = `Fix the syntax errors in the following code:\n\n${code}\n\nReturn only the corrected code without any comments or markdown formatting. Preserve any existing comments.`;

    for (const modelName of candidateModels) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent([{ text: prompt }]);
            const text = result?.response?.text?.() ?? "";
            const fixedCode = (text || "").replace(/```[a-z]*\n?/gi, "").replace(/```/g, "").trim();
            if (fixedCode) return fixedCode;
        } catch (err) {
            // Try next model
            console.error(`AI Fix Error with ${modelName}:`, err?.message || err);
        }
    }

    return null;
}
