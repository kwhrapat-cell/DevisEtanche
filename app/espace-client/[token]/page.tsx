import { createClient } from "@/lib/supabase/server";

const labelStatut: Record<string, string> = {
  en_preparation: "En préparation",
  en_cours: "En cours",
  termine: "Terminé",
  en_attente: "En attente",
};

export default async function EspaceClientPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("espace_client_chantier", { p_token: token });

  const chantier = data?.chantier;
  const zones = data?.zones ?? [];
  const photos = data?.photos ?? [];

  if (error || !chantier) {
    return (
      <div className="min-h-screen bg-papier flex items-center justify-center p-6">
        <div className="card p-8 text-center max-w-sm">
          <div className="font-display font-semibold text-neige mb-2">Lien introuvable</div>
          <p className="text-sm text-neige/50">Ce lien de suivi n'est plus valide. Contactez votre entreprise d'étanchéité.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-papier">
      <div className="bg-ardoise text-white px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 font-display font-semibold mb-4">
            <span className="w-6 h-6 rounded-md bg-gradient-to-br from-rouille to-ambre inline-block" />
            DevisEtanche — Suivi de chantier
          </div>
          <h1 className="text-2xl font-display font-semibold">{chantier.nom}</h1>
          <p className="text-white/60 text-sm">{chantier.ville}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">
        <div className="card p-6 flex items-center justify-between">
          <div>
            <div className="text-xs text-neige/50 mb-1">Avancement global</div>
            <div className="font-mono text-3xl font-semibold text-neige">{chantier.avancement_pct}%</div>
          </div>
          <span className={`badge badge-${chantier.statut}`}>{labelStatut[chantier.statut] ?? chantier.statut}</span>
        </div>

        {zones.length > 0 && (
          <div className="card p-6">
            <div className="font-medium text-neige mb-3">Zones</div>
            <div className="flex flex-col divide-y divide-ligne">
              {zones.map((z: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-neige">{z.nom}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-28 h-2 bg-sable rounded-full overflow-hidden">
                      <div className="h-full bg-vert" style={{ width: `${z.avancement_pct}%` }} />
                    </div>
                    <span className="font-mono text-xs w-10 text-right">{z.avancement_pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {photos.length > 0 && (
          <div className="card p-6">
            <div className="font-medium text-neige mb-3">Dernières photos</div>
            <div className="grid grid-cols-3 gap-3">
              {photos.map((p: any, i: number) => (
                <img key={i} src={p.url} alt="Photo de chantier" className="w-full h-24 object-cover rounded-lg" />
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-neige/40 text-center">Ce lien est personnel — ne le partagez pas.</p>
      </div>
    </div>
  );
}
