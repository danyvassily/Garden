import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid"; // Need to install uuid

export const uploadFile = async (file) => {
  if (!file) return null;
  
  try {
    const fileId = uuidv4();
    const storageRef = ref(storage, `uploads/${fileId}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    
    return {
      url: downloadUrl,
      name: file.name,
      type: file.type
    };
  } catch (error) {
    console.error("Erreur lors du téléchargement du fichier", error);
    throw error;
  }
};
