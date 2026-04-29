"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { X, Plus, Heart, ZoomIn, Download, ExternalLink } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { addPost } from "@/lib/firestore";
import { uploadFile } from "@/lib/storage";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

function Spinner() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid #e94560", borderTopColor: "transparent" }}
      />
    </div>
  );
}

// Staggered grid layout sizes for masonry feel
const CARD_SIZES = ["normal", "wide", "normal", "normal", "normal", "wide", "normal", "normal"];

export default function GalleryPage() {
  const { user, loading } = UserAuth();
  const router = useRouter();
  const [mediaPosts, setMediaPosts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [newPhotoText, setNewPhotoText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const unsub = onSnapshot(q, (snap) => {
        const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setMediaPosts(posts.filter(p => p.fileUrl && p.fileType?.startsWith("image/")));
      });
      return () => unsub();
    }
  }, [user]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setSubmitting(true);
    try {
      const fileData = await uploadFile(selectedFile);
      await addPost(newPhotoText || "Moment partagé dans l'album", user, null, fileData);
      setNewPhotoText(""); setSelectedFile(null); setShowUpload(false);
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  if (loading || !user) return <Spinner />;

  // Get unique authors for filter
  const authors = [...new Set(mediaPosts.map(p => p.authorName))];

  const filtered = filter === "all" ? mediaPosts : mediaPosts.filter(p => p.authorName === filter);

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d12", paddingBottom: 80 }}>
      {/* Dark gradient top decoration */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 300,
        background: "radial-gradient(ellipse at top center, rgba(233,69,96,0.15), transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "140px 24px 60px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: 48 }}
        >
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ display: "inline-block", marginBottom: 20 }}
          >
            <span style={{ fontSize: 48 }}>📷</span>
          </motion.div>
          <h1 style={{ fontFamily: "var(--font-serif, serif)", fontSize: 52, fontWeight: 700, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
            Notre Album
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 500 }}>
            Nos souvenirs en images
          </p>
        </motion.div>

        {/* Controls: filter + upload button */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 36 }}>
          {/* Filter pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["all", ...authors].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "7px 16px", borderRadius: 20, border: "1.5px solid",
                  borderColor: filter === f ? "#e94560" : "rgba(255,255,255,0.1)",
                  background: filter === f ? "rgba(233,69,96,0.15)" : "rgba(255,255,255,0.04)",
                  color: filter === f ? "#e94560" : "rgba(255,255,255,0.4)",
                  fontSize: 11, fontWeight: 700, cursor: "pointer",
                  textTransform: filter === "all" ? "uppercase" : "none",
                  letterSpacing: "0.08em", transition: "all 0.2s ease",
                }}
              >
                {f === "all" ? "Tous" : f}
              </button>
            ))}
          </div>

          <motion.button
            onClick={() => setShowUpload(true)}
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.94 }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 16,
              background: "linear-gradient(135deg, #e94560, #a855f7)",
              color: "#fff", border: "none", cursor: "pointer",
              fontWeight: 800, fontSize: 12, letterSpacing: "0.08em",
              textTransform: "uppercase",
              boxShadow: "0 6px 20px rgba(233,69,96,0.4)",
            }}
          >
            <Plus size={16} /> Ajouter
          </motion.button>
        </div>

        {/* Photo count */}
        <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 24 }}>
          {filtered.length} souvenir{filtered.length > 1 ? "s" : ""}
        </p>

        {/* Masonry-style Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 32px", borderRadius: 28, border: "2px dashed rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize: 56, display: "block", marginBottom: 20, opacity: 0.3 }}>🖼️</span>
            <p style={{ color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>Aucun souvenir partagé pour le moment.</p>
          </div>
        ) : (
          <LayoutGroup>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 16,
              gridAutoRows: 220,
            }}>
              {filtered.map((post, i) => {
                const isDany = post.authorName?.toLowerCase().includes("dany");
                const authorColor = isDany ? "#5eead4" : "#f9a8d4";
                const isWide = CARD_SIZES[i % CARD_SIZES.length] === "wide";
                const date = post.createdAt?.toDate?.();

                return (
                  <motion.div
                    key={post.id}
                    layoutId={post.id}
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: (i % 8) * 0.04 }}
                    whileHover={{ scale: 1.03, zIndex: 10 }}
                    onClick={() => setSelectedImage(post)}
                    style={{
                      gridColumn: isWide ? "span 2" : "span 1",
                      borderRadius: 20,
                      overflow: "hidden",
                      cursor: "pointer",
                      position: "relative",
                      background: "#1a1a2e",
                      border: "1.5px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <img
                      src={post.fileUrl}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.8s ease", display: "block" }}
                    />

                    {/* Gradient overlay */}
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                    }}
                      className="gallery-overlay"
                    />

                    {/* Bottom info */}
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0,
                      padding: "20px 16px 14px",
                      background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                      transform: "translateY(8px)",
                      opacity: 0,
                      transition: "all 0.3s ease",
                    }}
                      className="gallery-info"
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 22, height: 22, borderRadius: 8, background: authorColor, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 900 }}>
                          {post.authorName?.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 11, fontWeight: 700, margin: 0 }}>
                            {post.text?.length > 40 ? post.text.substring(0, 40) + "…" : post.text}
                          </p>
                          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, margin: 0 }}>
                            {date ? formatDistanceToNow(date, { addSuffix: true, locale: fr }) : ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Top right: zoom icon */}
                    <div style={{
                      position: "absolute", top: 12, right: 12,
                      width: 32, height: 32, borderRadius: 10,
                      background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      opacity: 0, transition: "opacity 0.3s ease",
                    }}
                      className="gallery-zoom"
                    >
                      <ZoomIn size={14} color="#fff" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </LayoutGroup>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <>
            <motion.div
              key="bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUpload(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(16px)", zIndex: 90 }}
            />
            <motion.div
              key="modal"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, display: "flex", justifyContent: "center" }}
            >
              <div
                style={{
                  width: "100%", maxWidth: 520, maxHeight: "85vh", overflowY: "auto",
                  borderRadius: "28px 28px 0 0",
                  background: "#13131a",
                  border: "1.5px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 -30px 80px rgba(0,0,0,0.4)",
                }}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ display: "flex", justifyContent: "center", padding: "16px 0 8px" }}>
                  <div style={{ width: 40, height: 4, borderRadius: 8, background: "rgba(255,255,255,0.1)" }} />
                </div>
                <div style={{ padding: "0 28px 32px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <div>
                      <h2 style={{ color: "#fff", fontFamily: "var(--font-serif, serif)", fontSize: 24, fontWeight: 700, margin: 0 }}>Nouveau Souvenir</h2>
                      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.15em" }}>Ajouter à l'album</p>
                    </div>
                    <button onClick={() => setShowUpload(false)} style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <X size={16} color="rgba(255,255,255,0.5)" />
                    </button>
                  </div>
                  <form onSubmit={handleUpload}>
                    <textarea
                      value={newPhotoText}
                      onChange={e => setNewPhotoText(e.target.value)}
                      placeholder="Ajoute une légende..."
                      rows={3}
                      style={{
                        width: "100%", boxSizing: "border-box",
                        padding: "14px 16px", marginBottom: 16,
                        borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.05)", fontSize: 13,
                        color: "#fff", outline: "none", resize: "none",
                      }}
                    />
                    <div style={{ marginBottom: 20 }}>
                      <FileUpload onFileSelect={setSelectedFile} />
                    </div>
                    <motion.button
                      type="submit"
                      disabled={submitting || !selectedFile}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        width: "100%", padding: "14px", borderRadius: 16,
                        background: "linear-gradient(135deg, #e94560, #a855f7)",
                        color: "#fff", border: "none", cursor: "pointer",
                        fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em",
                        boxShadow: "0 8px 24px rgba(233,69,96,0.35)",
                        opacity: (submitting || !selectedFile) ? 0.4 : 1,
                      }}
                    >
                      {submitting ? "Partage..." : "📸 Partager le souvenir"}
                    </motion.button>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            style={{
              position: "fixed", inset: 0, zIndex: 200,
              background: "rgba(0,0,0,0.95)", backdropFilter: "blur(30px)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: 24,
            }}
          >
            <button
              onClick={() => setSelectedImage(null)}
              style={{ position: "absolute", top: 24, right: 24, width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <X size={20} color="rgba(255,255,255,0.7)" />
            </button>

            <motion.img
              layoutId={selectedImage.id}
              src={selectedImage.fileUrl}
              alt=""
              onClick={e => e.stopPropagation()}
              style={{ maxHeight: "72vh", maxWidth: "90vw", objectFit: "contain", borderRadius: 20, boxShadow: "0 0 100px rgba(233,69,96,0.15)" }}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: 28, textAlign: "center", maxWidth: 480 }}
              onClick={e => e.stopPropagation()}
            >
              <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 18, fontFamily: "var(--font-serif, serif)", fontWeight: 600, marginBottom: 8 }}>
                {selectedImage.text || "Un moment précieux"}
              </p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.2em" }}>
                {selectedImage.authorName} · {selectedImage.createdAt?.toDate
                  ? formatDistanceToNow(selectedImage.createdAt.toDate(), { addSuffix: true, locale: fr })
                  : ""}
              </p>
              <Link
                href={`/discussions/${selectedImage.parentId || selectedImage.id}`}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 20, padding: "8px 20px", borderRadius: 20, border: "1px solid rgba(233,69,96,0.4)", color: "#e94560", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", textDecoration: "none" }}
              >
                <ExternalLink size={12} /> Voir la discussion
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS for hover effects */}
      <style>{`
        div[class="gallery-overlay"] { opacity: 0; }
        div:hover > .gallery-overlay { opacity: 1; }
        div:hover .gallery-info { opacity: 1 !important; transform: translateY(0) !important; }
        div:hover .gallery-zoom { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
