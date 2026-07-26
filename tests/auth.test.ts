import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertPin, createSessionToken, hashPin, hashSessionToken, verifyPin } from "../lib/auth";

describe("Sichere Anmeldegrundlage", () => {
  it("speichert sechsstellige PINs nur als gesalzenen Hash", async () => {
    const ersterHash = await hashPin("583104");
    const zweiterHash = await hashPin("583104");
    assert.notEqual(ersterHash, zweiterHash);
    assert.ok(!ersterHash.includes("583104"));
    assert.equal(await verifyPin("583104", ersterHash), true);
    assert.equal(await verifyPin("583105", ersterHash), false);
  });

  it("weist schwache oder falsch formatierte PINs ab", () => {
    assert.throws(() => assertPin("1234"));
    assert.throws(() => assertPin("abcdef"));
  });

  it("erzeugt nicht vorhersagbare Sessiontokens und persistiert nur deren Hash", () => {
    const token = createSessionToken();
    assert.notEqual(token, createSessionToken());
    assert.notEqual(hashSessionToken(token), token);
    assert.equal(hashSessionToken(token), hashSessionToken(token));
  });
});
