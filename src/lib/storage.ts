import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";
import { v4 as uuidv4 } from "uuid";

export const uploadFile = async (file: File): Promise<{ url: string; name: string; type: string } | null> => {
  if (!file) return null;
  try {
    const fileId = crypto.randomUUID?.() ?? Date.now().toString(36);
    const storageRef = ref(storage, `uploads/${fileId}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return { url: downloadUrl, name: file.name, type: file.type };
  } catch (error) {
    console.error("Upload error", error);
    throw error;
  }
};

export const uploadFileWithProgress = async (
  file: File,
  pathPrefix = "uploads",
  onProgress?: (pct: number) => void,
): Promise<string> => {
  const result = await uploadFile(file);
  onProgress?.(100);
  return result?.url ?? "";
};
