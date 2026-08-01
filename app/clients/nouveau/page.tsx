"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { createClient } from "@/lib/supabase/client";

export default function NouveauClientPage() {
  const [nom, setNom] = useState("");
  const [type, setType] = useState<"syndic" | "particulier" | "entreprise">("particulier");
  const [ville, setVille] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setChargement(true);
    const supabase = createClient();

    const { data: userData } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from("profiles").select("entreprise_id").eq("id", userData.user?.id).single();

    if (!profile) {
      setChargement(false);
      setErreur("Impossible de déterminer votre entreprise.");
      return;
    }

    const { error } = await supabase.from("clients").insert({
      entreprise_id: profile.entreprise_id,
      nom,
      type,
      ville,
      email: email || null,
      telephone: telephone || null,
    });

    setChargement(false);
    if (error) {
      setErreur("Le client n'a pas pu être enregistré.");
      return;
    }
    router.push("/clients");
    router.refresh();
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        <TopBar titre="Nouveau client" sousTitre="Syndic, entreprise ou particulier" />
        <div className="p-8 max-w-lg">
          <form onSubmit={enregistrer} className="card p-6 flex flex-col gap-4">
            {erreur && <div className="text-sm text-[#C64A2C] bg-[#F6E1DE] rounded-lg px-3 py-2">{erreur}</div>}

            <div>
              <label className="text-xs font-mono text-ardoise/60 block mb-1">NOM</label>
              <input required value={nom} onChange={(e) => setNom(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-xs font-mono text-ardoise/60 block mb-1">TYPE</label>
              <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full border border-ligne rounded-lg px-3 py-2">
                <option value="particulier">Particulier</option>
                <option value="syndic">Syndic</option>
                <option value="entreprise">Entreprise</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-mono text-ardoise/60 block mb-1">VILLE</label>
              <input value={ville} onChange={(e) => setVille(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-xs font-mono text-ardoise/60 block mb-1">E-MAIL (optionnel)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-xs font-mono text-ardoise/60 block mb-1">TÉLÉPHONE (optionnel)</label>
              <input value={telephone} onChange={(e) => setTelephone(e.target.value)} className="w-full border border-ligne rounded-lg px-3 py-2" />
            </div>
            <button disabled={chargement} className="bg-rouille text-white font-semibold rounded-lg py-2.5 disabled:opacity-60">
              {chargement ? "Enregistrement…" : "Enregistrer le client"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
