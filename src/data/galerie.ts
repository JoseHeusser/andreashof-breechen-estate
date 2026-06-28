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
  { src: "/galerie/user-mapping/interior-07-mansarde-salon.jpg",           alt: "Mansardenzimmer mit Rundfenster und gustavianischen Möbeln", category: "interior" },
  { src: "/galerie/user-mapping/interior-08-mansarde-sofa.jpg",             alt: "Gemütliche Mansardenecke mit antikem Sofa",                  category: "interior" },
  { src: "/galerie/user-mapping/interior-09-mansarde-sitzecke.jpg",          alt: "Sitzecke im Mansardenzimmer mit Ovalfenster",                 category: "interior" },
  { src: "/galerie/user-mapping/interior-10-schlafzimmer-gruenes-bett.jpg",  alt: "Schlafzimmer mit grünem Holzbett und Fischgrätparkett",       category: "interior" },
  { src: "/galerie/user-mapping/interior-11-schlafzimmer-fischgraet.jpg",     alt: "Klassisches Schlafzimmer mit Fischgrätparkett",               category: "interior" },
  { src: "/galerie/user-mapping/interior-12-schlafzimmer-rustikal.jpg",      alt: "Geräumiges rustikales Schlafzimmer",                          category: "interior" },
  { src: "/galerie/user-mapping/interior-14-yoga-dachgeschoss.jpg",          alt: "Yoga-Raum im ausgebauten Dachgeschoss",                       category: "interior" },
  { src: "/galerie/user-mapping/interior-15-giebelfenster.jpg",              alt: "Kunstvoll geschwungene Giebelfenster",                        category: "interior" },
  { src: "/galerie/user-mapping/interior-16-dachboden-yoga.jpg",             alt: "Ausgebauter Dachboden mit sichtbaren Holzbalken",             category: "interior" },
  { src: "/galerie/user-mapping/interior-17-yoga-matten-regal.jpg",          alt: "Yoga-Raum mit Mattenregal und Holzgebälk",                    category: "interior" },

  // Bathrooms
  { src: "/galerie/bath-01.jpg",        alt: "Vollbad",                                                 category: "bath" },
  { src: "/galerie/bath-02.jpg",        alt: "Vollbad",                                                 category: "bath" },
  { src: "/galerie/bath-clawfoot.jpg",  alt: "Blick vom Damenzimmer ins Bad",                           category: "bath" },
  { src: "/galerie/bath-03.jpg",        alt: "Landhaus Badewanne",                                      category: "bath" },
  { src: "/galerie/bath-04.jpg",        alt: "Vollbad",                                                 category: "bath" },
  { src: "/galerie/bath-05.jpg",        alt: "Vollbad",                                                 category: "bath" },
  { src: "/galerie/bath-06.jpg",        alt: "Vollbad",                                                 category: "bath" },
  { src: "/galerie/bath-07.jpg",        alt: "Senioren Bad Barrierefrei",                               category: "bath" },
  { src: "/galerie/bath-half.jpg",      alt: "Gäste-WC",                                                category: "bath" },

  // Garden / Exterior
  { src: "/galerie/front-garden-01.jpg",     alt: "Vorgarten",                                          category: "garden" },
  { src: "/galerie/front-garden-02.jpg",     alt: "Vorgarten",                                          category: "garden" },
  { src: "/galerie/entrance-area.jpg",       alt: "Eingangsbereich mit Blick in den Garten",            category: "interior" },
  { src: "/galerie/user-mapping/garden-03-rosenstrauch.jpg",        alt: "Blühender Strauch",                                          category: "garden" },
  { src: "/galerie/user-mapping/garden-04-pavillon-lounge.jpg",     alt: "Garten mit Pavillon und roten Liegen",                       category: "garden" },
  { src: "/galerie/user-mapping/garden-05-pavillon-terrasse.jpg",   alt: "Sitzbereich unter dem Gartenpavillon",                       category: "garden" },
  { src: "/galerie/user-mapping/garden-06-lange-tafel-pergola.jpg", alt: "Festlich gedeckte lange Tafel unter der Grünpergola",            category: "garden" },
  { src: "/galerie/user-mapping/garden-07-lange-tafel-detail.jpg",   alt: "Lange Gartentafel mit Blumenarrangement",                   category: "garden" },
  { src: "/galerie/user-mapping/garden-08-fest-bewirtung.jpg",      alt: "Gartenfest mit langen Tafeln und Biertischen",                category: "garden" },
  { src: "/galerie/user-mapping/garden-09-stehtisch-deko.jpg",      alt: "Dekorierter Stehtisch im Garten",                            category: "garden" },
  { src: "/galerie/user-mapping/garden-10-schneegloeckchen.jpg",    alt: "Schneeglöckchen im Frühling",                                category: "garden" },

  // Surroundings (the village + nearby lakes + Usedom + church)
  { src: "/galerie/breechen-village.jpg",   alt: "Breechen — das Dorf",                                 category: "around" },
  { src: "/galerie/breechen-lake.jpg",      alt: "Breechener Badesee — 5 Minuten",                      category: "around" },
  { src: "/galerie/guetzkow-church.jpg",    alt: "Kirche in Gützkow",                                   category: "around" },
  { src: "/galerie/guetzkow-lake.jpg",      alt: "Gützkower Badesee — 7 Minuten",                       category: "around" },
  { src: "/galerie/usedom-morning.jpg",     alt: "Usedom am Morgen",                                    category: "around" },
  { src: "/galerie/user-mapping/around-01-bus-haltestelle.png", alt: "Bushaltestelle im Dorf",         category: "around" },
  { src: "/galerie/user-mapping/around-02-getreidefeld-wildblumen.jpg", alt: "Getreidefeld mit Wildblumen bei Breechen", category: "around", aspect: "wide" },
  { src: "/galerie/user-mapping/around-03-fahrrad-getreidefeld.jpg",    alt: "Fahrrad vor dem Getreidefeld in der Umgebung",              category: "around", aspect: "wide" },
  { src: "/galerie/user-mapping/around-04-getreidefeld-kornblumen.jpg", alt: "Goldenes Getreidefeld mit Kornblumen",                        category: "around", aspect: "wide" },
  { src: "/galerie/user-mapping/around-05-biberdamm.jpg",              alt: "Biberdamm an einem Bach in der Umgebung",                   category: "around" },

  // Floor plans
  { src: "/galerie/floor-plan-ground.jpg",  alt: "Grundriss Erdgeschoss",                               category: "plans", aspect: "wide" },
  { src: "/galerie/floor-plan-second.jpg",  alt: "Grundriss Obergeschoss",                              category: "plans", aspect: "wide" },

  // Atmosphere
  { src: "/galerie/christmas.jpg",          alt: "Weihnachtsstimmung im Gutshaus",                      category: "atmos" },
  { src: "/galerie/detail-11.jpg",          alt: "Detail",                                              category: "atmos" },
  { src: "/galerie/user-mapping/atmos-01-spanferkel-garten.jpg",    alt: "Spanferkel am Spieß im Garten vor dem Gutshaus", category: "atmos" },
  { src: "/galerie/user-mapping/atmos-02-abend-pavillon.jpg",       alt: "Abendstimmung im Garten mit Kerzen und Pavillon", category: "atmos" },
  { src: "/galerie/user-mapping/atmos-03-feuer-pavillon.jpg",       alt: "Garten bei Nacht mit Lagerfeuer und Pavillon",   category: "atmos" },
  { src: "/galerie/user-mapping/atmos-04-stehtisch-kerzen.jpg",     alt: "Festlich gedeckter Stehtisch bei Abenddämmerung", category: "atmos" },
  { src: "/galerie/user-mapping/atmos-05-kerzenleuchter-garten.jpg", alt: "Kerzenleuchter auf der Gartentafel bei Nacht",  category: "atmos" },
  { src: "/galerie/user-mapping/atmos-06-pferde-strand-abend.jpg",  alt: "Ausritt am Strand bei Abendlicht",               category: "atmos", aspect: "tall" },
  { src: "/galerie/user-mapping/atmos-07-pferde-strand-blick.jpg",  alt: "Blick vom Pferd auf den Strand",                 category: "atmos", aspect: "wide" },
  { src: "/galerie/user-mapping/atmos-08-pferde-sonnenuntergang.jpg", alt: "Pferde am Strand bei Sonnenuntergang",         category: "atmos", aspect: "wide" },
  { src: "/galerie/user-mapping/atmos-09-pferd-sonnenuntergang.jpg", alt: "Reiterin im Sonnenuntergang am Meer",           category: "atmos", aspect: "tall" },
  { src: "/galerie/user-mapping/atmos-10-pferde-strand-nahe.jpg",   alt: "Pferde am Strand mit Blick aufs Meer",           category: "atmos", aspect: "wide" },
  { src: "/galerie/user-mapping/atmos-11.jpg", alt: "Stimmung am Andreashof Breechen", category: "atmos" },
  { src: "/galerie/user-mapping/atmos-12.jpg", alt: "Stimmung am Andreashof Breechen", category: "atmos" },
  { src: "/galerie/user-mapping/atmos-13.jpg", alt: "Stimmung am Andreashof Breechen", category: "atmos" },
  { src: "/galerie/user-mapping/atmos-14.jpg", alt: "Stimmung am Andreashof Breechen", category: "atmos" },
  { src: "/galerie/user-mapping/atmos-15.jpg", alt: "Stimmung am Andreashof Breechen", category: "atmos" },
  { src: "/galerie/user-mapping/atmos-16.jpg", alt: "Stimmung am Andreashof Breechen", category: "atmos" },
  { src: "/galerie/user-mapping/atmos-17.jpg", alt: "Stimmung am Andreashof Breechen", category: "atmos" },
  { src: "/galerie/user-mapping/atmos-18.jpg", alt: "Stimmung am Andreashof Breechen", category: "atmos" },

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
  { src: "/galerie/whatsapp/wa-18.jpg", alt: "Salon mit gustavianischen Möbeln",                        category: "interior" },
  { src: "/galerie/whatsapp/wa-70.jpg", alt: "Mansardenzimmer mit Rundfenster",                         category: "interior" },

  // -- around (volleyball, river sunset, boat, fields) --
  { src: "/galerie/whatsapp/wa-22.jpg", alt: "Beach-Volleyball am See",                                  category: "around" },
  { src: "/galerie/whatsapp/wa-24.jpg", alt: "Nach Mikes Bootsausflug mit Peenefeeling Bootsverleih Jarmen, nur 5 Minuten vom Gutshaus", category: "around" },
  { src: "/galerie/whatsapp/wa-25.jpg", alt: "Beach-Volleyball am See",                                  category: "around" },
  { src: "/galerie/whatsapp/wa-27.jpg", alt: "Sonnenuntergang an der Peene",                            category: "around" },
  { src: "/galerie/whatsapp/wa-36.jpg", alt: "Sonnenuntergang an der Peene",                            category: "around" },
  { src: "/galerie/whatsapp/wa-39.jpg", alt: "Bootsfahrt auf der Peene nach Mikes Bootsausflug mit Peenefeeling Bootsverleih Jarmen, nur 5 Minuten vom Gutshaus", category: "around" },
  { src: "/galerie/whatsapp/wa-40.jpg", alt: "Bootsfahrt auf der Peene",                                category: "around" },
  { src: "/galerie/whatsapp/wa-42.jpg", alt: "Felder bei Jarmen nach Mikes Bootsausflug mit Peenefeeling Bootsverleih Jarmen, nur 5 Minuten vom Gutshaus", category: "around" },
  { src: "/galerie/whatsapp/wa-43.jpg", alt: "Felder um Breechen",                                      category: "around" },
  { src: "/galerie/whatsapp/wa-44.jpg", alt: "Felder um Breechen",                                      category: "around" },
  { src: "/galerie/whatsapp/wa-45.jpg", alt: "Felder um Breechen",                                      category: "around" },
  { src: "/galerie/whatsapp/wa-46.jpg", alt: "Felder um Breechen",                                      category: "around" },
  { src: "/galerie/whatsapp/wa-48.jpg", alt: "Umgebung",                                                category: "around" },
  { src: "/galerie/whatsapp/wa-52.jpg", alt: "Umgebung",                                                category: "around" },
  { src: "/galerie/whatsapp/wa-53.jpg", alt: "Abendstimmung an der Peene nach Mikes Bootsausflug mit Peenefeeling Bootsverleih Jarmen, nur 5 Minuten vom Gutshaus", category: "around" },
  { src: "/galerie/whatsapp/wa-64.jpg", alt: "Umgebung",                                                category: "around" },
  { src: "/galerie/whatsapp/wa-65.jpg", alt: "Umgebung",                                                category: "around" },
  { src: "/galerie/whatsapp/wa-68.jpg", alt: "Umgebung",                                                category: "around" },

  // -- atmosphere (night facade, misc) --
  { src: "/galerie/whatsapp/wa-49.jpg", alt: "Andreashof Breechen",                                     category: "atmos" },
  { src: "/galerie/whatsapp/wa-55.jpg", alt: "Andreashof Breechen",                                     category: "atmos" },
  { src: "/galerie/whatsapp/wa-56.jpg", alt: "Peenebrücke",                                             category: "atmos" },
  { src: "/galerie/whatsapp/wa-57.jpg", alt: "Sunset Peenebrücke",                                      category: "atmos" },
  { src: "/galerie/whatsapp/wa-59.jpg", alt: "Usedom Strand",                                           category: "atmos" },
  { src: "/galerie/whatsapp/wa-60.jpg", alt: "Andreashof Breechen",                                     category: "atmos" },
  { src: "/galerie/whatsapp/wa-69.jpg", alt: "Andreashof Breechen",                                     category: "atmos" },
  { src: "/galerie/whatsapp/wa-78.jpg", alt: "Andreashof Breechen",                                     category: "atmos" },
];
