import { GerichtKategorie, Rolle, TischBereich, Wochentag } from "@/generated/prisma/enums";
import { validateZeitfenster } from "@/lib/oeffnungszeiten";
import { prisma } from "@/lib/prisma";

const standorte = [
  { id: "kreuzberg", name: "Kreuzberg" },
  { id: "spandau", name: "Spandau" },
] as const;

const manager = [
  {
    id: "manager-kreuzberg-giuseppe",
    name: "Giuseppe",
    rolle: Rolle.manager,
    standortId: "kreuzberg",
  },
  {
    id: "manager-spandau-renate",
    name: "Renate",
    rolle: Rolle.manager,
    standortId: "spandau",
  },
] as const;

const inhaber = {
  id: "inhaber-marcello",
  name: "Marco",
  rolle: Rolle.inhaber,
  standortId: "kreuzberg",
} as const;

const bedienungen = [
  { id: "bedienung-sofia", name: "Sofia", rolle: Rolle.bedienung, standortId: null },
  { id: "bedienung-nico", name: "Nico", rolle: Rolle.bedienung, standortId: null },
  { id: "bedienung-fatima", name: "Fatima", rolle: Rolle.bedienung, standortId: null },
] as const;

export const anekdotenGaeste = [
  {
    id: "gast-anekdote-herr-kellner",
    name: "Herr Kellner",
    telefon: "+49 30 0000 0101",
    telefonNormalisiert: "+493000000101",
    besuchszaehler: 0,
    notizen: "Bei Reservierungen den Standort ausdrücklich bestätigen.",
  },
  {
    id: "gast-anekdote-herr-bergmann",
    name: "Herr Bergmann",
    telefon: "+49 30 0000 0102",
    telefonNormalisiert: "+493000000102",
    besuchszaehler: 10,
    notizen: "Kommt fast jede Woche. Bevorzugt Tisch 7 und Tagliatelle al Ragù.",
  },
] as const;

export const demoGaeste = [
  { id: "gast-demo-00", name: "Demo-Gast Alessia Romano", telefon: "+49 30 0000 0200", telefonNormalisiert: "+493000000200", besuchszaehler: 0 },
  { id: "gast-demo-01", name: "Demo-Gast Ben Wagner", telefon: "+49 30 0000 0201", telefonNormalisiert: "+493000000201", besuchszaehler: 1 },
  { id: "gast-demo-02", name: "Demo-Gast Carla Neumann", telefon: "+49 30 0000 0202", telefonNormalisiert: "+493000000202", besuchszaehler: 2 },
  { id: "gast-demo-03", name: "Demo-Gast Davide Conti", telefon: "+49 30 0000 0203", telefonNormalisiert: "+493000000203", besuchszaehler: 3 },
  { id: "gast-demo-04", name: "Demo-Gast Elena Fischer", telefon: "+49 30 0000 0204", telefonNormalisiert: "+493000000204", besuchszaehler: 4 },
  { id: "gast-demo-05", name: "Demo-Gast Fabio Moretti", telefon: "+49 30 0000 0205", telefonNormalisiert: "+493000000205", besuchszaehler: 5 },
  { id: "gast-demo-06", name: "Demo-Gast Greta Schulz", telefon: "+49 30 0000 0206", telefonNormalisiert: "+493000000206", besuchszaehler: 6 },
  { id: "gast-demo-07", name: "Demo-Gast Hassan Yilmaz", telefon: "+49 30 0000 0207", telefonNormalisiert: "+493000000207", besuchszaehler: 7 },
  { id: "gast-demo-08", name: "Demo-Gast Isabel König", telefon: "+49 30 0000 0208", telefonNormalisiert: "+493000000208", besuchszaehler: 8 },
  { id: "gast-demo-09", name: "Demo-Gast Luca Bianchi", telefon: "+49 30 0000 0209", telefonNormalisiert: "+493000000209", besuchszaehler: 9 },
] as const;

export const demoReservierungen = [
  { id: "reservierung-demo-kreuzberg-00", gastId: "gast-demo-00", datum: "2026-08-01", uhrzeitMinute: 18 * 60, personenzahl: 2, standortId: "kreuzberg", tischId: "tisch-kreuzberg-9", erstelltVonId: "manager-kreuzberg-giuseppe" },
  { id: "reservierung-demo-spandau-01", gastId: "gast-demo-01", datum: "2026-08-01", uhrzeitMinute: 18 * 60, personenzahl: 2, standortId: "spandau", tischId: "tisch-spandau-9", erstelltVonId: "manager-spandau-renate" },
  { id: "reservierung-demo-kreuzberg-04", gastId: "gast-demo-04", datum: "2026-08-02", uhrzeitMinute: 19 * 60, personenzahl: 4, standortId: "kreuzberg", tischId: "tisch-kreuzberg-10", erstelltVonId: "manager-kreuzberg-giuseppe" },
  { id: "reservierung-demo-spandau-05", gastId: "gast-demo-05", datum: "2026-08-02", uhrzeitMinute: 19 * 60, personenzahl: 4, standortId: "spandau", tischId: "tisch-spandau-10", erstelltVonId: "manager-spandau-renate" },
  { id: "reservierung-demo-kreuzberg-08", gastId: "gast-demo-08", datum: "2026-08-06", uhrzeitMinute: 20 * 60, personenzahl: 2, standortId: "kreuzberg", tischId: "tisch-kreuzberg-11", erstelltVonId: "manager-kreuzberg-giuseppe" },
  { id: "reservierung-demo-spandau-09", gastId: "gast-demo-09", datum: "2026-08-06", uhrzeitMinute: 19 * 60, personenzahl: 2, standortId: "spandau", tischId: "tisch-spandau-11", erstelltVonId: "manager-spandau-renate" },
] as const;

const oeffnungszeiten = [
  ...[
    Wochentag.dienstag,
    Wochentag.mittwoch,
    Wochentag.donnerstag,
    Wochentag.freitag,
    Wochentag.samstag,
    Wochentag.sonntag,
  ].map((wochentag) => ({
    standortId: "kreuzberg",
    wochentag,
    oeffnetMinute: 17 * 60,
    schliesstMinute: 23 * 60,
  })),
  ...[
    Wochentag.donnerstag,
    Wochentag.freitag,
    Wochentag.samstag,
    Wochentag.sonntag,
  ].map((wochentag) => ({
    standortId: "spandau",
    wochentag,
    oeffnetMinute: 17 * 60,
    schliesstMinute: 22 * 60,
  })),
];

const tische = [
  ...Array.from({ length: 16 }, (_, index) => ({
    id: `tisch-kreuzberg-${index + 1}`,
    nummer: index + 1,
    kapazitaet: [2, 4, 4, 6][index % 4],
    bereich: index >= 13 ? TischBereich.terrasse : TischBereich.innen,
    verfuegbar: true,
    rasterZeile: Math.floor(index / 4) + 1,
    rasterSpalte: (index % 4) + 1,
    standortId: "kreuzberg",
    vorlaeufig: true,
  })),
  ...Array.from({ length: 11 }, (_, index) => ({
    id: `tisch-spandau-${index + 1}`,
    nummer: index + 1,
    kapazitaet: [2, 4, 4, 6][index % 4],
    bereich: index >= 9 ? TischBereich.terrasse : TischBereich.innen,
    verfuegbar: true,
    rasterZeile: Math.floor(index / 4) + 1,
    rasterSpalte: (index % 4) + 1,
    standortId: "spandau",
    vorlaeufig: true,
  })),
];

export const beispielgerichte = [
  { id: "gericht-kreuzberg-bruschetta", name: "Bruschetta al Pomodoro", beschreibung: "Geröstetes Landbrot mit Tomaten, Basilikum, Knoblauch und Olivenöl.", preisCent: 890, kategorie: GerichtKategorie.antipasti, standortId: "kreuzberg" },
  { id: "gericht-kreuzberg-burrata", name: "Burrata con Pomodorini", beschreibung: "Cremige Burrata mit Kirschtomaten, Rucola und Basilikumöl.", preisCent: 1390, kategorie: GerichtKategorie.antipasti, standortId: "kreuzberg" },
  { id: "gericht-kreuzberg-carbonara", name: "Spaghetti alla Carbonara", beschreibung: "Spaghetti mit Guanciale, Ei, Pecorino und schwarzem Pfeffer.", preisCent: 1650, kategorie: GerichtKategorie.pasta, standortId: "kreuzberg" },
  { id: "gericht-kreuzberg-ragu", name: "Tagliatelle al Ragù", beschreibung: "Bandnudeln mit langsam geschmortem Rinderragù und Parmesan.", preisCent: 1790, kategorie: GerichtKategorie.pasta, standortId: "kreuzberg" },
  { id: "gericht-kreuzberg-risotto-porcini", name: "Risotto ai Porcini", beschreibung: "Cremiges Risotto mit Steinpilzen, Weißwein und Parmesan.", preisCent: 1890, kategorie: GerichtKategorie.risotto, standortId: "kreuzberg" },
  { id: "gericht-kreuzberg-bistecca", name: "Bistecca alla Griglia", beschreibung: "Gegrilltes Rumpsteak mit Rosmarinkartoffeln und Kräuterbutter.", preisCent: 3150, kategorie: GerichtKategorie.grill, standortId: "kreuzberg" },
  { id: "gericht-kreuzberg-salsiccia", name: "Salsiccia alla Griglia", beschreibung: "Italienische Grillwurst mit Ofengemüse und Rosmarinkartoffeln.", preisCent: 2290, kategorie: GerichtKategorie.grill, standortId: "kreuzberg" },
  { id: "gericht-kreuzberg-tiramisu", name: "Tiramisù Classico", beschreibung: "Hausgemachtes Tiramisù mit Espresso, Mascarpone und Kakao.", preisCent: 850, kategorie: GerichtKategorie.dessert, standortId: "kreuzberg" },
  { id: "gericht-kreuzberg-acqua", name: "Acqua Minerale 0,75 l", beschreibung: "Italienisches Mineralwasser, still oder sprudelnd.", preisCent: 650, kategorie: GerichtKategorie.getraenke, standortId: "kreuzberg" },
  { id: "gericht-kreuzberg-chianti", name: "Chianti Classico 0,2 l", beschreibung: "Trockener toskanischer Rotwein im Glas.", preisCent: 790, kategorie: GerichtKategorie.getraenke, standortId: "kreuzberg" },
  { id: "gericht-spandau-caprese", name: "Insalata Caprese", beschreibung: "Tomaten, Mozzarella, Basilikum und natives Olivenöl.", preisCent: 1090, kategorie: GerichtKategorie.antipasti, standortId: "spandau" },
  { id: "gericht-spandau-antipasto", name: "Antipasto della Casa", beschreibung: "Gemischte italienische Vorspeisen mit gegrilltem Gemüse, Käse und Oliven.", preisCent: 1350, kategorie: GerichtKategorie.antipasti, standortId: "spandau" },
  { id: "gericht-spandau-arrabbiata", name: "Penne all’Arrabbiata", beschreibung: "Penne mit würziger Tomatensauce, Knoblauch, Chili und Petersilie.", preisCent: 1390, kategorie: GerichtKategorie.pasta, standortId: "spandau" },
  { id: "gericht-spandau-lasagne", name: "Lasagne al Forno", beschreibung: "Ofenlasagne mit Rinderragù, Béchamelsauce und Parmesan.", preisCent: 1650, kategorie: GerichtKategorie.pasta, standortId: "spandau" },
  { id: "gericht-spandau-risotto", name: "Risotto Primavera", beschreibung: "Cremiges Risotto mit saisonalem Gemüse, Weißwein und Parmesan.", preisCent: 1690, kategorie: GerichtKategorie.risotto, standortId: "spandau" },
  { id: "gericht-spandau-tiramisu", name: "Tiramisù Classico", beschreibung: "Hausgemachtes Tiramisù mit Espresso, Mascarpone und Kakao.", preisCent: 850, kategorie: GerichtKategorie.dessert, standortId: "spandau" },
  { id: "gericht-spandau-panna-cotta", name: "Panna Cotta", beschreibung: "Vanille-Panna-Cotta mit hausgemachtem Beerenkompott.", preisCent: 790, kategorie: GerichtKategorie.dessert, standortId: "spandau" },
  { id: "gericht-spandau-acqua", name: "Acqua Minerale 0,75 l", beschreibung: "Italienisches Mineralwasser, still oder sprudelnd.", preisCent: 650, kategorie: GerichtKategorie.getraenke, standortId: "spandau" },
  { id: "gericht-spandau-pinot-grigio", name: "Pinot Grigio 0,2 l", beschreibung: "Trockener italienischer Weißwein im Glas.", preisCent: 720, kategorie: GerichtKategorie.getraenke, standortId: "spandau" },
].map((gericht) => ({
  ...gericht,
  nameNormalisiert: gericht.name.normalize("NFKC").toLocaleLowerCase("de-DE"),
  istTagesgericht: false,
  istSaisongericht: false,
}));

export async function seedGrunddaten() {
  for (const standort of standorte) {
    await prisma.standort.upsert({
      where: { id: standort.id },
      create: standort,
      update: {},
    });
  }

  for (const person of manager) {
    await prisma.mitarbeiter.upsert({
      where: { id: person.id },
      create: person,
      update: {},
    });
  }

  for (const person of bedienungen) {
    await prisma.mitarbeiter.upsert({
      where: { id: person.id },
      create: person,
      update: { name: person.name, rolle: person.rolle, standortId: null },
    });
  }

  await prisma.mitarbeiter.upsert({
    where: { id: inhaber.id },
    create: inhaber,
    update: { name: inhaber.name },
  });

  for (const gast of anekdotenGaeste) {
    const vorhanden = await prisma.gast.findFirst({
      where: { OR: [{ id: gast.id }, { telefonNormalisiert: gast.telefonNormalisiert }] },
      select: { id: true },
    });
    if (!vorhanden) {
      await prisma.gast.create({ data: gast });
    }
  }

  for (const gast of demoGaeste) {
    await prisma.gast.upsert({ where: { id: gast.id }, create: gast, update: {} });
  }

  for (const zeit of oeffnungszeiten) {
    validateZeitfenster(zeit.oeffnetMinute, zeit.schliesstMinute);
    await prisma.standardOeffnungszeit.upsert({
      where: {
        standortId_wochentag: {
          standortId: zeit.standortId,
          wochentag: zeit.wochentag,
        },
      },
      create: zeit,
      update: {},
    });
  }

  for (const tisch of tische) {
    await prisma.tisch.upsert({
      where: { id: tisch.id },
      create: tisch,
      update: {},
    });
  }

  for (const reservierung of demoReservierungen) {
    await prisma.reservierung.upsert({
      where: { id: reservierung.id },
      create: reservierung,
      update: {},
    });
  }

  for (const gericht of beispielgerichte) {
    await prisma.gericht.upsert({
      where: {
        standortId_nameNormalisiert: {
          standortId: gericht.standortId,
          nameNormalisiert: gericht.nameNormalisiert,
        },
      },
      create: gericht,
      update: {},
    });
  }
}
