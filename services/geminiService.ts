
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Initialized GoogleGenAI strictly using process.env.API_KEY as required by guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPitchFeedback = async (pitch: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this 60-second business elevator pitch and provide constructive feedback on:
      1. Clarity of the offering
      2. Impact of the 'ask' (referral request)
      3. Engagement level.
      Pitch: "${pitch}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Overall score out of 10" },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedHook: { type: Type.STRING, description: "A more powerful opening line" }
          },
          required: ["score", "strengths", "improvements", "suggestedHook"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Pitch Feedback Error:", error);
    return null;
  }
};

export const getSmartMatching = async (requirement: string, members: any[]) => {
  try {
    const memberData = members.map(m => ({ id: m.id, name: m.name, category: m.category, keywords: m.keywords }));
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Given the client requirement: "${requirement}", match it with the best business professional from this list: ${JSON.stringify(memberData)}. Return the top 1 ID and why.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchedId: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ["matchedId", "reason"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Matching Error:", error);
    return null;
  }
};

export const generateThankYouNote = async (referrerName: string, clientName: string, requirement: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a professional and warm business thank you note. 
      Referrer Name: ${referrerName}
      Client referred: ${clientName}
      Project details: ${requirement}
      
      The note should be concise (2-3 sentences), appreciative, and strengthen the business relationship.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            note: { type: Type.STRING, description: "The generated thank you message" }
          },
          required: ["note"]
        }
      }
    });
    return JSON.parse(response.text).note;
  } catch (error) {
    console.error("Gemini Thank You Note Error:", error);
    return `Hi ${referrerName}, thank you so much for the referral of ${clientName} for ${requirement}. I truly appreciate your trust and support!`;
  }
};
