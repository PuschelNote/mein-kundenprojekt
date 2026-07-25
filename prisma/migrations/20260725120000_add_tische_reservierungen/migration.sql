-- CreateTable
CREATE TABLE "Tisch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nummer" INTEGER NOT NULL,
    "kapazitaet" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'frei',
    "bereich" TEXT NOT NULL,
    "vorlaeufig" BOOLEAN NOT NULL DEFAULT true,
    "standortId" TEXT NOT NULL,
    CONSTRAINT "Tisch_standortId_fkey" FOREIGN KEY ("standortId") REFERENCES "Standort" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reservierung" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "datum" TEXT NOT NULL,
    "uhrzeitMinute" INTEGER NOT NULL,
    "personenzahl" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'offen',
    "standortId" TEXT NOT NULL,
    "tischId" TEXT NOT NULL,
    "gastId" TEXT NOT NULL,
    "erstelltVonId" TEXT NOT NULL,
    "erstelltAm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "geaendertAm" DATETIME NOT NULL,
    CONSTRAINT "Reservierung_standortId_fkey" FOREIGN KEY ("standortId") REFERENCES "Standort" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservierung_tischId_fkey" FOREIGN KEY ("tischId") REFERENCES "Tisch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservierung_gastId_fkey" FOREIGN KEY ("gastId") REFERENCES "Gast" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservierung_erstelltVonId_fkey" FOREIGN KEY ("erstelltVonId") REFERENCES "Mitarbeiter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Tisch_standortId_nummer_key" ON "Tisch"("standortId", "nummer");
CREATE INDEX "Tisch_standortId_idx" ON "Tisch"("standortId");
CREATE INDEX "Reservierung_standortId_datum_uhrzeitMinute_idx" ON "Reservierung"("standortId", "datum", "uhrzeitMinute");
CREATE INDEX "Reservierung_tischId_idx" ON "Reservierung"("tischId");
CREATE INDEX "Reservierung_gastId_idx" ON "Reservierung"("gastId");
CREATE INDEX "Reservierung_erstelltVonId_idx" ON "Reservierung"("erstelltVonId");
