"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, collection, query } from "firebase/firestore";
import { updatePresence } from "@/lib/firestore";

export default function usePresence(user) {
  const [partnerStatus, setPartnerStatus] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Heartbeat: update presence every 30 seconds
    const interval = setInterval(() => {
      updatePresence(user.uid, false);
    }, 30000);

    // Initial presence
    updatePresence(user.uid, false);

    // Listen to all users (since it's just two)
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docs.forEach(doc => {
        if (doc.id !== user.uid) {
          const data = doc.data();
          const lastActive = data.lastActive?.toDate();
          const isOnline = lastActive && (new Date() - lastActive < 60000); // Online if active in last minute
          setPartnerStatus({
            id: doc.id,
            isOnline,
            isTyping: data.isTyping,
            lastActive
          });
        }
      });
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [user]);

  const setTyping = (isTyping) => {
    if (user) updatePresence(user.uid, isTyping);
  };

  return { partnerStatus, setTyping };
}
