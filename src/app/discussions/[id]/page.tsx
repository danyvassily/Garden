'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Post } from '@/lib/types'
import DiscussionNode from '@/components/DiscussionNode'
import { ArrowLeft } from 'lucide-react'

/* --- Helpers --- */

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

async function addNestedReply(
  docId: string,
  parentId: string,
  contenu: string,
  auteur: string
) {
  const ref = doc(db, 'discussions', docId)
  const newReply = {
    id: crypto.randomUUID?.() ?? `${Date.now()}_${Math.random()}`,
    auteur,
    contenu,
    date: Date.now(),
    reactions: {},
    reponses: [],
  }

  function insertIntoTree(reponses: any[]): any[] {
    return reponses.map((r: any) => {
      if (r.id === parentId) {
        return { ...r, reponses: [...(r.reponses ?? []), newReply] }
      }
      if (r.reponses && r.reponses.length > 0) {
        return { ...r, reponses: insertIntoTree(r.reponses) }
      }
      return r
    })
  }

  const { getDoc } = await import('firebase/firestore')
  const snap = await getDoc(ref)
  if (!snap.exists()) return

  const data = snap.data()
  const currentReponses = data.reponses ?? []

  if (parentId === docId) {
    currentReponses.push(newReply)
    await updateDoc(ref, { reponses: currentReponses })
  } else {
    const updated = insertIntoTree(currentReponses)
    await updateDoc(ref, { reponses: updated })
  }
}

async function toggleNestedReaction(
  docId: string,
  postId: string,
  emoji: string
) {
  const ref = doc(db, 'discussions', docId)
  const { getDoc } = await import('firebase/firestore')
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const data = snap.data()

  function reactInTree(reponses: any[]): any[] {
    return reponses.map((r: any) => {
      if (r.id === postId) {
        const reactions = { ...(r.reactions ?? {}) }
        reactions[emoji] = (reactions[emoji] ?? 0) + 1
        return { ...r, reactions }
      }
      if (r.reponses && r.reponses.length > 0) {
        return { ...r, reponses: reactInTree(r.reponses) }
      }
      return r
    })
  }

  if (postId === docId) {
    const reactions = { ...(data.reactions ?? {}) }
    reactions[emoji] = (reactions[emoji] ?? 0) + 1
    await updateDoc(ref, { reactions })
  } else {
    const updated = reactInTree(data.reponses ?? [])
    await updateDoc(ref, { reponses: updated })
  }
}

async function deleteNestedPost(docId: string, postId: string) {
  const ref = doc(db, 'discussions', docId)
  const { getDoc } = await import('firebase/firestore')
  const snap = await getDoc(ref)
  if (!snap.exists()) return

  if (postId === docId) {
    await deleteDoc(ref)
    return
  }

  const data = snap.data()

  function removeFromTree(reponses: any[]): any[] {
    return reponses
      .filter((r: any) => r.id !== postId)
      .map((r: any) => ({
        ...r,
        reponses: r.reponses ? removeFromTree(r.reponses) : [],
      }))
  }

  const updated = removeFromTree(data.reponses ?? [])
  await updateDoc(ref, { reponses: updated })
}

async function editNestedPost(
  docId: string,
  postId: string,
  newContenu: string
) {
  const ref = doc(db, 'discussions', docId)
  const { getDoc } = await import('firebase/firestore')
  const snap = await getDoc(ref)
  if (!snap.exists()) return

  if (postId === docId) {
    await updateDoc(ref, { contenu: newContenu })
    return
  }

  const data = snap.data()

  function editInTree(reponses: any[]): any[] {
    return reponses.map((r: any) => {
      if (r.id === postId) return { ...r, contenu: newContenu }
      if (r.reponses && r.reponses.length > 0) {
        return { ...r, reponses: editInTree(r.reponses) }
      }
      return r
    })
  }

  const updated = editInTree(data.reponses ?? [])
  await updateDoc(ref, { reponses: updated })
}

/* ================================================================== */

interface ThreadPageProps {
  params: Promise<{ id: string }>
}

export default function ThreadPage({ params }: ThreadPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  /* --- Real-time listener --- */
  useEffect(() => {
    setLoading(true)
    setNotFound(false)

    const ref = doc(db, 'discussions', id)
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setNotFound(true)
          setLoading(false)
          return
        }
        setPost(fireDocToPost(snap))
        setLoading(false)
      },
      (err) => {
        console.error('Erreur onSnapshot:', err)
        setNotFound(true)
        setLoading(false)
      }
    )

    return unsub
  }, [id])

  /* --- Handlers --- */
  const handleReply = useCallback(
    async (parentId: string, contenu: string, auteur: string) => {
      await addNestedReply(id, parentId, contenu, auteur)
    },
    [id]
  )

  const handleReact = useCallback(
    async (postId: string, emoji: string) => {
      await toggleNestedReaction(id, postId, emoji)
    },
    [id]
  )

  const handleDelete = useCallback(
    async (postId: string) => {
      await deleteNestedPost(id, postId)
      if (postId === id) {
        router.push('/discussions')
      }
    },
    [id, router]
  )

  const handleEdit = useCallback(
    async (postId: string, newContenu: string) => {
      await editNestedPost(id, postId, newContenu)
    },
    [id]
  )

  /* ================================================================ */
  /* Loading */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-amber-50/50 to-white dark:from-zinc-900 dark:to-zinc-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-zinc-200 border-t-red-400 dark:border-zinc-700 dark:border-t-red-500" />
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Chargement de la discussion…
          </p>
        </div>
      </div>
    )
  }

  /* Not found */
  if (notFound || !post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-amber-50/50 to-white dark:from-zinc-900 dark:to-zinc-900">
        <span className="text-5xl">🍂</span>
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">
          Discussion introuvable
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Cette pensée s&apos;est peut-être envolée…
        </p>
        <button
          onClick={() => router.push('/discussions')}
          className="inline-flex items-center gap-2 rounded-full bg-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux discussions
        </button>
      </div>
    )
  }

  /* --- Render --- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* --- Lien retour --- */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={() => router.push('/discussions')}
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au jardin
          </button>
        </motion.div>

        {/* --- Post racine en hero --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-full bg-gradient-to-r from-red-100 to-rose-100 px-3 py-1 text-xs font-semibold text-red-600 dark:from-red-900/30 dark:to-rose-900/30 dark:text-red-400">
              🌱 Pensée originale
            </span>
            {post.reponses.length > 0 && (
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                {post.reponses.length} réponse{post.reponses.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="mb-8 rounded-2xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-zinc-700/50 dark:bg-zinc-800/50 sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-rose-500 text-lg font-bold text-white shadow-sm">
                {(post.auteur || 'A')[0].toUpperCase()}
              </span>
              <div>
                <p className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
                  {post.auteur || 'Anonyme'}
                </p>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {new Date(post.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <h1 className="mb-3 text-2xl font-bold leading-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
              {post.sujet}
            </h1>

            <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              {post.contenu}
            </p>
          </div>
        </motion.div>

        {/* --- Titre des réponses --- */}
        {post.reponses.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="mb-5 flex items-center gap-2"
          >
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Réponses
            </span>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
          </motion.div>
        )}

        {/* --- DiscussionNode récursif --- */}
        <div className="space-y-5">
          <DiscussionNode
            post={post}
            level={0}
            onReply={handleReply}
            onReact={handleReact}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </div>

        {/* --- Footer --- */}
        {post.reponses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              Aucune réponse pour l&apos;instant. Sois le premier à réagir !
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
