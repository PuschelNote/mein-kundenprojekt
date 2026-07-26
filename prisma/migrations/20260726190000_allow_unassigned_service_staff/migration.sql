PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Mitarbeiter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "rolle" TEXT NOT NULL,
    "standortId" TEXT,
    "erstelltAm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "geaendertAm" DATETIME NOT NULL,
    CONSTRAINT "Mitarbeiter_standortId_fkey" FOREIGN KEY ("standortId") REFERENCES "Standort" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_Mitarbeiter" ("erstelltAm", "geaendertAm", "id", "name", "rolle", "standortId")
SELECT "erstelltAm", "geaendertAm", "id", "name", "rolle", "standortId" FROM "Mitarbeiter";

DROP TABLE "Mitarbeiter";
ALTER TABLE "new_Mitarbeiter" RENAME TO "Mitarbeiter";
CREATE INDEX "Mitarbeiter_standortId_idx" ON "Mitarbeiter"("standortId");
CREATE INDEX "Mitarbeiter_rolle_idx" ON "Mitarbeiter"("rolle");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
