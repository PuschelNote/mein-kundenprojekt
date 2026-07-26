ALTER TABLE "Bestellung" ADD COLUMN "reservierungId" TEXT REFERENCES "Reservierung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Bestellung_reservierungId_key" ON "Bestellung"("reservierungId");
