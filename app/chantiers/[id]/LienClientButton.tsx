"use client";

import { useState } from "react";
import { CircleCheck } from "@/components/icons";
import { Button } from "@/components/ui/Button";

export default function LienClientButton({ token }: { token: string }) {
  const [copie, setCopie] = useState(false);

  function copier() {
    const url = `${window.location.origin}/espace-client/${token}`;
    navigator.clipboard.writeText(url);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  }

  return (
    <Button variante="secondaire" pleineLargeur icone={copie ? CircleCheck : undefined} onClick={copier}>
      {copie ? "Lien copié" : "Copier le lien de suivi client"}
    </Button>
  );
}
