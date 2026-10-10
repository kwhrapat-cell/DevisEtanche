import { Droplet } from "@/components/icons";
import { cn } from "@/lib/utils";

/** Logo DevisEtanche. `clair` = sur fond foncé (sidebar, bandeau espace client). */
export default function Logo({ clair = false, avecNom = true, className }: { clair?: boolean; avecNom?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-white shadow-sm">
        <Droplet size={18} strokeWidth={2.25} />
      </span>
      {avecNom && (
        <span className={cn("text-lg font-bold tracking-tight", clair ? "text-white" : "text-encre")}>
          Devis<span className="text-accent">Etanche</span>
        </span>
      )}
    </span>
  );
}
