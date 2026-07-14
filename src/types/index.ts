/* -- Shared Types ----------------------------------------------- */

export type TimelineCategory =
  | "Moment"
  | "Voyage"
  | "Surprise"
  | "Quotidien"
  | "Émotion";

export interface TimelineEntry {
  id: string;
  title: string;
  description: string;
  category: TimelineCategory;
  imageUrl?: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: number; // unix ms
  date: string; // "2025-06-15"
}

export type AuthorName = "Nous" | "Toi" | null;

export interface GalleryPhoto {
  id: string;
  imageUrl: string;
  caption?: string;
  authorName: AuthorName;
  authorAvatar?: string;
  createdAt: number;
}

export const CATEGORIES: {
  key: TimelineCategory;
  emoji: string;
  color: string;
  label: string;
}[] = [
  { key: "Moment", emoji: "✨", color: "#f59e0b", label: "Moment" },
  { key: "Voyage", emoji: "🗺️", color: "#10b981", label: "Voyage" },
  { key: "Surprise", emoji: "🎁", color: "#8b5cf6", label: "Surprise" },
  { key: "Quotidien", emoji: "🌿", color: "#06b6d4", label: "Quotidien" },
  { key: "Émotion", emoji: "❤️", color: "#e94560", label: "Émotion" },
];

export function getCategory(key: TimelineCategory) {
  return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[0];
}
