import { GoogleGenAI } from "@google/genai";
import { NextResponse } from 'next/server';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function POST(req: Request) {
  try {
    const { message, mode } = await req.json();

    if (!process.env.API_KEY) {
      return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
    }

    let modelName = 'gemini-2.5-flash-lite-latest'; // Default for fast
    let config: any = {
      systemInstruction: "Você é um especialista em visagismo e estilo masculino para a barbearia NextBarber Pro. Dê conselhos curtos, diretos e estilosos.",
    };

    if (mode === 'deep') {
      // Use Thinking Mode for complex queries
      modelName = 'gemini-3-pro-preview';
      config = {
        ...config,
        thinkingConfig: { thinkingBudget: 32768 }, // Max budget for deep analysis
        systemInstruction: "Você é um consultor de imagem avançado. Analise formato de rosto, tipo de cabelo e tendências para sugerir o corte perfeito com justificativa técnica.",
      };
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: message,
      config: config,
    });

    return NextResponse.json({ text: response.text });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: 'Failed to consult AI' }, { status: 500 });
  }
}