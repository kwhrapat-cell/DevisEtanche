import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card", className)} {...props} />;
}

/** En-tête de carte : titre à gauche, action (lien « Voir tout », bouton…) à droite. */
export function CardHeader({ titre, sousTitre, action, className }: { titre: ReactNode; sousTitre?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-4 flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight text-encre">{titre}</h2>
        {sousTitre && <p className="mt-0.5 text-sm text-encre/60">{sousTitre}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
