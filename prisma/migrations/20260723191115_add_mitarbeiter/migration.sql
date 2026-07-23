-- CreateTable
CREATE TABLE "Standort" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Mitarbeiter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "rolle" TEXT NOT NULL,
    "standortId" TEXT NOT NULL,
    "erstelltAm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "geaendertAm" DATETIME NOT NULL,
    CONSTRAINT "Mitarbeiter_standortId_fkey" FOREIGN KEY ("standortId") REFERENCES "Standort" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Standort_name_key" ON "Standort"("name");

-- CreateIndex
CREATE INDEX "Mitarbeiter_standortId_idx" ON "Mitarbeiter"("standortId");

-- CreateIndex
CREATE INDEX "Mitarbeiter_rolle_idx" ON "Mitarbeiter"("rolle");
