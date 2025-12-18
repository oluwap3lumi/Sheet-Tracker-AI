
import { GoogleGenAI, Type } from "@google/genai";
import { SheetRow } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getSheetInsights = async (newRows: SheetRow[]) => {
  if (newRows.length === 0) return "No new rows to analyze.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these new spreadsheet entries and provide a brief summary of trends or anomalies: ${JSON.stringify(newRows)}`,
      config: {
        systemInstruction: "You are a professional data analyst. Summarize the provided JSON data concisely in a few bullet points. Focus on user activity, value trends, and status distributions.",
      },
    });

    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to AI service.";
  }
};
