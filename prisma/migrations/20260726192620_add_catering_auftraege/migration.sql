-- CreateTable
CREATE TABLE "CateringAuftrag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kundenname" TEXT NOT NULL,
    "datum" TEXT NOT NULL,
    "beschreibung" TEXT NOT NULL,
    "angebotssummeCent" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'angefragt',
    "standortId" TEXT NOT NULL,
    "bearbeitetVonId" TEXT NOT NULL,
    "erstelltAm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "geaendertAm" DATETIME NOT NULL,
    CONSTRAINT "CateringAuftrag_standortId_fkey" FOREIGN KEY ("standortId") REFERENCES "Standort" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CateringAuftrag_bearbeitetVonId_fkey" FOREIGN KEY ("bearbeitetVonId") REFERENCES "Mitarbeiter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tisch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nummer" INTEGER NOT NULL,
    "kapazitaet" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'frei',
    "bereich" TEXT NOT NULL,
    "verfuegbar" BOOLEAN NOT NULL DEFAULT true,
    "rasterZeile" INTEGER NOT NULL,
    "rasterSpalte" INTEGER NOT NULL,
    "vorlaeufig" BOOLEAN NOT NULL DEFAULT true,
    "standortId" TEXT NOT NULL,
    CONSTRAINT "Tisch_standortId_fkey" FOREIGN KEY ("standortId") REFERENCES "Standort" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tisch" ("bereich", "id", "kapazitaet", "nummer", "rasterSpalte", "rasterZeile", "standortId", "status", "verfuegbar", "vorlaeufig") SELECT "bereich", "id", "kapazitaet", "nummer", "rasterSpalte", "rasterZeile", "standortId", "status", "verfuegbar", "vorlaeufig" FROM "Tisch";
DROP TABLE "Tisch";
ALTER TABLE "new_Tisch" RENAME TO "Tisch";
CREATE INDEX "Tisch_standortId_idx" ON "Tisch"("standortId");
CREATE UNIQUE INDEX "Tisch_standortId_nummer_key" ON "Tisch"("standortId", "nummer");
CREATE UNIQUE INDEX "Tisch_standortId_rasterZeile_rasterSpalte_key" ON "Tisch"("standortId", "rasterZeile", "rasterSpalte");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CateringAuftrag_standortId_datum_idx" ON "CateringAuftrag"("standortId", "datum");

-- CreateIndex
CREATE INDEX "CateringAuftrag_standortId_status_idx" ON "CateringAuftrag"("standortId", "status");

-- CreateIndex
CREATE INDEX "CateringAuftrag_bearbeitetVonId_idx" ON "CateringAuftrag"("bearbeitetVonId");
