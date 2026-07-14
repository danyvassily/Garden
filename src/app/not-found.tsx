import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-garden p-6">
      <div className="text-center">
        <h1 className="text-6xl font-serif text-accent mb-4">404</h1>
        <p className="text-text-secondary mb-8">Cette page n'existe pas dans le jardin.</p>
        <Link href="/" className="px-8 py-4 bg-text-primary text-white rounded-2xl font-bold">Retour à l'accueil</Link>
      </div>
    </div>
  );
}
