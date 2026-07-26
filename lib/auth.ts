import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

export async function hashPin(pin: string) {
  assertPin(pin);
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(pin, salt, 64)) as Buffer;
  return `scrypt:${salt}:${hash.toString("hex")}`;
}

export async function verifyPin(pin: string, gespeichert: string) {
  const [verfahren, salt, hashHex] = gespeichert.split(":");
  if (verfahren !== "scrypt" || !salt || !/^[a-f0-9]{128}$/i.test(hashHex ?? "")) return false;
  const erwartet = Buffer.from(hashHex, "hex");
  const berechnet = (await scrypt(pin, salt, erwartet.length)) as Buffer;
  return timingSafeEqual(erwartet, berechnet);
}

export function assertPin(pin: string) {
  if (!/^\d{6}$/.test(pin)) throw new Error("Die PIN muss genau sechs Ziffern enthalten.");
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
