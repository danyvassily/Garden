"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import {
  Heart, Plus, X, Upload, ImageIcon, MessageCircle, Calendar, User, Grid, Maximize2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { addGalleryPhoto, deleteGalleryPhoto, firestoreDateToTime } from "@/lib/firestore";
import { uploadFileWithProgress } from "@/lib/storage";
import type { GalleryPhoto, AuthorName } from "@/types";

export default function GalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAuthor, setFilterAuthor] = useState<AuthorName>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const filtered = filterAuthor ? photos.filter((p) => p.authorName === filterAuthor) : photos;

  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list: GalleryPhoto[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          imageUrl: data.imageUrl ?? "",
          caption: data.caption ?? undefined,
          authorName: (data.authorName as AuthorName) ?? "Nous",
          authorAvatar: data.authorAvatar ?? undefined,
          createdAt: firestoreDateToTime(data.createdAt as Timestamp),
        };
      });
      setPhotos(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  const openLightbox = useCallback((photo: GalleryPhoto) => {
    const idx = filtered.findIndex((p) => p.id === photo.id);
    setLightboxPhoto(photo);
    setLightboxIdx(idx);
  }, [filtered]);

  const navigateLightbox = useCallback((dir: 1 | -1) => {
    const next = lightboxIdx + dir;
    if (next < 0 || next >= filtered.length) return;
    setLightboxPhoto(filtered[next]);
    setLightboxIdx(next);
  }, [lightboxIdx, filtered]);

  useEffect(() => {
    if (!lightboxPhoto) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxPhoto(null);
      if (e.key === "ArrowLeft") navigateLightbox(-1);
      if (e.key === "ArrowRight") navigateLightbox(1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxPhoto, navigateLightbox]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-green-50">
      <header className="sticky top-0 z-30 border-b border-green-100/60 bg-white/80 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-500 ring-1 ring-rose-200"><Heart className="h-5 w-5" fill="currentColor" /></div>
            <div><h1 className="font-serif text-xl font-bold text-green-900">Notre Album</h1><p className="text-xs text-green-600/60">{photos.length} photo{photos.length !== 1 ? "s" : ""}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-green-200 bg-white p-0.5 text-xs">
              <button onClick={() => setFilterAuthor(null)} className={`rounded-md px-3 py-1.5 font-medium transition-colors ${filterAuthor === null ? "bg-green-600 text-white shadow-sm" : "text-green-700 hover:bg-green-50"}`}><Grid className="mr-1 inline h-3 w-3" />Tous</button>
              <button onClick={() => setFilterAuthor("Nous")} className={`rounded-md px-3 py-1.5 font-medium transition-colors ${filterAuthor === "Nous" ? "bg-green-600 text-white shadow-sm" : "text-green-700 hover:bg-green-50"}`}><User className="mr-1 inline h-3 w-3" />Nous</button>
              <button onClick={() => setFilterAuthor("Toi")} className={`rounded-md px-3 py-1.5 font-medium transition-colors ${filterAuthor === "Toi" ? "bg-green-600 text-white shadow-sm" : "text-green-700 hover:bg-green-50"}`}><User className="mr-1 inline h-3 w-3" />Toi</button>
            </div>
            <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/20 active:scale-95"><Plus className="h-4 w-4" />Ajouter</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-32"><div className="h-8 w-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState hasFilter={filterAuthor !== null} onAdd={() => setShowUploadModal(true)} />
        ) : (<><p className="mb-4 text-xs text-green-600/50">{filtered.length} photo{filtered.length !== 1 ? "s" : ""}</p><MasonryGrid photos={filtered} onPhotoClick={openLightbox} /></>)}
      </main>
      <AnimatePresence>{showUploadModal && <UploadModal onClose={() => setShowUploadModal(false)} onUploaded={() => setShowUploadModal(false)} />}</AnimatePresence>
      <AnimatePresence>{lightboxPhoto && <Lightbox photo={lightboxPhoto} hasPrev={lightboxIdx > 0} hasNext={lightboxIdx < filtered.length - 1} onPrev={() => navigateLightbox(-1)} onNext={() => navigateLightbox(1)} onClose={() => setLightboxPhoto(null)} onDelete={async (id) => { await deleteGalleryPhoto(id); setLightboxPhoto(null); }} />}</AnimatePresence>
    </div>
  );
}

function EmptyState({ hasFilter, onAdd }: { hasFilter: boolean; onAdd: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-32 text-center">
      <ImageIcon className="mb-4 h-16 w-16 text-green-300" />
      <h2 className="mb-2 font-serif text-2xl font-semibold text-green-800/70">{hasFilter ? "Aucune photo de cet auteur" : "Album vide"}</h2>
      <p className="mb-8 max-w-xs text-sm text-green-600/50">{hasFilter ? "Essayez un autre filtre." : "Commencez à remplir votre album en ajoutant votre première photo."}</p>
      {!hasFilter && <button onClick={onAdd} className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/20"><Plus className="h-4 w-4" />Ajouter une photo</button>}
    </motion.div>
  );
}

function MasonryGrid({ photos, onPhotoClick }: { photos: GalleryPhoto[]; onPhotoClick: (photo: GalleryPhoto) => void }) {
  return (
    <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
      {photos.map((photo, idx) => (
        <motion.div key={photo.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03, duration: 0.35 }}
          className="group relative mb-3 cursor-pointer break-inside-avoid overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md"
          onClick={() => onPhotoClick(photo)}>
          <img src={photo.imageUrl} alt={photo.caption ?? ""} className="w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {photo.caption && <p className="line-clamp-2 text-sm font-medium text-white drop-shadow-sm">{photo.caption}</p>}
            <div className="mt-1 flex items-center gap-2 text-xs text-white/70"><User className="h-3 w-3" /><span>{photo.authorName}</span><span>·</span><Maximize2 className="h-3 w-3" /></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function UploadModal({ onClose, onUploaded }: { onClose: () => void; onUploaded: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [authorName, setAuthorName] = useState<AuthorName>("Nous");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = useCallback((f: File | null) => { setFile(f); if (f) { setPreview(URL.createObjectURL(f)); } else { setPreview(null); } }, []);

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const imageUrl = await uploadFileWithProgress(file, "gallery", setProgress);
      await addGalleryPhoto({ imageUrl, caption: caption.trim() || null, authorName: authorName ?? "Nous" });
      onUploaded();
    } catch (err) { console.error("Upload failed:", err); }
    finally { setUploading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }} className="w-full max-w-lg rounded-t-2xl bg-white px-6 pb-8 pt-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-green-200" />
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-green-900">Ajouter une photo</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600/60 transition-colors hover:bg-green-200"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-green-500/70">Photo *</label>
            <label className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-green-200 bg-green-50/50 py-8 transition-colors hover:border-green-400 hover:bg-green-100/30">
              {preview ? <img src={preview} alt="preview" className="max-h-48 rounded-lg object-contain" />
              : <div className="flex flex-col items-center gap-2 text-green-400"><ImageIcon className="h-10 w-10" /><span className="text-xs font-medium text-green-500">Touchez pour choisir une image</span></div>}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
              {preview && <button type="button" className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white/70 hover:bg-black/70" onClick={(e) => { e.preventDefault(); handleFile(null); }}><X className="h-3 w-3" /></button>}
            </label>
            {uploading && <div className="mt-2"><div className="h-1.5 overflow-hidden rounded-full bg-green-100"><div className="h-full rounded-full bg-green-600 transition-all duration-300" style={{ width: `${progress}%` }} /></div><p className="mt-1 text-right text-[10px] text-green-500/50">{progress}%</p></div>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-green-500/70">Légende</label>
            <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Un petit mot…"
              className="w-full rounded-xl border border-green-200 bg-green-50/50 px-4 py-2.5 text-sm text-green-900 placeholder-green-400 outline-none transition-colors focus:border-green-500 focus:bg-green-100/30" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-green-500/70">Auteur</label>
            <div className="flex gap-2">
              {(["Nous", "Toi"] as const).map((name) => (
                <button key={name} type="button" onClick={() => setAuthorName(name)}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${authorName === name ? "border-green-500 bg-green-600 text-white shadow-sm" : "border-green-200 bg-green-50/50 text-green-700 hover:bg-green-100/30"}`}>{name}</button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={!file || uploading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white transition-all hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40">
          {uploading ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Upload en cours…</> : <><Upload className="h-4 w-4" /> Publier</>}
        </button>
      </motion.div>
    </motion.div>
  );
}

function Lightbox({ photo, hasPrev, hasNext, onPrev, onNext, onClose, onDelete }: {
  photo: GalleryPhoto; hasPrev: boolean; hasNext: boolean; onPrev: () => void; onNext: () => void; onClose: () => void; onDelete: (id: string) => void;
}) {
  const dateStr = new Date(photo.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <button onClick={onClose} className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white/70 transition-colors hover:bg-black/70 hover:text-white"><X className="h-5 w-5" /></button>
      {hasPrev && <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white/70 transition-colors hover:bg-black/60 hover:text-white"><ChevronLeft className="h-6 w-6" /></button>}
      {hasNext && <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white/70 transition-colors hover:bg-black/60 hover:text-white"><ChevronRight className="h-6 w-6" /></button>}
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 24, stiffness: 260 }}
        className="flex max-h-[90vh] max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative flex items-center justify-center bg-black"><img src={photo.imageUrl} alt={photo.caption ?? ""} className="max-h-[65vh] w-full object-contain" /></div>
        <div className="flex items-center gap-4 px-5 py-4">
          <div className="flex-1">
            {photo.caption && <p className="font-serif text-base font-semibold text-green-900">{photo.caption}</p>}
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-green-600/60">
              <span className="flex items-center gap-1"><User className="h-3 w-3" />{photo.authorName}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{dateStr}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href={`/timeline?ref=${photo.id}`} className="flex items-center gap-1.5 rounded-lg border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-50"><MessageCircle className="h-3.5 w-3.5" />Discussion</a>
            <button onClick={() => onDelete(photo.id)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50">Supprimer</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
