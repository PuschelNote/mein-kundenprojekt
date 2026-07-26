DROP INDEX "Bestellung_tischId_aktiv_key";

CREATE UNIQUE INDEX "Bestellung_tischId_aktiv_key"
ON "Bestellung"("tischId")
WHERE "status" IN ('offen', 'zubereitet', 'serviert');
