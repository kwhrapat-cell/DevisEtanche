export default function TopBar({ titre, sousTitre }: { titre: string; sousTitre?: string }) {
  return (
    <div className="flex items-center justify-between px-8 py-6 border-b border-ligne">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ardoise">{titre}</h1>
        {sousTitre && <p className="text-sm text-ardoise/50 mt-1">{sousTitre}</p>}
      </div>
      <input
        placeholder="Rechercher un chantier, un client, un devis…"
        className="hidden md:block w-80 border border-ligne rounded-lg px-3 py-2 text-sm bg-white"
      />
    </div>
  );
}
