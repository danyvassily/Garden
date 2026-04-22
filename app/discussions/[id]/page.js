"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getPostById } from "@/lib/firestore";
import { UserAuth } from "@/context/AuthContext";
import DiscussionNode from "@/components/DiscussionNode";
import Link from "next/link";
import { ArrowLeft, Share2 } from "lucide-react";
import { motion } from "framer-motion";

export default function DiscussionThreadPage({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [rootPost, setRootPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = UserAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (authLoading || loading) {
    return (
      <div className="page-container flex flex-col justify-center items-center gap-4">
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 border-4 border-[#ff3333] border-t-transparent rounded-full"
        />
        <p className="text-secondary animate-pulse">Chargement...</p>
      </div>
    );
  }

  if (!rootPost) {
    return (
      <div className="page-container pt-20 max-w-4xl mx-auto text-center">
        <div className="card border-dashed border-[#444]">
          <h2 className="text-2xl font-bold mb-4">Ce voyage n'existe plus</h2>
          <p className="text-secondary mb-8">Le fil rouge a été rompu.</p>
          <Link href="/discussions" className="btn-primary">
            Retourner aux fils
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="page-container pt-20"
    >
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="flex items-center justify-between mb-12">
          <Link href="/discussions" className="inline-flex items-center gap-2 text-secondary hover:text-white transition-all group">
            <motion.div whileHover={{ x: -5 }}>
              <ArrowLeft size={20} />
            </motion.div>
            <span className="font-medium">Retour</span>
          </Link>
          
          <div className="flex gap-4">
            <button className="btn-icon">
              <Share2 size={20} />
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#ff3333]/10 border border-[#ff3333]/30 rounded-full">
              <div className="w-2 h-2 bg-[#ff3333] rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-[#ff3333] uppercase">Live</span>
            </div>
          </div>
        </header>
        
        <div className="mb-12 border-b border-white/5 pb-8">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold mb-2"
          >
            Arborescence
          </motion.h1>
          <p className="text-secondary text-sm">Naviguez dans les branches.</p>
        </div>

        {/* The Tree Visualization */}
        <div className="relative pb-32">
          <DiscussionNode post={rootPost} level={0} />
        </div>

        {/* Floating Components */}
      </div>
    </motion.div>
  );
}
