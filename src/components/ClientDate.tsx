"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ClientDateProps {
  date: Date | string | number | null | undefined;
  locale?: "fr" | "en";
  addSuffix?: boolean;
  className?: string;
}

export default function ClientDate({
  date,
  locale = "fr",
  addSuffix = true,
  className,
}: ClientDateProps) {
  const [formatted, setFormatted] = useState<string>("");

  useEffect(() => {
    if (!date) {
      setFormatted("");
      return;
    }
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    const loc = locale === "fr" ? fr : undefined;
    setFormatted(formatDistanceToNow(d, { addSuffix, locale: loc }));
  }, [date, locale, addSuffix]);

  // Prevent hydration mismatch — render nothing on the server
  if (!formatted) {
    return <span className={className}>—</span>;
  }

  return <span className={className}>{formatted}</span>;
}
