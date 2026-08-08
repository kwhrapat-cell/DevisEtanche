"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const TYPES = [
  { value: "plot" , label: "Plot (clim, PV...)", unite: "unite" },
  {value: "releve", label: "Relevé équerre/alu", unite: "ml" },
  {value: "jardiniere", label: "Jardinière", unite: "m2" },
  {value: "skydome", label: "Skydome", unite: "unite" },
];

export default function AjouterElementForm({ zoneId }: { zoneId: string }) {
    const [ouvert, setOuvert] = useState(false);
    const [type, setType] = useState(TYPES[0].value);
    const [description, setDescription] = useState("");
    const [quantite, setQuantite] = useState("1");
    const [envoi, setEnvoi] = useState(false);
    const router = useRouter();
    
    const uniteActuelle = TYPES.find((t) => t.value === type)?.unite ?? "unite";

    async function ajouter() {
        setEnvoi(true);
        const supabase = createClient();
        await supabase.from("elements_zone").insert({
            zone_id: zoneId,
            type,
            description: description || null,
            quantite: Number(quantite) || 1,
            unite: uniteActuelle,
          });
          setEnvoi(false);
          setOuvert(false);
          setDescription("");
          setQuantite("1");
          router.refresh();
        }

        if (!ouvert) {
            return (
               <button
                 onClick={() => setOuvert(true)}
                 className="text-xs text-left px-3 py-2 text-slate-600 hover:bg-slate-100 w-full"
               >
                 + Ajouter un élément
                </button>
              );
        }

        return (
            <div className="p-3 border-t border-slate-200 flex flex-col gap-2">
              <select value={type} onChange={(e) => setType(e.target.value)} className="text-sm border rounded px-2 py-1">
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
            </select>
            <input
              type="text"
              placeholder="Description (optionnel)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            />
            <span className="text-xs text-slate-400">Unité : {uniteActuelle}</span>
            <div className="flex gap-2">
            <button onClick={ajouter} disabled={envoi} className="text-sm bg-blue-600 text-white rounded px-3 py-1">
              {envoi ? "..." : "Ajouter"}
            </button>
            <button onClick={() => setOuvert(false)} className="text-sm text-slate-400">
              Annuler
            </button>
          </div>
        </div>
      );
}
            

           
        
        



        
    
