ALTER TABLE "Reservierung" ADD COLUMN "geaendertVonId" TEXT
    REFERENCES "Mitarbeiter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "Reservierung_geaendertVonId_idx" ON "Reservierung"("geaendertVonId");
