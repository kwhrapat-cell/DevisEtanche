import Link from "next/link";
import TopBar from "@/components/TopBar";
import { KeyRound, Layers, MapPin, Plus } from "@/components/icons";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/Progress";
import { getUtilisateurCourant } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export default async function PortefeuillePage() {
  const session = await getUtilisateurCourant();
  const supabase = await createClient();

  const { data: chantiers } = session?.user
    ? await supabase
        .from("chantiers")
        .select("id, nom, ville, avancement_pct, entreprise_id")
        .eq("donneur_ordre_id", session.user.id)
        .order("created_at", { ascending: false })
    : { data: null };

  return (
    <>
      <TopBar
        titre="Portefeuille"
        sousTitre={`${chantiers?.length ?? 0} chantier${(chantiers?.length ?? 0) > 1 ? "s" : ""} suivi${(chantiers?.length ?? 0) > 1 ? "s" : ""}`}
        action={
          <div className="hidden gap-2 sm:flex">
            <ButtonLink href="/portefeuille/code" variante="secondaire" icone={KeyRound}>
              Générer un code
            </ButtonLink>
            <ButtonLink href="/portefeuille/nouveau" icone={Plus}>
              Nouveau chantier
            </ButtonLink>
          </div>
        }
      />
      <div className="p-4 sm:p-8">
        {!chantiers || chantiers.length === 0 ? (
          <Card>
            <EmptyState
              icone={Layers}
              titre="Aucun chantier suivi pour l'instant"
              texte="Créez un chantier puis générez un code pour l'entreprise exécutante qui doit le rejoindre."
              action={
                <ButtonLink href="/portefeuille/nouveau" icone={Plus} taille="lg">
                  Créer un chantier
                </ButtonLink>
              }
            />
          </Card>
        ) : (
          <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {chantiers.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/chantiers/${c.id}`}
                  className="card flex flex-col gap-3 p-4 transition-colors hover:border-primaire/40 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-encre">{c.nom}</div>
                      {c.ville && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-encre/60">
                          <MapPin size={13} className="shrink-0" />
                          {c.ville}
                        </div>
                      )}
                    </div>
                    <span className={`badge ${c.entreprise_id ? "bg-vert/10 text-vert" : "bg-ambre/10 text-ambre"}`}>
                      {c.entreprise_id ? "Rattachée" : "En attente"}
                    </span>
                  </div>
                  <ProgressBar valeur={c.avancement_pct ?? 0} afficherValeur />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
