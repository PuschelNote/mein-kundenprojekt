CREATE TABLE "Gericht" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameNormalisiert" TEXT NOT NULL,
    "beschreibung" TEXT NOT NULL,
    "preisCent" INTEGER NOT NULL,
    "kategorie" TEXT NOT NULL,
    "istTagesgericht" BOOLEAN NOT NULL DEFAULT false,
    "istSaisongericht" BOOLEAN NOT NULL DEFAULT false,
    "standortId" TEXT NOT NULL,
    "erstelltAm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "geaendertAm" DATETIME NOT NULL,
    CONSTRAINT "Gericht_standortId_fkey" FOREIGN KEY ("standortId") REFERENCES "Standort" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Gericht_standortId_nameNormalisiert_key"
ON "Gericht"("standortId", "nameNormalisiert");
CREATE INDEX "Gericht_standortId_kategorie_idx"
ON "Gericht"("standortId", "kategorie");
