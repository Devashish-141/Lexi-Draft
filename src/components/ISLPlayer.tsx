"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Hand, Play, Pause, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ISLPlayerProps {
  text: string;
  onClose?: () => void;
}

export function ISLPlayer({ text, onClose }: ISLPlayerProps) {
  const [islSpeaking, setIslSpeaking] = useState(false);
  const [islPaused, setIslPaused] = useState(false);
  const [islProgress, setIslProgress] = useState(0);
  
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleIslPlay = useCallback(() => {
    if (!text || typeof window === 'undefined') return;
    const synth = window.speechSynthesis;

    if (islPaused && speechRef.current) {
      synth.resume();
      setIslPaused(false);
      setIslSpeaking(true);
      return;
    }

    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Hardcoded to Indian English
    utterance.lang = 'en-IN';
    utterance.rate = 0.82;
    utterance.pitch = 1.0;

    const voices = synth.getVoices();
    const preferred = voices.find(v => v.lang.startsWith('en-IN') || v.name.includes('India')) || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => {
      setIslSpeaking(true);
      setIslPaused(false);
      setIslProgress(0);
      
      const start = Date.now();
      const estDuration = (text.split(' ').length) * 380; 
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - start;
        const pct = Math.min(99, Math.round((elapsed / estDuration) * 100));
        setIslProgress(pct);
      }, 500);
    };

    utterance.onend = () => {
      setIslSpeaking(false);
      setIslPaused(false);
      setIslProgress(100);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };

    utterance.onerror = () => {
      setIslSpeaking(false);
      setIslPaused(false);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };

    speechRef.current = utterance;
    synth.speak(utterance);
  }, [text, islPaused]);

  const handleIslPause = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.pause();
    setIslPaused(true);
    setIslSpeaking(false);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  }, []);

  const handleIslStop = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    setIslSpeaking(false);
    setIslPaused(false);
    setIslProgress(0);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  }, []);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  return (
    <div className="mb-6 rounded-2xl overflow-hidden border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-950 to-indigo-950 relative shadow-xl w-full max-w-2xl mx-auto animate-in fade-in duration-300">
      {/* Avatar display area */}
      <div className="flex items-center gap-5 px-6 pt-5 pb-4">
        {/* Animated avatar circle */}
        <div className="relative shrink-0">
          <div className={cn(
            "w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-300",
            islSpeaking
              ? "border-purple-400 bg-purple-800 shadow-lg shadow-purple-500/40"
              : islPaused
              ? "border-amber-400 bg-amber-900/60"
              : "border-purple-700 bg-purple-900"
          )}>
            <Hand className={cn(
              "w-7 h-7 transition-all",
              islSpeaking ? "text-purple-200 animate-bounce" : "text-purple-400"
            )} />
          </div>
          {islSpeaking && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-purple-950 animate-pulse" />
          )}
          {islPaused && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-purple-950" />
          )}
        </div>

        {/* Info and waveform */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-black text-purple-200 uppercase tracking-wider">
              {islSpeaking ? "Narrating Document…" : islPaused ? "Paused" : islProgress === 100 ? "Narration Complete" : "AI-ISL Narrator"}
            </p>
            <span className="text-[9px] font-bold text-purple-400">2026 Beta · MeitY</span>
          </div>

          {/* Live waveform bars */}
          {islSpeaking && (
            <div className="flex items-end gap-[3px] h-6 mb-2">
              {[0.4, 0.7, 1.0, 0.6, 0.9, 0.5, 0.8, 1.0, 0.3, 0.7, 0.9, 0.4].map((h, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-purple-400"
                  style={{
                    height: `${h * 100}%`,
                    animation: `pulse ${0.4 + i * 0.07}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 60}ms`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Progress bar */}
          {(islSpeaking || islPaused || islProgress > 0) && (
            <div className="h-1.5 bg-purple-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 transition-all duration-500"
                style={{ width: `${islProgress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 px-6 pb-5">
        <Button
          size="sm"
          onClick={handleIslPlay}
          disabled={islSpeaking}
          className={cn(
            "h-9 px-4 rounded-xl font-bold text-xs gap-2",
            islSpeaking
              ? "bg-purple-700/50 text-purple-300 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-500 text-white"
          )}
        >
          <Play className="w-3.5 h-3.5" />
          {islPaused ? "Resume" : "Play"}
        </Button>

        <Button
          size="sm"
          onClick={handleIslPause}
          disabled={!islSpeaking}
          className={cn(
            "h-9 px-4 rounded-xl font-bold text-xs gap-2",
            !islSpeaking
              ? "bg-purple-900/50 text-purple-500 cursor-not-allowed"
              : "bg-amber-500 hover:bg-amber-400 text-white"
          )}
        >
          <Pause className="w-3.5 h-3.5" />
          Pause
        </Button>

        <Button
          size="sm"
          onClick={handleIslStop}
          disabled={!islSpeaking && !islPaused}
          className={cn(
            "h-9 px-4 rounded-xl font-bold text-xs gap-2",
            !islSpeaking && !islPaused
              ? "bg-purple-900/50 text-purple-500 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-400 text-white"
          )}
        >
          <Square className="w-3.5 h-3.5" />
          Stop
        </Button>

        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-purple-400 font-medium">
          <Volume2 className="w-3.5 h-3.5" />
          <span>en-IN · 0.82×</span>
        </div>
      </div>
    </div>
  );
}
