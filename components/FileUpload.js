"use client";

import { useState, useRef } from "react";
import { Paperclip, X, Image as ImageIcon, FileText } from "lucide-react";
import { uploadFile } from "@/lib/storage";

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

  // Expose upload method to parent
  if (onFileSelect) {
    onFileSelect.upload = handleUpload;
  }

  return (
    <div className="mt-2">
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      
      {!file ? (
        <label 
          htmlFor="file-upload" 
          className="btn-icon inline-flex text-sm border border-transparent hover:border-[#222222] cursor-pointer"
        >
          <Paperclip size={16} />
          Joindre un fichier
        </label>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-[#111111] border border-[#222222] rounded-lg max-w-sm">
          {file.type.startsWith("image/") ? (
            <ImageIcon size={24} className="text-blue-400" />
          ) : (
            <FileText size={24} className="text-red-400" />
          )}
          
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-secondary">
              {(file.size / 1024 / 1024).toFixed(2)} MB
              {uploading && " - Envoi en cours..."}
            </p>
          </div>
          
          {!uploading && (
            <button 
              onClick={handleClear}
              className="btn-icon"
              title="Retirer"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
