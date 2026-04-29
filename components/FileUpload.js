"use client";

import { useState, useRef } from "react";
import { Paperclip, X, Image as ImageIcon, FileText, Sparkles } from "lucide-react";
import { uploadFile } from "@/lib/storage";
import { motion, AnimatePresence } from "framer-motion";

export default function FileUpload({ onFileSelect, onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (onFileSelect) onFileSelect(selectedFile);
    }
  };

  const handleClear = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onFileSelect) onFileSelect(null);
  };

  const handleUpload = async () => {
    if (!file) return null;
    
    setUploading(true);
    try {
      const result = await uploadFile(file);
      if (onUploadComplete) onUploadComplete(result);
      return result;
    } catch (error) {
      console.error("Erreur d'upload", error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.label 
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            htmlFor="file-upload" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--text-secondary))] hover:text-[var(--accent-color)] cursor-pointer py-2 px-4 rounded-xl hover:bg-black/5 transition-all"
          >
            <Paperclip size={14} />
            Joindre un média
          </motion.label>
        ) : (
          <motion.div 
            key="preview"
            initial={{ opacity: 0, scale: 0.9, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            className="flex items-center gap-4 p-3 bg-white/50 backdrop-blur-md border border-black/5 rounded-2xl max-w-sm shadow-sm"
          >
            <div className="p-2 rounded-xl bg-[var(--accent-color)]/10 text-[var(--accent-color)]">
              {file.type.startsWith("image/") ? (
                <ImageIcon size={20} />
              ) : (
                <FileText size={20} />
              )}
            </div>
            
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] font-bold truncate leading-tight mb-1">{file.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
                {uploading && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-color)] animate-pulse">
                    Chargement...
                  </span>
                )}
              </div>
            </div>
            
            {!uploading && (
              <button 
                onClick={handleClear}
                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                title="Retirer"
              >
                <X size={14} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
