"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getPostById } from "@/lib/firestore";
import { UserAuth } from "@/context/AuthContext";
import DiscussionNode from "@/components/DiscussionNode";
import Link from "next/link";
import { ArrowLeft, GitBranch, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function DiscussionThreadPage({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [rootPost, setRootPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = UserAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const data = await getPostById(id);
          setRootPost(data);
        } catch (error) {
          console.error("Error fetching data", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [id]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-garden-gradient">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 border-4 border-[var(--accent-color)] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!rootPost) {
    return (
      <div className="min-h-screen bg-garden-gradient flex items-center justify-center p-6">
        <div className="card text-center max-w-md w-full border-dashed">
          <Heart size={48} className="mx-auto mb-6 text-[var(--accent-color)] opacity-20" />
          <h2 className="text-3xl font-serif mb-4">Ce voyage n'existe plus</h2>
          <p className="text-[hsl(var(--text-secondary))] font-medium mb-8">
            Le fil rouge a été rompu ou cette pensée s'est envolée.
          </p>
          <Link
            href="/discussions"
            className="inline-block px-8 py-4 bg-[hsl(var(--text-primary))] text-white rounded-2xl font-bold"
          >
            Retourner au Jardin
          </Link>
        </div>
      </div>
    );
  }

  const isDany = rootPost.authorName?.toLowerCase().includes("dany");
  const authorColor = isDany ? "#5eead4" : "#f9a8d4";

  return (
    <div className="min-h-screen bg-garden-gradient pb-32">
      <div className="max-w-3xl mx-auto px-6 pt-32 md:pt-40 pb-12 relative z-10">

        {/* Back */}
        <Link
          href="/discussions"
          className="inline-flex items-center gap-3 text-[hsl(var(--text-secondary))] hover:text-[var(--accent-color)] transition-all font-black uppercase tracking-widest text-xs mb-12"
        >
          <motion.div whileHover={{ x: -5 }} className="p-2 rounded-xl bg-black/5">
            <ArrowLeft size={18} />
          </motion.div>
          Retour au fil rouge
        </Link>

        {/* Thread Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="glass-premium p-8 rounded-[2rem] mb-12 relative overflow-hidden border border-white/50 shadow-2xl"
        >
          <div
            className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: authorColor }}
          />

          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg"
              style={{ background: authorColor }}
            >
              {rootPost.authorName?.substring(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <GitBranch size={14} className="text-[var(--accent-color)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-color)]">
                  Fil Actif
                </span>
              </div>
              <p className="text-sm font-black uppercase tracking-widest opacity-50">
                {rootPost.authorName}
              </p>
              <p className="text-[10px] opacity-30">
                {rootPost.createdAt?.toDate
                  ? formatDistanceToNow(rootPost.createdAt.toDate(), { addSuffix: true, locale: fr })
                  : "À l'instant"}
              </p>
            </div>
          </div>

          <h1 className="text-3xl font-serif font-bold text-[hsl(var(--text-primary))] mb-4 relative z-10">
            {rootPost.subject || "Discussion"}
          </h1>

          <div
            className="w-full h-0.5 rounded-full mt-4 relative z-10"
            style={{ background: `linear-gradient(to right, ${authorColor}, transparent)` }}
          />
        </motion.div>

        {/* Threaded replies with GSAP scroll connector */}
        <div className="relative">
          <DiscussionNode post={rootPost} level={0} />
        </div>
      </div>
    </div>
  );
}
