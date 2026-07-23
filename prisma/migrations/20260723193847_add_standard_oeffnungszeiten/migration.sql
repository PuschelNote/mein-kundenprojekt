-- CreateTable
CREATE TABLE "StandardOeffnungszeit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "standortId" TEXT NOT NULL,
    "wochentag" TEXT NOT NULL,
    "oeffnetMinute" INTEGER NOT NULL,
    "schliesstMinute" INTEGER NOT NULL,
    CONSTRAINT "StandardOeffnungszeit_standortId_fkey" FOREIGN KEY ("standortId") REFERENCES "Standort" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "StandardOeffnungszeit_standortId_idx" ON "StandardOeffnungszeit"("standortId");

-- CreateIndex
CREATE UNIQUE INDEX "StandardOeffnungszeit_standortId_wochentag_key" ON "StandardOeffnungszeit"("standortId", "wochentag");
