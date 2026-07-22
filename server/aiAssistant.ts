import { GoogleGenAI, Type, Schema } from "@google/genai";
import * as genai from "@google/genai";

// 1. Initialize Gemini Client
const getGeminiClient = () => {
  if (process.env.GEMINI_API_KEY) {
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return null;
};

// 2. Fallback Logic & Orchestration
export const generateAIResponse = async (prompt: string, systemInstruction: string) => {
  const needsSearch = prompt.toLowerCase().includes("current") || prompt.toLowerCase().includes("latest") || prompt.toLowerCase().includes("today");
  
  try {
    if (needsSearch) {
      console.log("Routing to Gemini with Search Grounding");
      return await tryGeminiWithSearch(prompt, systemInstruction);
    } else {
      // Low latency path
      return await tryGemini(prompt, systemInstruction);
    }
  } catch (error) {
    console.error("Gemini failed, falling back to Groq:", error);
    return await tryGroq(prompt, systemInstruction);
  }
};

// 3. Provider Implementations

// Gemini API (Standard)
async function tryGemini(prompt: string, systemInstruction: string, model: string = "gemini-2.0-flash"): Promise<string> {
  console.log(`[Gemini] Attempting with model: ${model}`);
  const ai = getGeminiClient();
  if (!ai) throw new Error("GEMINI_API_KEY is missing");
  
  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      systemInstruction,
      temperature: 0.7,
    },
  });
  
  if (!response.text) throw new Error("Empty response from Gemini");
  return response.text;
}

// Gemini API (With Search Grounding)
async function tryGeminiWithSearch(prompt: string, systemInstruction: string): Promise<string> {
  console.log(`[Gemini] Attempting Search Grounding (gemini-2.0-flash)`);
  const ai = getGeminiClient();
  if (!ai) throw new Error("GEMINI_API_KEY is missing");
  
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      systemInstruction,
      temperature: 0.7,
      tools: [{ googleSearch: {} }],
    },
  });
  
  if (!response.text) throw new Error("Empty response from Gemini");
  return response.text;
}

// Groq API (Fast, using LLaMA 3)
async function tryGroq(prompt: string, systemInstruction: string): Promise<string> {
  console.log(`[Groq] Attempting...`);
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is missing");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    })
  });

  if (!response.ok) {
    throw new Error(`Groq API failed with status: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
