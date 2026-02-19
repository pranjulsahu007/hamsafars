import { GoogleGenAI } from "@google/genai";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.warn("API Key not found in environment.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

export const generateIcebreaker = async (userA: string, userB: string): Promise<string> => {
    const client = getClient();
    if (!client) return "Ask them about their favorite campus food spot!";

    try {
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate a short, fun, and witty icebreaker line for two students (User ${userA} and User ${userB}) who just matched on a campus app. Keep it under 20 words. Do not use quotes.`,
        });
        
        return response.text || "Hey! Looks like we both have good taste.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Hey! Looks like we matched!";
    }
};
