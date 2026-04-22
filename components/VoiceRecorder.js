"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Trash2, Play, Pause, Check } from "lucide-react";
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
      alert("Microphone access denied.");
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
    <div className="flex flex-col gap-2">
      {!audioUrl ? (
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 hover:bg-white/10 text-secondary'}`}
        >
          {isRecording ? <Square size={16} fill="white" /> : <Mic size={16} />}
          <span className="text-xs font-bold">
            {isRecording ? `Recording... ${formatTime(duration)}` : "Hold to Record / Voice Note"}
          </span>
        </button>
      ) : (
        <div className="flex items-center gap-3 p-2 bg-white/5 border border-white/10 rounded-full pr-4">
          <button 
            type="button"
            onClick={togglePlayback}
            className="w-10 h-10 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white shadow-lg"
          >
            {isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" className="ml-1" />}
          </button>
          
          <div className="flex-1">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-[var(--accent-color)]"
                initial={{ width: 0 }}
                animate={{ width: isPlaying ? "100%" : "0%" }}
                transition={{ duration: duration, ease: "linear" }}
              />
            </div>
            <p className="text-[10px] text-secondary mt-1 font-bold">Voice Note — {formatTime(duration)}</p>
          </div>

          <button type="button" onClick={deleteRecording} className="text-secondary hover:text-red-500 p-1">
            <Trash2 size={16} />
          </button>

          <audio 
            ref={audioRef} 
            src={audioUrl} 
            onEnded={() => setIsPlaying(false)} 
            className="hidden" 
          />
        </div>
      )}
    </div>
  );
}
