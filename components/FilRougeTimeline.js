"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageCircle, Heart } from "lucide-react";
import { useEffect, useState } from "react";

function ClientOnlyDate({ date }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !date) return null;
  return <>{formatDistanceToNow(date, { addSuffix: true, locale: fr })}</>;
}

// Small square card — HARD fixed 200x200, text always cut off
function ThreadCard({ post, repliesCount, isEven, onOpen }) {
  const isDany = post.authorName?.toLowerCase().includes("dany");
  const color = isDany ? "#5eead4" : "#f9a8d4"; // teal / pink

  const previewText = post.text?.length > 60
    ? post.text.substring(0, 60) + "…"
    : post.text;

  return (
    <motion.div
      onClick={() => onOpen(post)}
      whileHover={{ scale: 1.06, y: -6, rotate: isEven ? 1.5 : -1.5 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{
        width: 190,
        height: 190,
        flexShrink: 0,
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRadius: 28,
        padding: 18,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(24px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
        border: "2px solid rgba(255,255,255,0.7)",
        position: "relative",
      }}
    >
      {/* Glow blob bottom right */}
      <div style={{
        position: "absolute", bottom: -20, right: -20,
        width: 80, height: 80,
        borderRadius: "50%",
        background: color,
        opacity: 0.18,
        filter: "blur(20px)",
        pointerEvents: "none",
      }} />

      {/* Top row: avatar + date */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: color, display: "flex", alignItems: "center",
          justifyContent: "center", color: "#fff", fontWeight: 900,
          fontSize: 13, boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}>
          {post.authorName?.substring(0, 1).toUpperCase()}
        </div>
        <span style={{ fontSize: 8, fontWeight: 800, opacity: 0.35, textTransform: "uppercase", letterSpacing: 1 }}>
          <ClientOnlyDate date={typeof post.createdAt?.toDate === 'function' ? post.createdAt.toDate() : null} />
        </span>
      </div>

      {/* Subject — max 2 lines, overflow hidden */}
      <div style={{
        fontWeight: 700, fontSize: 13, lineHeight: 1.3,
        overflow: "hidden", display: "-webkit-box",
        WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        marginBottom: 6, color: "#1a1a2e",
      }}>
        {post.subject || "Sans titre"}
      </div>

      {/* Preview — max 2 lines, italic */}
      <div style={{
        fontSize: 10, fontStyle: "italic", opacity: 0.55, lineHeight: 1.4,
        overflow: "hidden", display: "-webkit-box",
        WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        color: "#444", flex: 1,
      }}>
        {previewText}
      </div>

      {/* Bottom row: replies + open button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 8, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#e94560", fontSize: 9, fontWeight: 800 }}>
          <MessageCircle size={11} />
          {repliesCount}
        </div>
        <div style={{
          background: "#e94560", color: "#fff",
          fontSize: 8, fontWeight: 900, textTransform: "uppercase",
          letterSpacing: 1, padding: "4px 10px", borderRadius: 8,
          boxShadow: "0 2px 8px rgba(233,69,96,0.4)",
        }}>
          Ouvrir
        </div>
      </div>
    </motion.div>
  );
}

export default function FilRougeTimeline({ allPosts, onOpenModal }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const roots = allPosts
    .filter((p) => !p.parentId)
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

  if (roots.length === 0) return null;

  return (
    <div style={{ 
      position: "relative", 
      width: "100%", 
      maxWidth: isMobile ? "100%" : 800, 
      margin: "0 auto", 
      padding: isMobile ? "20px 0" : "40px 16px" 
    }}>
      {/* Le Fil Rouge vertical */}
      <div style={{
        position: "absolute",
        left: isMobile ? 24 : "50%",
        top: 0, bottom: 0,
        width: 3,
        marginLeft: -1.5,
        background: "linear-gradient(to bottom, #e94560, #f9a8d4, #a78bfa)",
        opacity: 0.5,
        borderRadius: 8,
      }} />

      <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 32 : 48 }}>
        {roots.map((post, index) => {
          const isEven = index % 2 === 0;
          const repliesCount = allPosts.filter(p => p.parentId === post.id).length;

          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
              style={{
                position: "relative",
                display: "flex",
                justifyContent: isMobile ? "flex-start" : (isEven ? "flex-start" : "flex-end"),
                alignItems: "center",
                paddingLeft: isMobile ? 48 : 0,
              }}
            >
              {/* Dot on the thread */}
              <div style={{
                position: "absolute",
                left: isMobile ? 24 : "50%",
                transform: "translateX(-50%)",
                width: 16, height: 16,
                borderRadius: "50%",
                background: "#fff",
                border: "4px solid #e94560",
                boxShadow: "0 0 12px rgba(233,69,96,0.5)",
                zIndex: 10,
              }} />

              {/* Horizontal connector line from dot to card */}
              <div style={{
                position: "absolute",
                top: "50%",
                left: isMobile ? 24 : (isEven ? "50%" : undefined),
                right: !isMobile && !isEven ? "50%" : undefined,
                width: isMobile ? 24 : "calc(50% - 80px)",
                height: 2,
                background: "linear-gradient(to right, rgba(233,69,96,0.4), transparent)",
                transform: (!isMobile && !isEven) ? "scaleX(-1)" : undefined,
                zIndex: 1,
              }} />

              {/* Card wrapper */}
              <div style={{
                width: isMobile ? "100%" : "50%",
                display: "flex",
                justifyContent: isMobile ? "flex-start" : (isEven ? "flex-end" : "flex-start"),
                paddingRight: (!isMobile && isEven) ? 48 : 0,
                paddingLeft: (!isMobile && !isEven) ? 48 : 0,
              }}>
                <ThreadCard
                  post={post}
                  repliesCount={repliesCount}
                  isEven={isEven}
                  onOpen={onOpenModal}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
