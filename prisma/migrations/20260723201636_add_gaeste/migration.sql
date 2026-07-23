-- CreateTable
CREATE TABLE "Gast" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "telefonNormalisiert" TEXT NOT NULL,
    "besuchszaehler" INTEGER NOT NULL DEFAULT 0,
    "notizen" TEXT,
    "erstelltAm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "geaendertAm" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Gast_telefonNormalisiert_key" ON "Gast"("telefonNormalisiert");

-- CreateIndex
CREATE INDEX "Gast_name_idx" ON "Gast"("name");
