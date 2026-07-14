"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import {
  Calendar,
  Plus,
  X,
  Upload,
  ImageIcon,
  ChevronDown,
  Heart,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { addTimelineEntry, firestoreDateToTime } from "@/lib/firestore";
import { uploadFileWithProgress } from "@/lib/storage";
import {
  type TimelineEntry,
  type TimelineCategory,
  CATEGORIES,
  getCategory,
} from "@/types";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function TimelinePage() {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "timeline"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: TimelineEntry[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title ?? "",
          description: data.description ?? "",
          category: (data.category as TimelineCategory) ?? "Moment",
          imageUrl: data.imageUrl ?? undefined,
          authorName: data.authorName ?? "Nous",
          authorAvatar: data.authorAvatar ?? undefined,
          createdAt: firestoreDateToTime(data.createdAt as Timestamp),
          date: data.date ?? new Date().toISOString().slice(0, 10),
        };
      });
      setEntries(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1a1a2e] to-[#0d0d1a]">
      <header className="sticky top-0 z-30 glass-dark px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-garden-green/30 text-garden-green-light ring-1 ring-garden-green/40">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-white">Notre Histoire</h1>
              <p className="text-xs text-garden-silver/60">
                {entries.length} souvenir{entries.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-full bg-garden-green px-4 py-2 text-sm font-medium text-white transition-all hover:bg-garden-green-light hover:shadow-lg hover:shadow-garden-green/30 active:scale-95"
          >
            <Plus className="h-4 w-4" /> Ajouter
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-garden-green border-t-transparent" />
          </div>
        ) : entries.length === 0 ? (
          <EmptyState onAdd={() => setShowModal(true)} />
        ) : (
          <TimelineList entries={entries} />
        )}
      </main>

      <AnimatePresence>
        {showModal && <AddEntryModal onClose={() => setShowModal(false)} onAdded={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-32 text-center">
      <Heart className="mb-4 h-16 w-16 text-garden-green-light/40" />
      <h2 className="mb-2 font-serif text-2xl font-semibold text-white/70">Aucun souvenir pour l&apos;instant</h2>
      <p className="mb-8 max-w-xs text-sm text-garden-silver/50">Commencez à remplir votre histoire en ajoutant votre premier moment.</p>
      <button onClick={onAdd} className="flex items-center gap-2 rounded-full bg-garden-green px-6 py-3 text-sm font-medium text-white transition-all hover:bg-garden-green-light hover:shadow-lg hover:shadow-garden-green/30">
        <Plus className="h-4 w-4" /> Ajouter un souvenir
      </button>
    </motion.div>
  );
}

function TimelineList({ entries }: { entries: TimelineEntry[] }) {
  const sorted = [...entries].reverse();
  return (
    <div className="relative">
      <div className="absolute left-1/2 top-0 h-full w-[3px] -translate-x-1/2 rounded-full opacity-60"
        style={{ background: "linear-gradient(to bottom, #f59e0b, #10b981, #8b5cf6, #06b6d4, #e94560, #f59e0b)" }}
      />
      {sorted.map((entry, idx) => <TimelineCard key={entry.id} entry={entry} index={idx} />)}
    </div>
  );
}

function TimelineCard({ entry, index }: { entry: TimelineEntry; index: number }) {
  const isLeft = index % 2 === 0;
  const cat = getCategory(entry.category);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className={`relative mb-12 flex w-full items-start ${isLeft ? "flex-row" : "flex-row-reverse"}`}
    >
      <div className={`w-[calc(50%-2rem)] ${isLeft ? "pr-8 text-right" : "pl-8 text-left"}`}>
        <div className="card group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
          style={{ borderColor: `${cat.color}33`, background: `linear-gradient(145deg, ${cat.color}08 0%, rgba(26,26,46,0.6) 100%)` }}
        >
          {entry.imageUrl && (
            <div className={`mb-3 overflow-hidden rounded-lg ${isLeft ? "ml-auto" : "mr-auto"} aspect-video w-full max-w-xs`}>
              <img src={entry.imageUrl} alt={entry.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
            </div>
          )}
          <div className={`mb-2 flex items-center gap-1.5 text-xs font-medium ${isLeft ? "justify-end" : "justify-start"}`}>
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ backgroundColor: `${cat.color}22`, color: cat.color }}
            >{cat.emoji} {cat.label}</span>
          </div>
          <h3 className={`font-serif text-lg font-bold text-white ${isLeft ? "text-right" : "text-left"}`}>{entry.title}</h3>
          <p className={`mt-1 line-clamp-3 text-sm leading-relaxed text-garden-silver/70 ${isLeft ? "text-right" : "text-left"}`}>{entry.description}</p>
          <div className={`mt-3 flex items-center gap-2 ${isLeft ? "justify-end" : "justify-start"}`}>
            <div className="flex items-center gap-2 text-xs text-garden-silver/50">
              {entry.authorAvatar ? (
                <img src={entry.authorAvatar} alt="" className="h-5 w-5 rounded-full object-cover ring-1 ring-white/10" />
              ) : (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-garden-green/30 text-[10px] text-garden-green-light">
                  {entry.authorName.charAt(0).toUpperCase()}
                </div>
              )}
              <span>{entry.authorName}</span><span>·</span><span>{formatDate(entry.date)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute left-1/2 top-6 z-10 -translate-x-1/2">
        <div className="flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-[#0d0d1a]" style={{ backgroundColor: cat.color }}>
          <div className="h-1.5 w-1.5 rounded-full bg-white/80" />
        </div>
      </div>
      <div className="w-[calc(50%-2rem)]" />
    </motion.div>
  );
}

function AddEntryModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TimelineCategory>("Moment");
  const [authorName, setAuthorName] = useState("Nous");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPicker, setShowPicker] = useState(false);

  const handleFile = useCallback((f: File | null) => {
    setFile(f);
    if (f) { setPreview(URL.createObjectURL(f)); } else { setPreview(null); }
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setUploading(true);
    try {
      let imageUrl: string | undefined;
      if (file) imageUrl = await uploadFileWithProgress(file, "timeline", setProgress);
      await addTimelineEntry({ title: title.trim(), description: description.trim(), category, imageUrl: imageUrl ?? null, authorName: authorName || "Nous", date });
      onAdded();
    } catch (err) { console.error("Failed to add entry:", err); }
    finally { setUploading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="w-full max-w-lg rounded-t-2xl bg-[#1a1a2e] px-6 pb-8 pt-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/20" />
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-white">Nouveau souvenir</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-garden-silver/60 transition-colors hover:bg-white/20"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-garden-silver/50">Photo (optionnelle)</label>
            <label className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/5 py-6 transition-colors hover:border-garden-green/40 hover:bg-garden-green/5">
              {preview ? <img src={preview} alt="preview" className="max-h-48 rounded-lg object-contain" />
              : <div className="flex flex-col items-center gap-2 text-garden-silver/40"><ImageIcon className="h-8 w-8" /><span className="text-xs">Touchez pour choisir une image</span></div>}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
              {preview && <button type="button" className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white/70 hover:bg-black/80" onClick={(e) => { e.preventDefault(); handleFile(null); }}><X className="h-3 w-3" /></button>}
            </label>
            {uploading && <div className="mt-2">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-garden-green transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1 text-right text-[10px] text-garden-silver/40">{progress}%</p>
            </div>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-garden-silver/50">Titre *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Un titre pour ce souvenir…"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-garden-silver/40 outline-none transition-colors focus:border-garden-green/50 focus:bg-garden-green/5" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-garden-silver/50">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Racontez ce moment…" rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-garden-silver/40 outline-none transition-colors focus:border-garden-green/50 focus:bg-garden-green/5" />
          </div>
          <div className="relative">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-garden-silver/50">Catégorie</label>
            <button type="button" onClick={() => setShowPicker(!showPicker)}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white transition-colors hover:border-white/20">
              <span className="flex items-center gap-2"><span>{getCategory(category).emoji}</span><span>{getCategory(category).label}</span></span>
              <ChevronDown className={`h-4 w-4 text-garden-silver/40 transition-transform ${showPicker ? "rotate-180" : ""}`} />
            </button>
            {showPicker && <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-white/10 bg-[#1e1e3a] shadow-xl">
              {CATEGORIES.map((cat) => (
                <button key={cat.key} type="button" onClick={() => { setCategory(cat.key); setShowPicker(false); }}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5 ${category === cat.key ? "text-white" : "text-garden-silver/60"}`}>
                  <span className="flex h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span>{cat.emoji} {cat.label}</span>
                </button>
              ))}
            </div>}
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-garden-silver/50">Auteur</label>
              <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Votre nom"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-garden-silver/40 outline-none transition-colors focus:border-garden-green/50 focus:bg-garden-green/5" />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-garden-silver/50">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-garden-green/50 focus:bg-garden-green/5" />
            </div>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={!title.trim() || uploading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-garden-green py-3 text-sm font-semibold text-white transition-all hover:bg-garden-green-light disabled:cursor-not-allowed disabled:opacity-40">
          {uploading ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Upload en cours…</>
          : <><Upload className="h-4 w-4" /> Publier</>}
        </button>
      </motion.div>
    </motion.div>
  );
}
