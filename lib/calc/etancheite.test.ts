import { describe, expect, it } from "vitest";
import { calculerRecouvrementAlu, calculerRecouvrementResine } from "./etancheite";

describe("calculerRecouvrementResine", () => {
  it("plot 40x40 cm, valeurs par défaut (hauteur relevé 15 cm)", () => {
    // ratio d'exemple dans la plage catalogue d'une résine liquide (ex. Alsan Flashing : 0.5-1.6 kg/m2)
    const resultat = calculerRecouvrementResine(40, 40, undefined, 1.2);
    // périmètre = 2*(40+40) = 160 cm ; surface = (160*15)/10000 = 0.24 m²
    expect(resultat.surface_m2).toBeCloseTo(0.24, 6);
    expect(resultat.quantite_kg).toBeCloseTo(0.288, 6);
  });

  it("hauteur de relevé personnalisée (25 cm au lieu du défaut 15 cm)", () => {
    const resultat = calculerRecouvrementResine(40, 40, 25, 1.2);
    // périmètre = 160 cm ; surface = (160*25)/10000 = 0.4 m²
    expect(resultat.surface_m2).toBeCloseTo(0.4, 6);
    expect(resultat.quantite_kg).toBeCloseTo(0.48, 6);
  });
});

describe("calculerRecouvrementAlu", () => {
  it("plot 80x60 cm, valeurs par défaut (marge de chevauchement 15 cm)", () => {
    const resultat = calculerRecouvrementAlu(80, 60);
    // périmètre = 2*(80+60) = 280 cm ; longueur = (280+15)/100 = 2.95 ml
    expect(resultat.longueur_necessaire_ml).toBeCloseTo(2.95, 6);
  });

  it("marge de chevauchement personnalisée (30 cm au lieu du défaut 15 cm)", () => {
    const resultat = calculerRecouvrementAlu(80, 60, 30);
    // périmètre = 280 cm ; longueur = (280+30)/100 = 3.1 ml
    expect(resultat.longueur_necessaire_ml).toBeCloseTo(3.1, 6);
  });
});
