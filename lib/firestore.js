import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  serverTimestamp,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  setDoc,
  onSnapshot
} from "firebase/firestore";

export const updatePresence = async (userId, isTyping = false) => {
  try {
    const docRef = doc(db, "users", userId);
    await setDoc(docRef, {
      lastActive: serverTimestamp(),
      isTyping: isTyping
    }, { merge: true });
  } catch (error) {
    console.error("Error updating presence", error);
  }
};

export const addPost = async (text, user, parentId = null, fileData = null, locationData = null, subject = null) => {
  try {
    const postData = {
      text,
      authorId: user.uid,
      authorName: user.displayName || user.email,
      createdAt: serverTimestamp(),
      parentId,
      ...(subject && { subject }),
      ...(fileData && { fileUrl: fileData.url, fileName: fileData.name, fileType: fileData.type }),
      ...(locationData && { 
        lat: locationData.lat, 
        lng: locationData.lng, 
        locationName: locationData.name,
        locationType: locationData.type || 'visited' 
      })
    };
    const docRef = await addDoc(collection(db, "posts"), postData);
    return docRef.id;
  } catch (error) {
    console.error("Erreur détaillée lors de l'ajout du post:", error);
    throw error;
  }
};

export const getRootPosts = async () => {
  try {
    const q = query(collection(db, "posts"));
    const querySnapshot = await getDocs(q);
    const all = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Filter and sort in memory to avoid index requirement
    return all
      .filter(p => p.parentId === null)
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  } catch (error) {
    console.error("Erreur lors de la récupération des posts racines", error);
    throw error;
  }
};

export const getPostById = async (postId) => {
  try {
    const docRef = doc(db, "posts", postId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du post", error);
    throw error;
  }
};

export const getReplies = async (parentId) => {
  try {
    const q = query(collection(db, "posts"));
    const querySnapshot = await getDocs(q);
    const all = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Filter and sort in memory
    return all
      .filter(p => p.parentId === parentId)
      .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
  } catch (error) {
    console.error("Erreur lors de la récupération des réponses", error);
    throw error;
  }
};

export const getAllPosts = async () => {
  try {
    const q = query(collection(db, "posts"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Erreur lors de la récupération de tous les posts", error);
    throw error;
  }
};

export const deletePost = async (postId) => {
  try {
    const docRef = doc(db, "posts", postId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erreur lors de la suppression du post", error);
    throw error;
  }
};

export const updatePost = async (postId, newText) => {
  try {
    const docRef = doc(db, "posts", postId);
    await updateDoc(docRef, { 
      text: newText,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du post", error);
    throw error;
  }
};

export const ratePost = async (postId, rating) => {
  try {
    const docRef = doc(db, "posts", postId);
    await updateDoc(docRef, { 
      rating: rating
    });
  } catch (error) {
    console.error("Erreur lors de la notation du post", error);
    throw error;
  }
};

export const addReaction = async (postId, emoji, userId) => {
  try {
    const docRef = doc(db, "posts", postId);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();
    const reactions = data.reactions || {};
    
    // Toggle emoji: if user already reacted with this emoji, remove it
    const users = reactions[emoji] || [];
    if (users.includes(userId)) {
      reactions[emoji] = users.filter(id => id !== userId);
    } else {
      reactions[emoji] = [...users, userId];
    }

    await updateDoc(docRef, { reactions });
  } catch (error) {
    console.error("Error adding reaction", error);
  }
};
