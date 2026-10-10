import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/Logo";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default async function EspaceClientPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("espace_client_chantier", { p_token: token });

  const chantier = data?.chantier;
  const zones = data?.zones ?? [];
  const photos = data?.photos ?? [];

  if (error || !chantier) {
    return (
      <div className="min-h-screen bg-fond flex items-center justify-center p-6">
        <div className="card p-8 text-center max-w-sm">
          <div className="font-display font-semibold text-encre mb-2">Lien introuvable</div>
          <p className="text-sm text-encre/60">Ce lien de suivi n'est plus valide. Contactez votre entreprise d'étanchéité.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fond">
      <div className="bg-marine text-white px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-5 flex items-center gap-3">
            <Logo clair />
            <span className="text-sm text-white/60">Suivi de chantier</span>
          </div>
          <h1 className="text-2xl font-display font-semibold">{chantier.nom}</h1>
          <p className="text-white/60 text-sm">{chantier.ville}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">
        <div className="card p-6 flex items-center justify-between">
          <div>
            <div className="text-xs text-encre/60 mb-1">Avancement global</div>
            <div className="font-mono text-3xl font-semibold text-encre">{chantier.avancement_pct}%</div>
          </div>
          <StatusBadge domaine="chantier" statut={chantier.statut} />
        </div>

        {zones.length > 0 && (
          <div className="card p-6">
            <div className="font-medium text-encre mb-3">Zones</div>
            <div className="flex flex-col divide-y divide-ligne">
              {zones.map((z: any, i: number) => (
                <div key={i} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                  <span className="text-encre">{z.nom}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 sm:w-28 h-2 bg-sable rounded-full overflow-hidden">
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
            <div className="font-medium text-encre mb-3">Dernières photos</div>
            <div className="grid grid-cols-3 gap-3">
              {photos.map((p: any, i: number) => (
                <img key={i} src={p.url} alt="Photo de chantier" className="w-full h-24 object-cover rounded-lg" />
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-encre/60 text-center">Ce lien est personnel — ne le partagez pas.</p>
      </div>
    </div>
  );
}
