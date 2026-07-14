'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import type { Post } from '@/lib/types'

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
      })}
    </time>
  )
}

interface TimelineCardProps {
  post: Post
  index: number
  onPostClick?: (post: Post) => void
}

function TimelineCard({ post, index, onPostClick }: TimelineCardProps) {
  const isLeft = index % 2 === 0
  const cardRef = useRef<HTMLDivElement>(null)

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`
        group relative flex w-full
        ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}
        flex-row items-start gap-4 md:gap-8
      `}
    >
      {/* Carte */}
      <div
        onClick={() => onPostClick?.(post)}
        className={`
          w-full md:w-[calc(50%-2rem)] cursor-pointer
          rounded-2xl border border-zinc-200/70 dark:border-zinc-700/50
          bg-white/80 dark:bg-zinc-800/60 backdrop-blur-sm
          p-5 transition-all duration-300
          hover:shadow-lg hover:shadow-red-500/5 dark:hover:shadow-red-500/10
          hover:border-red-300/50 dark:hover:border-red-500/40
          hover:-translate-y-0.5
        `}
      >
        {/* En-tête */}
        <div className="mb-2 flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-rose-500 text-xs font-bold text-white shadow-sm">
            {(post.auteur || 'A')[0].toUpperCase()}
          </span>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">
              {post.auteur || 'Anonyme'}
            </p>
            <ClientDate ts={post.date} />
          </div>
        </div>

        {/* Sujet */}
        <h3 className="mb-1.5 text-base font-bold leading-snug text-zinc-900 dark:text-zinc-50">
          {post.sujet}
        </h3>

        {/* Contenu (extrait) */}
        <p className="line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {post.contenu}
        </p>

        {/* Réactions */}
        {Object.keys(post.reactions).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {Object.entries(post.reactions).map(([emoji, count]) =>
              count > 0 ? (
                <span
                  key={emoji}
                  className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs dark:bg-zinc-700/60"
                >
                  {emoji} {count}
                </span>
              ) : null
            )}
          </div>
        )}

        {/* Réponses count */}
        {post.reponses.length > 0 && (
          <p className="mt-2 text-xs font-medium text-red-500 dark:text-red-400">
            {post.reponses.length} réponse{post.reponses.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Dot sur le fil rouge */}
      <div className="absolute left-0 top-6 z-10 flex md:relative md:left-auto md:top-auto">
        <div className="relative flex items-center justify-center">
          <div className="h-4 w-4 rounded-full border-2 border-red-400 bg-white shadow-[0_0_8px_rgba(239,68,68,0.4)] dark:bg-zinc-800 dark:shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
          <div className="absolute left-4 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-gradient-to-r from-red-300/60 to-transparent md:block" />
          <div className="md:hidden" />
        </div>
      </div>
    </motion.div>
  )
}

interface FilRougeTimelineProps {
  posts: Post[]
  onPostClick?: (post: Post) => void
}

export default function FilRougeTimeline({
  posts,
  onPostClick,
}: FilRougeTimelineProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="mb-3 text-5xl">🌱</span>
        <p className="text-lg font-medium text-zinc-500 dark:text-zinc-400">
          Encore aucune pensée semée
        </p>
        <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
          Sois le premier à lancer une discussion
        </p>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      {/* Fil rouge central */}
      <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-red-400 via-red-300 to-transparent md:left-1/2 md:-translate-x-px" />

      <div className="flex flex-col gap-10 md:gap-12">
        {posts
          .slice()
          .sort((a, b) => b.date - a.date)
          .map((post, i) => (
            <div key={post.id} className="relative pl-10 md:pl-0">
              <TimelineCard
                post={post}
                index={i}
                onPostClick={onPostClick}
              />
            </div>
          ))}
      </div>
    </div>
  )
}
