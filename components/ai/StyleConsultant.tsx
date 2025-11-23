'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Zap, BrainCircuit, X } from 'lucide-react';
import { ConsultMode } from '../../types/index';
import { GoogleGenAI } from "@google/genai";

export const StyleConsultant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<ConsultMode>('fast');

  const handleConsult = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse('');

    try {
      // Direct client-side call since API routes aren't available in this preview
      // Use process.env.API_KEY injected via shim or environment
      const apiKey = process.env.API_KEY;
      
      if (!apiKey) {
        setResponse("API Key is missing. Please configure it in the environment.");
        setLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      let modelName = 'gemini-2.5-flash-lite-latest'; // Fast mode
      let config: any = {
        systemInstruction: "Você é um especialista em visagismo e estilo masculino para a barbearia NextBarber Pro. Dê conselhos curtos, diretos e estilosos. Mantenha um tom profissional mas descolado.",
      };

      if (mode === 'deep') {
        modelName = 'gemini-3-pro-preview'; // Deep thinking mode
        config = {
          ...config,
          thinkingConfig: { thinkingBudget: 32768 },
          systemInstruction: "Você é um consultor de imagem master. Analise detalhadamente formato de rosto, tipo de cabelo e tendências. Explique o 'porquê' de cada sugestão com base técnica de visagismo.",
        };
      }

      const result = await ai.models.generateContent({
        model: modelName,
        contents: input,
        config: config,
      });

      if (result.text) {
        setResponse(result.text);
      }
    } catch (error) {
      console.error("AI Error:", error);
      setResponse("Opa, tive um problema técnico. Tente novamente em alguns instantes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-[90vw] max-w-md bg-dark-card border border-gold/30 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-xl"
          >
            <div className="bg-gradient-to-r from-gold to-gold-light p-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-dark font-bold">
                <Sparkles className="w-5 h-5" />
                <span>AI Stylist</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 bg-black/10 p-1 rounded-lg mr-2">
                  <button 
                    onClick={() => setMode('fast')}
                    className={`p-1.5 rounded-md transition-colors ${mode === 'fast' ? 'bg-dark/20 text-dark' : 'text-dark/50 hover:text-dark'}`}
                    title="Resposta Rápida (Flash Lite)"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setMode('deep')}
                    className={`p-1.5 rounded-md transition-colors ${mode === 'deep' ? 'bg-dark/20 text-dark' : 'text-dark/50 hover:text-dark'}`}
                    title="Análise Profunda (Thinking Mode)"
                  >
                    <BrainCircuit className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-dark/70 hover:text-dark">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto bg-dark/95 scrollbar-thin scrollbar-thumb-gray-700">
              {response ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-200 leading-relaxed">{response}</div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-3">
                  <Sparkles className="w-8 h-8 opacity-50" />
                  <p className="text-center text-sm max-w-[200px]">
                    {mode === 'fast' 
                      ? "Pergunte sobre tendências ou peça uma dica rápida." 
                      : "Descreva seu rosto e cabelo para uma consultoria completa."}
                  </p>
                </div>
              )}
              {loading && (
                <div className="flex justify-center py-8">
                   <div className="relative">
                     <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin"></div>
                     <div className="absolute inset-0 flex items-center justify-center">
                       <Sparkles className="w-4 h-4 text-gold animate-pulse" />
                     </div>
                   </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/5 bg-dark-card/50 flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'fast' ? "Dica rápida..." : "Descreva seu estilo..."}
                className="flex-1 bg-dark border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleConsult()}
              />
              <button
                onClick={handleConsult}
                disabled={loading || !input.trim()}
                className="bg-gradient-to-br from-gold to-gold-light text-dark p-3 rounded-xl hover:shadow-lg hover:shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-gradient-to-br from-gold to-gold-light rounded-full shadow-2xl flex items-center justify-center border-2 border-white/10 relative group"
      >
        <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-20 duration-2000"></div>
        {isOpen ? (
          <X className="w-7 h-7 text-dark" />
        ) : (
          <Sparkles className="w-7 h-7 text-dark" />
        )}
      </motion.button>
    </div>
  );
};