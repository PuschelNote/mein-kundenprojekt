ALTER TABLE "Tisch" ADD COLUMN "verfuegbar" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Tisch" ADD COLUMN "rasterZeile" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Tisch" ADD COLUMN "rasterSpalte" INTEGER NOT NULL DEFAULT 1;

UPDATE "Tisch"
SET "rasterZeile" = CAST(("nummer" - 1) / 4 AS INTEGER) + 1,
    "rasterSpalte" = (("nummer" - 1) % 4) + 1;

CREATE UNIQUE INDEX "Tisch_standortId_rasterZeile_rasterSpalte_key"
ON "Tisch"("standortId", "rasterZeile", "rasterSpalte");
