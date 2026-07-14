import {
  collection, addDoc, query, where, orderBy, getDocs, serverTimestamp,
  doc, getDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove,
} from "firebase/firestore";
import { db } from "./firebase";

export const ANONYMOUS_USER = { uid: "anonymous", displayName: "Visiteur" };

export const addPost = async (
  text: string,
  authorName?: string,
  parentId?: string,
  fileData?: { url: string; name: string; type: string } | null,
  subject?: string,
) => {
  const postData: Record<string, unknown> = {
    text,
    authorName: authorName || ANONYMOUS_USER.displayName,
    parentId: parentId || null,
    subject: subject || null,
    reactions: {},
    createdAt: serverTimestamp(),
  };
  if (fileData) {
    postData.fileUrl = fileData.url;
    postData.fileName = fileData.name;
    postData.fileType = fileData.type;
  }
  const docRef = await addDoc(collection(db, "posts"), postData);
  return docRef.id;
};

export const getReplies = async (parentId: string) => {
  const q = query(collection(db, "posts"), where("parentId", "==", parentId), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const deletePost = async (postId: string) => {
  await deleteDoc(doc(db, "posts", postId));
};

export const updatePost = async (postId: string, newText: string) => {
  await updateDoc(doc(db, "posts", postId), { text: newText });
};

export const addReaction = async (postId: string, emoji: string, userId = "anonymous") => {
  const postRef = doc(db, "posts", postId);
  const snap = await getDoc(postRef);
  if (!snap.exists()) return;
  const existing = snap.data().reactions?.[emoji] ?? [];
  if (existing.includes(userId)) {
    await updateDoc(postRef, { [`reactions.${emoji}`]: arrayRemove(userId) });
  } else {
    await updateDoc(postRef, { [`reactions.${emoji}`]: arrayUnion(userId) });
  }
};

export const getPostById = async (postId: string) => {
  const snap = await getDoc(doc(db, "posts", postId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

// ── Aliases for agent-generated pages ──
export const addTimelineEntry = async (opts: { title: string; description: string; category: string; imageUrl: string | null; authorName: string; date: string }) => {
  return addPost(opts.description, opts.authorName, undefined, opts.imageUrl ? { url: opts.imageUrl, name: "", type: "image/jpeg" } : null, opts.title);
};
export const addGalleryPhoto = async (opts: { imageUrl: string; caption?: string | null; authorName?: string; subject?: string }) => {
  return addPost(opts.caption || "Partagé dans l'album", opts.authorName, undefined, { url: opts.imageUrl, name: "photo.jpg", type: "image/jpeg" }, opts.subject);
};

export const deleteGalleryPhoto = deletePost;

export const firestoreDateToTime = (ts: unknown): number => {
  if (ts && typeof ts === "object" && "toDate" in ts) return (ts as { toDate: () => Date }).toDate().getTime();
  if (ts && typeof ts === "object" && "seconds" in ts) return (ts as { seconds: number }).seconds * 1000;
  return Date.now();
};
