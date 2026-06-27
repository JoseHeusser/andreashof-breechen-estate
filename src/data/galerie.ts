// Photos copied from the Airbnb listing (scraping/fotos/) that are not used
// elsewhere on the site. Grouped into a handful of categories for the
// gallery page.

export type GalleryCategory = "interior" | "bath" | "garden" | "around" | "plans" | "atmos";

export interface GalleryPhoto {
  src: string;
  alt: string;
  category: GalleryCategory;
  // Optional aspect hint for the masonry grid. Tall = portrait, wide = landscape.
  aspect?: "tall" | "wide" | "square";
}

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  // Interiors
  { src: "/galerie/salon-02.jpg",              alt: "Zweiter Salon",                                    category: "interior" },
  { src: "/galerie/kitchen-upper.jpg",         alt: "Küche im Obergeschoss",                            category: "interior" },
  { src: "/galerie/kitchen-ground-detail.jpg", alt: "Küche im Erdgeschoss — Detail",                    category: "interior" },
  { src: "/galerie/kitchen-second.jpg",        alt: "Zweite Küche",                                     category: "interior" },
  { src: "/galerie/dining-detail.jpg",         alt: "Esszimmer — Detail",                               category: "interior" },
  { src: "/galerie/user-mapping/interior-01.png", alt: "Innenraum",                                     category: "interior" },
  { src: "/galerie/user-mapping/interior-02.png", alt: "Innenraum",                                     category: "interior" },
  { src: "/galerie/user-mapping/interior-03-maenner-gespraechsecke.png", alt: "Männer-Gesprächsecke", category: "interior" },
  { src: "/galerie/user-mapping/interior-04-whatsapp-113538.png", alt: "Innenraum",                    category: "interior" },
  { src: "/galerie/user-mapping/interior-05-gesindekueche.png", alt: "Gesindeküche",                   category: "interior" },
  { src: "/galerie/user-mapping/interior-06-diskussionsrunde-damen.png", alt: "Diskussionsrunde Damen", category: "interior" },

  // Bathrooms
  { src: "/galerie/bath-01.jpg",        alt: "Vollbad",                                                 category: "bath" },
  { src: "/galerie/bath-02.jpg",        alt: "Vollbad",                                                 category: "bath" },
  { src: "/galerie/bath-clawfoot.jpg",  alt: "Landhausbadewanne",                                       category: "bath" },
  { src: "/galerie/bath-03.jpg",        alt: "Vollbad",                                                 category: "bath" },
  { src: "/galerie/bath-04.jpg",        alt: "Vollbad",                                                 category: "bath" },
  { src: "/galerie/bath-05.jpg",        alt: "Vollbad",                                                 category: "bath" },
  { src: "/galerie/bath-06.jpg",        alt: "Vollbad",                                                 category: "bath" },
  { src: "/galerie/bath-07.jpg",        alt: "Senioren Bad Barrierefrei",                               category: "bath" },
  { src: "/galerie/bath-half.jpg",      alt: "Gäste-WC",                                                category: "bath" },

  // Garden / Exterior
  { src: "/galerie/front-garden-01.jpg",     alt: "Vorgarten",                                          category: "garden" },
  { src: "/galerie/front-garden-02.jpg",     alt: "Vorgarten",                                          category: "garden" },
  { src: "/galerie/facade-garden-side.jpg",  alt: "Gutshaus von der Gartenseite",                       category: "garden", aspect: "wide" },
  { src: "/galerie/entrance-area.jpg",       alt: "Eingangsbereich mit Blick in den Garten",            category: "interior" },

  // Surroundings (the village + nearby lakes + Usedom + church)
  { src: "/galerie/breechen-village.jpg",   alt: "Breechen — das Dorf",                                 category: "around" },
  { src: "/galerie/breechen-lake.jpg",      alt: "Breechener Badesee — 5 Minuten",                      category: "around" },
  { src: "/galerie/guetzkow-church.jpg",    alt: "Kirche in Gützkow",                                   category: "around" },
  { src: "/galerie/guetzkow-lake.jpg",      alt: "Gützkower Badesee — 7 Minuten",                       category: "around" },
  { src: "/galerie/usedom-morning.jpg",     alt: "Usedom am Morgen",                                    category: "around" },
  { src: "/galerie/user-mapping/around-01-bus-haltestelle.png", alt: "Bushaltestelle im Dorf",         category: "around" },
  { src: "/galerie/user-mapping/around-02-getreidefeld-wildblumen.jpg", alt: "Getreidefeld mit Wildblumen bei Breechen", category: "around", aspect: "wide" },

  // Floor plans
  { src: "/galerie/floor-plan-ground.jpg",  alt: "Grundriss Erdgeschoss",                               category: "plans", aspect: "wide" },
  { src: "/galerie/floor-plan-second.jpg",  alt: "Grundriss Obergeschoss",                              category: "plans", aspect: "wide" },

  // Atmosphere
  { src: "/galerie/christmas.jpg",          alt: "Weihnachtsstimmung im Gutshaus",                      category: "atmos" },
  { src: "/galerie/detail-11.jpg",          alt: "Detail",                                              category: "atmos" },

  // === Photos from the host (WhatsApp set, May 2026) ===
  // Categorised by timestamp cluster based on a sampled review — re-bucket
  // by hand if any feel mis-classified.
  // -- interior (set tables, salons, attic with round window) --
  { src: "/galerie/whatsapp/wa-01.jpg", alt: "Gedeckter Tisch im Esszimmer",                            category: "interior" },
  { src: "/galerie/whatsapp/wa-02.jpg", alt: "Gedeckter Tisch im Esszimmer",                            category: "interior" },
  { src: "/galerie/whatsapp/wa-05.jpg", alt: "Gedeckter Tisch im Esszimmer",                            category: "interior" },
  { src: "/galerie/whatsapp/wa-06.jpg", alt: "Gedeckter Tisch im Esszimmer",                            category: "interior" },
  { src: "/galerie/whatsapp/wa-07.jpg", alt: "Gedeckter Tisch im Esszimmer",                            category: "interior" },
  { src: "/galerie/whatsapp/wa-08.jpg", alt: "Gedeckter Tisch im Esszimmer",                            category: "interior" },
  { src: "/galerie/whatsapp/wa-09.jpg", alt: "Gedeckter Tisch im Esszimmer",                            category: "interior" },
  { src: "/galerie/whatsapp/wa-10.jpg", alt: "Wohnraum mit Schaukelstühlen",                            category: "interior" },
  { src: "/galerie/whatsapp/wa-11.jpg", alt: "Wohnraum mit Schaukelstühlen",                            category: "interior" },
  { src: "/galerie/whatsapp/wa-12.jpg", alt: "Wohnraum mit Schaukelstühlen",                            category: "interior" },
  { src: "/galerie/whatsapp/wa-13.jpg", alt: "Wohnraum mit Schaukelstühlen",                            category: "interior" },
  { src: "/galerie/whatsapp/wa-15.jpg", alt: "Wohnraum mit Schaukelstühlen",                            category: "interior" },
  { src: "/galerie/whatsapp/wa-18.jpg", alt: "Salon mit gustavianischen Möbeln",                        category: "interior" },
  { src: "/galerie/whatsapp/wa-70.jpg", alt: "Mansardenzimmer mit Rundfenster",                         category: "interior" },

  // -- around (volleyball, river sunset, boat, fields) --
  { src: "/galerie/whatsapp/wa-19.jpg", alt: "Beach-Volleyball am See",                                  category: "around" },
  { src: "/galerie/whatsapp/wa-20.jpg", alt: "Nach Mikes Bootsausflug mit Peenefeeling Bootsverleih Jarmen, nur 5 Minuten vom Gutshaus", category: "around" },
  { src: "/galerie/whatsapp/wa-21.jpg", alt: "Nach Mikes Bootsausflug mit Peenefeeling Bootsverleih Jarmen, nur 5 Minuten vom Gutshaus", category: "around" },
  { src: "/galerie/whatsapp/wa-22.jpg", alt: "Beach-Volleyball am See",                                  category: "around" },
  { src: "/galerie/whatsapp/wa-23.jpg", alt: "Nach Mikes Bootsausflug mit Peenefeeling Bootsverleih Jarmen, nur 5 Minuten vom Gutshaus", category: "around" },
  { src: "/galerie/whatsapp/wa-24.jpg", alt: "Nach Mikes Bootsausflug mit Peenefeeling Bootsverleih Jarmen, nur 5 Minuten vom Gutshaus", category: "around" },
  { src: "/galerie/whatsapp/wa-25.jpg", alt: "Beach-Volleyball am See",                                  category: "around" },
  { src: "/galerie/whatsapp/wa-26.jpg", alt: "Stimmung an der Peene nach Mikes Bootsausflug mit Peenefeeling Bootsverleih Jarmen, nur 5 Minuten vom Gutshaus", category: "around" },
  { src: "/galerie/whatsapp/wa-27.jpg", alt: "Sonnenuntergang an der Peene",                            category: "around" },
  { src: "/galerie/whatsapp/wa-28.jpg", alt: "Sonnenuntergang an der Peene",                            category: "around" },
  { src: "/galerie/whatsapp/wa-29.jpg", alt: "Sonnenuntergang an der Peene",                            category: "around" },
  { src: "/galerie/whatsapp/wa-30.jpg", alt: "Sonnenuntergang an der Peene",                            category: "around" },
  { src: "/galerie/whatsapp/wa-31.jpg", alt: "Sonnenuntergang an der Peene nach Mikes Bootsausflug mit Peenefeeling Bootsverleih Jarmen, nur 5 Minuten vom Gutshaus", category: "around" },
  { src: "/galerie/whatsapp/wa-32.jpg", alt: "Sonnenuntergang an der Peene nach Mikes Bootsausflug mit Peenefeeling Bootsverleih Jarmen, nur 5 Minuten vom Gutshaus", category: "around" },
  { src: "/galerie/whatsapp/wa-33.jpg", alt: "Sonnenuntergang an der Peene",                            category: "around" },
  { src: "/galerie/whatsapp/wa-34.jpg", alt: "Abendstimmung an der Peene nach Mikes Bootsausflug mit Peenefeeling Bootsverleih Jarmen, nur 5 Minuten vom Gutshaus", category: "around" },
  { src: "/galerie/whatsapp/wa-35.jpg", alt: "Sonnenuntergang an der Peene nach Mikes Bootsausflug mit Peenefeeling Bootsverleih Jarmen, nur 5 Minuten vom Gutshaus", category: "around" },
  { src: "/galerie/whatsapp/wa-36.jpg", alt: "Sonnenuntergang an der Peene",                            category: "around" },
  { src: "/galerie/whatsapp/wa-37.jpg", alt: "Bootsfahrt auf der Peene nach Mikes Bootsausflug mit Peenefeeling Bootsverleih Jarmen, nur 5 Minuten vom Gutshaus", category: "around" },
  { src: "/galerie/whatsapp/wa-38.jpg", alt: "Bootsfahrt auf der Peene nach Mikes Bootsausflug mit Peenefeeling Bootsverleih Jarmen, nur 5 Minuten vom Gutshaus", category: "around" },
  { src: "/galerie/whatsapp/wa-39.jpg", alt: "Bootsfahrt auf der Peene nach Mikes Bootsausflug mit Peenefeeling Bootsverleih Jarmen, nur 5 Minuten vom Gutshaus", category: "around" },
  { src: "/galerie/whatsapp/wa-40.jpg", alt: "Bootsfahrt auf der Peene",                                category: "around" },
  { src: "/galerie/whatsapp/wa-41.jpg", alt: "Felder bei Jarmen nach Mikes Bootsausflug mit Peenefeeling Bootsverleih Jarmen, nur 5 Minuten vom Gutshaus", category: "around" },
  { src: "/galerie/whatsapp/wa-42.jpg", alt: "Felder bei Jarmen nach Mikes Bootsausflug mit Peenefeeling Bootsverleih Jarmen, nur 5 Minuten vom Gutshaus", category: "around" },
  { src: "/galerie/whatsapp/wa-43.jpg", alt: "Felder um Breechen",                                      category: "around" },
  { src: "/galerie/whatsapp/wa-44.jpg", alt: "Felder um Breechen",                                      category: "around" },
  { src: "/galerie/whatsapp/wa-45.jpg", alt: "Felder um Breechen",                                      category: "around" },
  { src: "/galerie/whatsapp/wa-46.jpg", alt: "Felder um Breechen",                                      category: "around" },
  { src: "/galerie/whatsapp/wa-48.jpg", alt: "Umgebung",                                                category: "around" },
  { src: "/galerie/whatsapp/wa-50.jpg", alt: "Umgebung",                                                category: "around" },
  { src: "/galerie/whatsapp/wa-51.jpg", alt: "Bootsausflug auf der Peene nach Mikes Bootsausflug mit Peenefeeling Bootsverleih Jarmen, nur 5 Minuten vom Gutshaus", category: "around" },
  { src: "/galerie/whatsapp/wa-52.jpg", alt: "Umgebung",                                                category: "around" },
  { src: "/galerie/whatsapp/wa-53.jpg", alt: "Abendstimmung an der Peene nach Mikes Bootsausflug mit Peenefeeling Bootsverleih Jarmen, nur 5 Minuten vom Gutshaus", category: "around" },
  { src: "/galerie/whatsapp/wa-54.jpg", alt: "Umgebung",                                                category: "around" },
  { src: "/galerie/whatsapp/wa-64.jpg", alt: "Umgebung",                                                category: "around" },
  { src: "/galerie/whatsapp/wa-65.jpg", alt: "Umgebung",                                                category: "around" },
  { src: "/galerie/whatsapp/wa-68.jpg", alt: "Umgebung",                                                category: "around" },

  // -- atmosphere (night facade, misc) --
  { src: "/galerie/whatsapp/wa-49.jpg", alt: "Andreashof Breechen",                                     category: "atmos" },
  { src: "/galerie/whatsapp/wa-55.jpg", alt: "Andreashof Breechen",                                     category: "atmos" },
  { src: "/galerie/whatsapp/wa-56.jpg", alt: "Gutshaus bei Nacht",                                      category: "atmos" },
  { src: "/galerie/whatsapp/wa-57.jpg", alt: "Andreashof Breechen",                                     category: "atmos" },
  { src: "/galerie/whatsapp/wa-59.jpg", alt: "Andreashof Breechen",                                     category: "atmos" },
  { src: "/galerie/whatsapp/wa-60.jpg", alt: "Andreashof Breechen",                                     category: "atmos" },
  { src: "/galerie/whatsapp/wa-62.jpg", alt: "Andreashof Breechen",                                     category: "atmos" },
  { src: "/galerie/whatsapp/wa-69.jpg", alt: "Andreashof Breechen",                                     category: "atmos" },
  { src: "/galerie/whatsapp/wa-78.jpg", alt: "Andreashof Breechen",                                     category: "atmos" },
];
