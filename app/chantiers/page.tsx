import Link from "next/link";
import TopBar from "@/components/TopBar";
import { HardHat, MapPin, Plus, Ruler } from "@/components/icons";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/Progress";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getUtilisateurCourant } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export default async function ChantiersPage() {
  const session = await getUtilisateurCourant();
  const supabase = await createClient();

  const { data: chantiers } = session?.profile
    ? await supabase
        .from("chantiers")
        .select("id, nom, ville, statut, surface_totale_m2, avancement_pct")
        .eq("entreprise_id", session.profile.entreprise_id)
        .order("created_at", { ascending: false })
    : { data: null };

  return (
    <>
      <TopBar
        titre="Chantiers"
        sousTitre={`${chantiers?.length ?? 0} chantier${(chantiers?.length ?? 0) > 1 ? "s" : ""}`}
        action={
          <ButtonLink href="/chantiers/nouveau" icone={Plus} className="hidden sm:inline-flex">
            Nouveau chantier
          </ButtonLink>
        }
      />
      <div className="p-4 sm:p-8">
        {!chantiers || chantiers.length === 0 ? (
          <Card>
            <EmptyState
              icone={HardHat}
              titre="Aucun chantier pour l'instant"
              texte="Créez votre premier chantier pour suivre son avancement zone par zone."
              action={
                <ButtonLink href="/chantiers/nouveau" icone={Plus} taille="lg">
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
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-encre/60">
                        {c.ville && (
                          <span className="flex items-center gap-1">
                            <MapPin size={13} className="shrink-0" />
                            {c.ville}
                          </span>
                        )}
                        {c.surface_totale_m2 != null && (
                          <span className="flex items-center gap-1">
                            <Ruler size={13} className="shrink-0" />
                            {c.surface_totale_m2} m²
                          </span>
                        )}
                      </div>
                    </div>
                    <StatusBadge domaine="chantier" statut={c.statut} />
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
