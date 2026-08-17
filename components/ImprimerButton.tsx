"use client";

export default function ImprimerButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-rouille text-white text-sm font-semibold px-4 py-2 rounded-lg"
    >
      Exporter en PDF
    </button>
  );
}
