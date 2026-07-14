'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  getDoc as fireGetDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Post } from '@/lib/types'
import FilRougeTimeline from '@/components/FilRougeTimeline'
import {
  MessageSquarePlus,
  X,
  MessageCircle,
  Sparkles,
} from 'lucide-react'

/* ─── Helpers ─── */

function fireDocToPost(docSnap: any): Post {
  const d = docSnap.data()
  return {
    id: docSnap.id,
    sujet: d.sujet || '',
    auteur: d.auteur || 'Anonyme',
    contenu: d.contenu || '',
    date: d.date?.toMillis?.() ?? d.date ?? Date.now(),
    reactions: d.reactions ?? {},
    reponses: (d.reponses ?? []).map((r: any) => ({
      ...r,
      date: r.date?.toMillis?.() ?? r.date ?? Date.now(),
      reactions: r.reactions ?? {},
      reponses: r.reponses ?? [],
    })),
  }
}

async function addReply(
  docId: string,
  contenu: string,
  auteur: string
) {
  const ref = doc(db, 'discussions', docId)
  const snap = await fireGetDoc(ref)
  if (!snap.exists()) return
  const data = snap.data() as Record<string, unknown>
  const existing = (data.reponses as any[]) ?? []
  existing.push({
    id: crypto.randomUUID?.() ?? `${Date.now()}_${Math.random()}`,
    auteur,
    contenu,
    date: serverTimestamp(),
    reactions: {},
    reponses: [],
  })
  await updateDoc(ref, { reponses: existing })
}

async function toggleReaction(docId: string, emoji: string) {
  const ref = doc(db, 'discussions', docId)
  const snap = await fireGetDoc(ref)
  if (!snap.exists()) return
  const data = snap.data() as Record<string, unknown>
  const reactions = { ...((data.reactions as Record<string, number>) ?? {}) }
  reactions[emoji] = (reactions[emoji] ?? 0) + 1
  await updateDoc(ref, { reactions })
}

async function deletePostFn(docId: string) {
  await deleteDoc(doc(db, 'discussions', docId))
}

async function editPostFn(docId: string, newContenu: string) {
  await updateDoc(doc(db, 'discussions', docId), { contenu: newContenu })
}

/* ================================================================== */

export default function DiscussionsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [showEditor, setShowEditor] = useState(false)
  const [sujet, setSujet] = useState('')
  const [contenu, setContenu] = useState('')
  const [auteur, setAuteur] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Modal state
  const [modalPost, setModalPost] = useState<Post | null>(null)
  const [modalReply, setModalReply] = useState('')
  const [modalAuthor, setModalAuthor] = useState('')

  /* ─── Firestore real-time listener ─── */
  useEffect(() => {
    const q = query(
      collection(db, 'discussions'),
      orderBy('date', 'desc')
    )
    const unsub = onSnapshot(q, (snapshot) => {
      const list: Post[] = []
      snapshot.forEach((d) => list.push(fireDocToPost(d)))
      setPosts(list)
    })
    return unsub
  }, [])

  /* ─── Ajouter un post ─── */
  const handleSubmit = useCallback(async () => {
    if (!sujet.trim() || !contenu.trim() || submitting) return
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'discussions'), {
        sujet: sujet.trim(),
        contenu: contenu.trim(),
        auteur: auteur.trim() || 'Anonyme',
        date: serverTimestamp(),
        reactions: {},
        reponses: [],
      })
      setSujet('')
      setContenu('')
      setAuteur('')
      setShowEditor(false)
    } catch (e) {
      console.error('Erreur addPost:', e)
    } finally {
      setSubmitting(false)
    }
  }, [sujet, contenu, auteur, submitting])

  /* ─── Répondre (depuis modal) ─── */
  const handleModalReply = useCallback(async () => {
    if (!modalPost || !modalReply.trim()) return
    await addReply(
      modalPost.id,
      modalReply.trim(),
      modalAuthor.trim() || 'Anonyme'
    )
    setModalReply('')
    setModalAuthor('')
  }, [modalPost, modalReply, modalAuthor])

  /* ─── Réagir ─── */
  const handleModalReact = useCallback(
    async (emoji: string) => {
      if (!modalPost) return
      await toggleReaction(modalPost.id, emoji)
      setModalPost((prev) =>
        prev
          ? {
              ...prev,
              reactions: {
                ...prev.reactions,
                [emoji]: (prev.reactions[emoji] ?? 0) + 1,
              },
            }
          : prev
      )
    },
    [modalPost]
  )

  /* ─── Supprimer ─── */
  const handleDelete = useCallback(async (postId: string) => {
    await deletePostFn(postId)
    setModalPost(null)
  }, [])

  /* ================================================================ */
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* ─── Header ─── */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="mb-4 inline-block text-5xl">🌿</span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
              Le Jardin des Discussions
            </h1>
            <p className="mt-2 max-w-lg mx-auto text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
              Un espace pour semer des pensées, cultiver des idées et voir
              pousser les conversations.
            </p>
          </motion.div>
        </div>

        {/* ─── Bouton Semer une pensée ─── */}
        <motion.div
          className="mb-12 flex justify-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <button
            onClick={() => setShowEditor(!showEditor)}
            className={`
              group inline-flex items-center gap-2.5 rounded-full px-6 py-3
              text-sm font-semibold shadow-lg transition-all duration-300
              ${
                showEditor
                  ? 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200'
                  : 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5'
              }
            `}
          >
            {showEditor ? (
              <>
                <X className="h-4 w-4" /> Fermer
              </>
            ) : (
              <>
                <MessageSquarePlus className="h-4 w-4" /> Semer une pensée
              </>
            )}
          </button>
        </motion.div>

        {/* ─── Éditeur ─── */}
        <AnimatePresence>
          {showEditor && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: 48 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-zinc-700/50 dark:bg-zinc-800/50">
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Le sujet de ta pensée…"
                    value={sujet}
                    onChange={(e) => setSujet(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base font-medium placeholder-zinc-400 focus:border-red-300 focus:outline-none focus:ring-3 focus:ring-red-200/50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-red-500 dark:focus:ring-red-500/30"
                  />
                  <textarea
                    placeholder="Développe ta pensée…"
                    value={contenu}
                    onChange={(e) => setContenu(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-relaxed placeholder-zinc-400 focus:border-red-300 focus:outline-none focus:ring-3 focus:ring-red-200/50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-red-500 dark:focus:ring-red-500/30"
                    rows={4}
                  />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <input
                      type="text"
                      placeholder="Ton nom (optionnel)"
                      value={auteur}
                      onChange={(e) => setAuteur(e.target.value)}
                      className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-red-300 focus:outline-none focus:ring-3 focus:ring-red-200/50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-red-500 dark:focus:ring-red-500/30 sm:w-64"
                    />
                    <button
                      onClick={handleSubmit}
                      disabled={!sujet.trim() || !contenu.trim() || submitting}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                    >
                      {submitting ? (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      {submitting ? 'Semis…' : 'Planter 🌱'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Timeline ─── */}
        <FilRougeTimeline
          posts={posts}
          onPostClick={(p) => setModalPost(p)}
        />

        {/* ─── Footer ─── */}
        <div className="mt-16 text-center text-xs text-zinc-400 dark:text-zinc-600">
          {posts.length > 0 && (
            <p>
              {posts.length} pensée{posts.length > 1 ? 's' : ''} semée
              {posts.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL Bottom Sheet */}
      {/* ============================================================ */}
      <AnimatePresence>
        {modalPost && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setModalPost(null)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 300,
                mass: 0.8,
              }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl dark:bg-zinc-800"
            >
              {/* Handle bar */}
              <div className="sticky top-0 z-10 flex justify-center bg-white pt-3 pb-2 dark:bg-zinc-800">
                <div className="h-1.5 w-12 rounded-full bg-zinc-300 dark:bg-zinc-600" />
              </div>

              <div className="px-5 pb-8 sm:px-6">
                {/* En-tête du post */}
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-rose-500 text-sm font-bold text-white shadow-sm">
                    {(modalPost.auteur || 'A')[0].toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                      {modalPost.auteur || 'Anonyme'}
                    </p>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {new Date(modalPost.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(modalPost.id)}
                    className="ml-auto rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    title="Supprimer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Sujet */}
                <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {modalPost.sujet}
                </h2>

                {/* Contenu */}
                <p className="mb-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {modalPost.contenu}
                </p>

                {/* Réactions */}
                <div className="mb-5 flex flex-wrap gap-2">
                  {['❤️', '🔥', '✨', '😍', '🙏', '💯'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleModalReact(emoji)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/70 px-3 py-1.5 text-sm transition-all hover:border-red-300 hover:bg-red-50 active:scale-95 dark:border-zinc-600 dark:hover:border-red-500/50 dark:hover:bg-red-900/20"
                    >
                      {emoji}
                      {modalPost.reactions[emoji] > 0 && (
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          {modalPost.reactions[emoji]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Lien discussion complète */}
                <a
                  href={`/discussions/${modalPost.id}`}
                  className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-red-500 transition-colors hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                >
                  <MessageCircle className="h-4 w-4" />
                  Voir la discussion complète
                </a>

                {/* Réponses existantes dans la modal */}
                {modalPost.reponses.length > 0 && (
                  <div className="mb-5 space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      Réponses ({modalPost.reponses.length})
                    </h3>
                    {modalPost.reponses.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 dark:border-zinc-700/50 dark:bg-zinc-800/30"
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-red-300 to-rose-400 text-[10px] font-bold text-white">
                            {(r.auteur || 'A')[0].toUpperCase()}
                          </span>
                          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            {r.auteur || 'Anonyme'}
                          </p>
                          <span className="text-[10px] text-zinc-400">
                            {new Date(r.date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          {r.contenu}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Répondre depuis la modal */}
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Ton nom (optionnel)"
                    value={modalAuthor}
                    onChange={(e) => setModalAuthor(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-red-300 focus:outline-none focus:ring-3 focus:ring-red-200/50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-red-500 dark:focus:ring-red-500/30"
                  />
                  <div className="flex gap-2">
                    <textarea
                      placeholder="Écrire une réponse…"
                      value={modalReply}
                      onChange={(e) => setModalReply(e.target.value)}
                      className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm placeholder-zinc-400 focus:border-red-300 focus:outline-none focus:ring-3 focus:ring-red-200/50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-red-500 dark:focus:ring-red-500/30"
                      rows={2}
                    />
                    <button
                      onClick={handleModalReply}
                      disabled={!modalReply.trim()}
                      className="self-end rounded-xl bg-gradient-to-r from-red-500 to-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                    >
                      Répondre
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
