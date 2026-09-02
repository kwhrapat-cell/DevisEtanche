import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 text-center text-xs text-neige/40 py-4 px-4">
      <Link href="/mentions-legales" className="hover:text-neige/70">Mentions légales</Link>
      {" · "}
      <Link href="/cgv" className="hover:text-neige/70">CGV</Link>
      {" · "}
      <Link href="/confidentialite" className="hover:text-neige/70">Confidentialité</Link>
    </footer>
  );
}
