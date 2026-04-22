"use client";

import { useEffect } from "react";
import { UserAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const { user, loginWithGoogle } = UserAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/discussions");
    }
  }, [user, router]);

  return (
    <div className="login-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card max-w-md w-full text-center"
      >
        <h1 className="text-3xl font-bold mb-4">Together</h1>
        <p className="text-secondary mb-8">Rejoignez la discussion. Suivez le fil rouge.</p>
        
        <button 
          onClick={loginWithGoogle}
          className="btn-primary w-full"
        >
          <LogIn size={20} />
          Se connecter avec Google
        </button>
      </motion.div>
    </div>
  );
}
