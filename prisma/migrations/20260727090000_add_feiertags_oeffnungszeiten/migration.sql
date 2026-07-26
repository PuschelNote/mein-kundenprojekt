CREATE TABLE "FeiertagsOeffnungszeit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "standortId" TEXT NOT NULL,
    "datum" TEXT NOT NULL,
    "geschlossen" BOOLEAN NOT NULL DEFAULT false,
    "oeffnetMinute" INTEGER,
    "schliesstMinute" INTEGER,
    "erstelltAm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "geaendertAm" DATETIME NOT NULL,
    CONSTRAINT "FeiertagsOeffnungszeit_standortId_fkey" FOREIGN KEY ("standortId") REFERENCES "Standort" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "FeiertagsOeffnungszeit_standortId_datum_key" ON "FeiertagsOeffnungszeit"("standortId", "datum");
CREATE INDEX "FeiertagsOeffnungszeit_standortId_datum_idx" ON "FeiertagsOeffnungszeit"("standortId", "datum");
