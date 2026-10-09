'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Laugh,
  Palette,
  MessageSquare,
  Send,
  Volume2,
  Copy,
  Check,
  RefreshCw,
  ArrowLeft,
  Mic,
  MicOff,
  Cpu,
  Layers,
  Code2,
  Download
} from 'lucide-react';
import { audioFx } from '../lib/audioFx';

interface CreativeStudioProps {
  onBackToWorkspace: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  category: 'story' | 'joke' | 'art' | 'chat';
  svgContent?: string;
  timestamp: string;
}

const PRESET_PROMPTS = {
  story: [
    'Write a cyberpunk thriller where an AI agent discovers a hidden memory in the quantum core.',
    'A noir detective story set in Neo-Tokyo year 2088 involving a stolen neural key.',
    'A humorous space adventure about two maintenance bots left alone on a starship.',
  ],
  joke: [
    'Tell me 3 hilarious programmer jokes about merge conflicts and production bugs.',
    'Write a stand-up comedy routine about junior vs senior developers at 3 AM.',
    'What did the database say to the frontend framework during an outage?',
  ],
  art: [
    'Generate a stunning cyberpunk stargate with neon cyan & magenta glow (raw SVG + Midjourney prompt).',
    'Create an abstract quantum neural core with glowing energy nodes in SVG.',
    'Design a sleek futuristic gaming HUD emblem with neon rings in SVG.',
  ],
  chat: [
    'Write a poetic anthem about the birth of autonomous artificial intelligence.',
    'Brainstorm 5 mind-bending concepts for a sci-fi video game.',
    'Imagine an interview between Alan Turing and a self-aware supercomputer.',
  ],
};

export const CreativeStudio: React.FC<CreativeStudioProps> = ({ onBackToWorkspace }) => {
  const [activeCategory, setActiveCategory] = useState<'story' | 'joke' | 'art' | 'chat'>('story');
  const [selectedModel, setSelectedModel] = useState<'gemini' | 'qwen' | 'deepseek'>('gemini');
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: `Welcome to the **CodeForge & Antigravity Creative Studio**! 🎨✨\n\nI am your dedicated creative AI companion. You can ask me to:\n- 📖 **Write captivating stories, screenplays, and narrative worlds**\n- 😂 **Tell hilarious tech jokes, stand-up routines, and witty humor**\n- 🎨 **Generate generative SVG artwork and Midjourney visual prompts**\n- 💬 **Brainstorm wild concepts, poetry, songs, and freeform ideas**\n\nPick a category or type any prompt below!`,
      category: 'chat',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const extractSvg = (text: string): string | undefined => {
    const match = text.match(/<svg[\s\S]*?<\/svg>/i);
    return match ? match[0] : undefined;
  };

  const handleSend = async (overrideText?: string) => {
    const textToSend = (overrideText || inputPrompt).trim();
    if (!textToSend || loading) return;

    audioFx.playClick();
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      category: activeCategory,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/creative/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          category: activeCategory,
          modelPreference: selectedModel,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      const replyText = data.reply || "Sorry, I couldn't generate that creative response right now.";
      const svg = extractSvg(replyText);

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: replyText,
        category: activeCategory,
        svgContent: svg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      audioFx.playSuccess();
    } catch (err) {
      console.error('Failed to query creative chatbot:', err);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: "Oops! An error occurred while generating the creative piece. Please try again.",
        category: activeCategory,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner speech
    const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/[#*_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      audioFx.playClick();
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 relative z-10 space-y-6">
      {/* Studio Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-slate-950/80 border border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToWorkspace}
            className="p-2.5 rounded-xl bg-slate-900 border border-white/[0.1] text-slate-300 hover:text-cyan-400 transition-all flex items-center gap-1.5 font-mono text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Workspace
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h1
                style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: '18px',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  color: '#fff',
                }}
              >
                CREATIVE AI STUDIO & CHATBOT
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-400/40">
                UNIVERSAL CREATIVE BOT
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Stories • Stand-up Jokes • Generative SVG Visuals • Poetry & Freeform Ideas powered by Gemini & Qwen
            </p>
          </div>
        </div>

        {/* Model Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">Model Engine:</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/[0.12] text-xs font-mono text-cyan-300 outline-none cursor-pointer"
          >
            <option value="gemini">Google Gemini 2.5 Flash</option>
            <option value="qwen">Qwen 3 Coder (Alibaba)</option>
            <option value="deepseek">DeepSeek Chat V3</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveCategory('story')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeCategory === 'story'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-400/50 shadow-[0_0_15px_rgba(207,63,255,0.25)]'
              : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-white/[0.06]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          📖 Story & Narrative
        </button>
        <button
          onClick={() => setActiveCategory('joke')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeCategory === 'joke'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_15px_rgba(255,170,0,0.25)]'
              : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-white/[0.06]'
          }`}
        >
          <Laugh className="w-4 h-4" />
          😂 Jokes & Comedy
        </button>
        <button
          onClick={() => setActiveCategory('art')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeCategory === 'art'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,243,255,0.25)]'
              : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-white/[0.06]'
          }`}
        >
          <Palette className="w-4 h-4" />
          🎨 Generative Art & Visuals
        </button>
        <button
          onClick={() => setActiveCategory('chat')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeCategory === 'chat'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-[0_0_15px_rgba(0,255,153,0.25)]'
              : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-white/[0.06]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          💬 Freeform Creative Chat
        </button>
      </div>

      {/* Inspiration Quick Chips */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-950/40 border border-white/[0.05]">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Quick Prompts:</span>
        {PRESET_PROMPTS[activeCategory].map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(preset)}
            className="px-3 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/[0.08] text-[11px] font-sans text-slate-300 hover:text-cyan-300 transition-all text-left"
          >
            ⚡ {preset.slice(0, 48)}...
          </button>
        ))}
      </div>

      {/* Chat Thread Container */}
      <div
        className="rounded-2xl border border-white/[0.08] p-5 space-y-4 overflow-y-auto"
        style={{
          background: 'rgba(6, 8, 18, 0.85)',
          backdropFilter: 'blur(20px)',
          minHeight: '440px',
          maxHeight: '560px',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
          >
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 px-1">
              <span>{msg.role === 'user' ? '👤 You' : '🤖 Antigravity Creative Bot'}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            <div
              className={`p-4 rounded-2xl max-w-3xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-cyan-950/60 to-purple-950/60 border border-cyan-500/30 text-slate-100 rounded-tr-none'
                  : 'bg-slate-950/90 border border-white/[0.08] text-slate-200 rounded-tl-none shadow-xl'
              }`}
            >
              {/* Markdown Text Render */}
              <div className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed">
                {msg.content}
              </div>

              {/* Live Rendered SVG Art if present */}
              {msg.svgContent && (
                <div className="mt-4 p-3 rounded-xl bg-black/60 border border-cyan-500/30 overflow-hidden">
                  <div className="text-[10px] font-mono text-cyan-400 font-bold mb-2 flex items-center gap-1.5">
                    <Palette size={12} />
                    LIVE RENDERED GENERATIVE ARTWORK
                  </div>
                  <div
                    className="w-full flex justify-center items-center rounded-lg overflow-hidden max-h-[360px]"
                    dangerouslySetInnerHTML={{ __html: msg.svgContent }}
                  />
                </div>
              )}

              {/* Message Actions */}
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/[0.06]">
                  <button
                    onClick={() => handleSpeak(msg.content)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-all flex items-center gap-1 text-[10px] font-mono"
                    title="Read aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Speak
                  </button>
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-all flex items-center gap-1 text-[10px] font-mono"
                    title="Copy text"
                  >
                    {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === msg.id ? 'Copied' : 'Copy'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 max-w-md">
            <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
            <span className="text-xs font-mono text-purple-300">
              Generating creative piece via {selectedModel.toUpperCase()}...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Multimodal Prompt Input Bar */}
      <div className="p-3 rounded-2xl bg-slate-950/90 border border-white/[0.1] backdrop-blur-2xl shadow-2xl flex items-center gap-2.5">
        <button
          onClick={toggleVoiceInput}
          className={`p-3 rounded-xl border transition-all flex items-center justify-center ${
            isListening
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse'
              : 'bg-slate-900 border-white/[0.08] text-slate-400 hover:text-cyan-300'
          }`}
          title={isListening ? 'Listening... click to stop' : 'Voice Input (Speech-to-Text)'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Ask the Creative Bot to generate a ${activeCategory}... (or click mic for voice input)`}
          className="flex-1 bg-transparent border-0 outline-none text-sm text-slate-100 placeholder:text-slate-500 font-sans px-2"
        />

        <button
          onClick={() => handleSend()}
          disabled={!inputPrompt.trim() || loading}
          className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            !inputPrompt.trim() || loading
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 hover:opacity-95 shadow-[0_0_20px_rgba(0,243,255,0.3)] cursor-pointer'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          Generate
        </button>
      </div>
    </div>
  );
};
