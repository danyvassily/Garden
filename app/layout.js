import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata = {
  title: "The Garden | Eirni & Dany",
  description: "A private, sacred space for our love and memories.",
};

import { AuthContextProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${outfit.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthContextProvider>
          <Navbar />
          <main className="min-h-screen pb-20 lg:pb-0">
            {children}
          </main>
          <MobileNav />
        </AuthContextProvider>
      </body>
    </html>
  );
}
