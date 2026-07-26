-- AlterTable
ALTER TABLE "Mitarbeiter" ADD COLUMN "pinHash" TEXT;

-- CreateTable
CREATE TABLE "MitarbeiterSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenHash" TEXT NOT NULL,
    "mitarbeiterId" TEXT NOT NULL,
    "erstelltAm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "laeuftAbAm" DATETIME NOT NULL,
    CONSTRAINT "MitarbeiterSession_mitarbeiterId_fkey" FOREIGN KEY ("mitarbeiterId") REFERENCES "Mitarbeiter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MitarbeiterSession_tokenHash_key" ON "MitarbeiterSession"("tokenHash");

-- CreateIndex
CREATE INDEX "MitarbeiterSession_mitarbeiterId_idx" ON "MitarbeiterSession"("mitarbeiterId");

-- CreateIndex
CREATE INDEX "MitarbeiterSession_laeuftAbAm_idx" ON "MitarbeiterSession"("laeuftAbAm");
