import Link from "next/link";
import TopBar from "@/components/TopBar";
import { getUtilisateurCourant } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export default async function ClientsPage() {
  const session = await getUtilisateurCourant();
  const supabase = await createClient();

  const { data: clients } = session?.profile
    ? await supabase
        .from("clients")
        .select("id, nom, type, ville")
        .eq("entreprise_id", session.profile.entreprise_id)
        .order("created_at", { ascending: false })
    : { data: null };

  return (
    <>
        <TopBar titre="Clients" sousTitre={`${clients?.length ?? 0} clients`} />
        <div className="p-8">
          <div className="mb-5">
            <Link href="/clients/nouveau" className="btn-like inline-flex items-center gap-2 bg-rouille text-white text-sm font-semibold px-4 py-2 rounded-lg">
              + Nouveau client
            </Link>
          </div>
          {!clients || clients.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="font-display font-semibold text-neige mb-2">Aucun client pour l'instant</div>
              <p className="text-sm text-neige/50">Ajoutez votre premier client pour pouvoir lui créer un chantier et un devis.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((c) => (
                <div key={c.id} className="card p-5">
                  <div className="font-medium text-neige mb-1">{c.nom}</div>
                  <div className="text-xs text-neige/50 mb-3">{c.ville}</div>
                  <span className="badge bg-sable text-neige/60">{c.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
    </>
  );
}
