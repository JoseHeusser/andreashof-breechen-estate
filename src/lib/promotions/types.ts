/**
 * A promotion shown in the "Aktuelle Angebote" drawer on the website.
 * Everything is free text that Andrea writes in the admin — this does not
 * change the price calculation (that is what the discount offers in the
 * Preise tab are for).
 */
export interface Promotion {
  id: string;
  active: boolean;
  /** Small label above the title, e.g. "Angebot für Sofortbucher". */
  badge: string;
  title: string;
  /** Free-form date line, e.g. "17.–20. Dezember 2026". */
  dates: string;
  description: string;
  /** Free-form price line, e.g. "4 Nächte, ab 10 Personen: 1.000 €". */
  price: string;
  /** Optional image path from /public, e.g. "/galerie/salon-02.jpg". */
  image: string;
  /** YYYY-MM-DD; shown from this day on. Empty = immediately. */
  visibleFrom: string;
  /** YYYY-MM-DD; shown up to and including this day. Empty = no end. */
  visibleUntil: string;
  sortOrder?: number;
}
