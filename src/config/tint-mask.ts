/**
 * MASKER VOOR DE TINTKIEZER (Window Tinting-kaart)
 *
 * ⚠️ Deze coördinaten zijn met de hand afgestemd op /public/media/diensten/window-tinting.png
 * (1586 × 992 px). Vervang je die foto, of wijzigt de uitsnede, stem de paden dan opnieuw af.
 * Werkwijze: open de foto in een editor, lees de pixelposities van de hoeken van elke ruit
 * af en zet ze hieronder. De SVG gebruikt dezelfde viewBox en `slice` (= object-cover),
 * dus pixels in de foto = eenheden hier.
 *
 * Alleen de achterste zijruiten worden getint. Voorruit en voorste zijruiten blijven
 * bewust buiten het masker (in Nederland niet zomaar toegestaan). Een achterruit is op
 * deze foto niet zichtbaar; voeg hem hier toe als een nieuwe foto hem wel toont.
 */
export const tintMask = {
  width: 1586,
  height: 992,
  paths: [
    // Achterste driehoekige zijruit (links), gebogen bovenrand langs de dakrand.
    "M 112 455 Q 300 232 545 168 L 700 562 L 218 626 Q 152 560 112 455 Z",
    // Ruit in het achterportier, tussen de B- en C-stijl.
    "M 574 160 L 946 150 L 1086 515 L 730 560 Z",
  ],
};
