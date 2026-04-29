"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Trash2, Play, Pause, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VoiceRecorder({ onAudioReady }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        onAudioReady(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Permission denied or microphone error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const deleteRecording = () => {
    setAudioUrl(null);
    setAudioBlob(null);
    setDuration(0);
    onAudioReady(null);
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {!audioUrl ? (
          <motion.button
            key="record"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-xl transition-all ${isRecording ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-[hsl(var(--text-secondary))] hover:text-[var(--accent-color)] hover:bg-black/5'}`}
          >
            {isRecording ? (
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }} className="bg-white w-2 h-2 rounded-full" />
            ) : (
              <Mic size={14} />
            )}
            <span>
              {isRecording ? `Recording... ${formatTime(duration)}` : "Note Vocale"}
            </span>
          </motion.button>
        ) : (
          <motion.div 
            key="preview"
            initial={{ opacity: 0, scale: 0.9, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            className="flex items-center gap-4 p-3 bg-white/50 backdrop-blur-md border border-black/5 rounded-2xl max-w-sm shadow-sm"
          >
            <button 
              type="button"
              onClick={togglePlayback}
              className="w-10 h-10 rounded-xl bg-[var(--accent-color)] flex items-center justify-center text-white shadow-lg shadow-[var(--accent-glow)] flex-shrink-0"
            >
              {isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" className="ml-1" />}
            </button>
            
            <div className="flex-1 overflow-hidden min-w-[120px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-color)]">Voice Note</span>
                <span className="text-[9px] font-black opacity-40">{formatTime(duration)}</span>
              </div>
              <div className="h-1 bg-black/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[var(--accent-color)]"
                  initial={{ width: 0 }}
                  animate={{ width: isPlaying ? "100%" : "0%" }}
                  transition={{ duration: isPlaying ? duration : 0.3, ease: "linear" }}
                />
              </div>
            </div>

            <button type="button" onClick={deleteRecording} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
              <Trash2 size={14} />
            </button>

            <audio 
              ref={audioRef} 
              src={audioUrl} 
              onEnded={() => setIsPlaying(false)} 
              className="hidden" 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
