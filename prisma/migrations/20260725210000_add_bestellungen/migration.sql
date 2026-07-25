CREATE TABLE "Bestellung" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'offen',
    "standortId" TEXT NOT NULL,
    "tischId" TEXT NOT NULL,
    "gastId" TEXT,
    "aufgenommenVonId" TEXT NOT NULL,
    "erstelltAm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "geaendertAm" DATETIME NOT NULL,
    CONSTRAINT "Bestellung_standortId_fkey" FOREIGN KEY ("standortId") REFERENCES "Standort" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bestellung_tischId_fkey" FOREIGN KEY ("tischId") REFERENCES "Tisch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bestellung_gastId_fkey" FOREIGN KEY ("gastId") REFERENCES "Gast" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bestellung_aufgenommenVonId_fkey" FOREIGN KEY ("aufgenommenVonId") REFERENCES "Mitarbeiter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Bestellposition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bestellungId" TEXT NOT NULL,
    "gerichtId" TEXT NOT NULL,
    "menge" INTEGER NOT NULL,
    "sonderwunsch" TEXT,
    "einzelpreisCent" INTEGER NOT NULL,
    CONSTRAINT "Bestellposition_bestellungId_fkey" FOREIGN KEY ("bestellungId") REFERENCES "Bestellung" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Bestellposition_gerichtId_fkey" FOREIGN KEY ("gerichtId") REFERENCES "Gericht" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "Bestellung_standortId_status_erstelltAm_idx" ON "Bestellung"("standortId", "status", "erstelltAm");
CREATE INDEX "Bestellung_tischId_idx" ON "Bestellung"("tischId");
CREATE INDEX "Bestellung_gastId_idx" ON "Bestellung"("gastId");
CREATE INDEX "Bestellung_aufgenommenVonId_idx" ON "Bestellung"("aufgenommenVonId");
CREATE UNIQUE INDEX "Bestellung_tischId_aktiv_key" ON "Bestellung"("tischId") WHERE "status" IN ('offen', 'serviert');
CREATE INDEX "Bestellposition_bestellungId_idx" ON "Bestellposition"("bestellungId");
CREATE INDEX "Bestellposition_gerichtId_idx" ON "Bestellposition"("gerichtId");
