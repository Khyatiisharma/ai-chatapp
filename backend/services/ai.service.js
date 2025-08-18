import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

export const generateResult = async (prompt) => {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash"
      , systemInstruction :  'Khyati yha pe likhna hai'
     });
    const result = await model.generateContent(prompt);

    // Extract text
    const text = result?.response?.text?.();
    return text || "No response from AI.";
  } catch (error) {
    console.error("❌ Error generating AI response:", error.message);
    return "Sorry, I couldn't process that request.";
  }
};
