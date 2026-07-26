UPDATE "Gast"
SET "besuchszaehler" = 10,
    "notizen" = 'Kommt fast jede Woche. Bevorzugt Tisch 7 und Tagliatelle al Ragù.'
WHERE "id" = 'gast-anekdote-herr-bergmann'
  AND "besuchszaehler" < 10;
