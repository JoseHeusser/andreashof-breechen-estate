/** Stable ids — must match `partners.items[].id` in locale files. */
export type PartnerId =
  | "peenefeeling"
  | "gran-gusto"
  | "steffi-wolf"
  | "blumenecke-merklein";

export interface PartnerPhoto {
  src: string;
  alt: string;
}

export const PARTNER_PHOTOS: Record<PartnerId, PartnerPhoto[]> = {
  peenefeeling: [
    {
      src: "/galerie/whatsapp/wa-39.jpg",
      alt: "Bootsfahrt auf der Peene mit Peenefeeling Bootsverleih Jarmen",
    },
    {
      src: "/galerie/whatsapp/wa-53.jpg",
      alt: "Motorboot am Peene-Ufer bei Peenefeeling Jarmen",
    },
    {
      src: "/galerie/whatsapp/wa-24.jpg",
      alt: "Motorboot am Steg — Peenefeeling Bootsverleih Jarmen",
    },
  ],
  "steffi-wolf": [],
  "blumenecke-merklein": [],
  "gran-gusto": [
    {
      src: "/galerie/partner/catering-01.jpg",
      alt: "Festlich gedeckter Esstisch mit Blumen und Kerzen — Gran Gusto Catering",
    },
    {
      src: "/galerie/partner/catering-02.jpg",
      alt: "Gedeckter Festtisch im Esszimmer — Gran Gusto Catering",
    },
    {
      src: "/galerie/partner/catering-03.jpg",
      alt: "Buffet und festlich gedeckter Tisch — Gran Gusto Catering",
    },
  ],
};
