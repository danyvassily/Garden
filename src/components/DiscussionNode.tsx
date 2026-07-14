'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Trash2, PencilLine } from 'lucide-react'
import type { Post } from '@/lib/types'

const EMOJIS = ['❤️', '🔥', '✨', '😍', '🙏', '💯']

function ClientDate({ ts }: { ts: number }) {
  return (
    <time
      dateTime={new Date(ts).toISOString()}
      className="text-xs text-zinc-400 dark:text-zinc-500"
      suppressHydrationWarning
    >
      {new Date(ts).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}
    </time>
  )
}

interface DiscussionNodeProps {
  post: Post
  level?: number
  isLast?: boolean
  onReply?: (parentId: string, contenu: string, auteur: string) => void
  onReact?: (postId: string, emoji: string) => void
  onDelete?: (postId: string) => void
  onEdit?: (postId: string, newContenu: string) => void
}

export default function DiscussionNode({
  post,
  level = 0,
  isLast = false,
  onReply,
  onReact,
  onDelete,
  onEdit,
}: DiscussionNodeProps) {
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replyAuthor, setReplyAuthor] = useState('')
  const [showEdit, setShowEdit] = useState(false)
  const [editText, setEditText] = useState(post.contenu)

  const handleSubmitReply = () => {
    if (!replyText.trim()) return
    onReply?.(post.id, replyText.trim(), replyAuthor.trim() || 'Anonyme')
    setReplyText('')
    setReplyAuthor('')
    setShowReply(false)
  }

  const handleEdit = () => {
    if (!editText.trim() || editText.trim() === post.contenu) return
    onEdit?.(post.id, editText.trim())
    setShowEdit(false)
  }

  const maxLevel = 6
  const indent = Math.min(level, maxLevel)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* Indentation avec bordure */}
      <div
        className={`
          relative
          ${level > 0 ? 'ml-6 border-l-2 border-dashed border-zinc-200 dark:border-zinc-700 pl-5' : ''}
        `}
      >
        {/* Carte */}
        <div className="group relative rounded-xl border border-zinc-200/60 bg-white/70 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-300/80 dark:border-zinc-700/50 dark:bg-zinc-800/40 dark:hover:border-zinc-600">
          {/* En-tête */}
          <div className="mb-2 flex items-center gap-2.5">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
              style={{
                background: `linear-gradient(135deg, hsl(${level * 60 + 200}, 70%, 55%), hsl(${level * 60 + 220}, 65%, 45%))`,
              }}
            >
              {(post.auteur || 'A')[0].toUpperCase()}
            </span>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                {post.auteur || 'Anonyme'}
              </p>
            </div>
            <ClientDate ts={post.date} />

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              {onReply && (
                <button
                  onClick={() => setShowReply(!showReply)}
                  className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                  title="Répondre"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => {
                    setEditText(post.contenu)
                    setShowEdit(!showEdit)
                  }}
                  className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                  title="Modifier"
                >
                  <PencilLine className="h-3.5 w-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(post.id)}
                  className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  title="Supprimer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Contenu (éditable / normal) */}
          {showEdit ? (
            <div className="space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-red-500 dark:focus:ring-red-500/30"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600"
                >
                  Sauvegarder
                </button>
                <button
                  onClick={() => setShowEdit(false)}
                  className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {post.contenu}
            </p>
          )}

          {/* Réactions */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onReact?.(post.id, emoji)}
                className="inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-0.5 text-sm transition-all hover:border-zinc-200 hover:bg-zinc-50 dark:hover:border-zinc-600 dark:hover:bg-zinc-700/50"
              >
                {emoji}
                {post.reactions[emoji] > 0 && (
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {post.reactions[emoji]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Répondre textarea */}
        <AnimatePresence>
          {showReply && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-2 rounded-xl border border-zinc-200/60 bg-zinc-50/60 p-3 dark:border-zinc-700/50 dark:bg-zinc-800/30">
                <input
                  type="text"
                  placeholder="Votre nom (optionnel)"
                  value={replyAuthor}
                  onChange={(e) => setReplyAuthor(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm placeholder-zinc-400 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-red-500 dark:focus:ring-red-500/30"
                />
                <textarea
                  placeholder="Écrire une réponse…"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-sm placeholder-zinc-400 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-red-500 dark:focus:ring-red-500/30"
                  rows={2}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowReply(false)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSubmitReply}
                    disabled={!replyText.trim()}
                    className="rounded-lg bg-red-500 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Répondre
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Réponses récursives */}
        {post.reponses.length > 0 && (
          <div className="mt-4 space-y-4">
            {post.reponses.map((reply, i) => (
              <DiscussionNode
                key={reply.id}
                post={reply}
                level={level + 1}
                isLast={i === post.reponses.length - 1}
                onReply={onReply}
                onReact={onReact}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
