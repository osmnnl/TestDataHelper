/**
 * Persona paylaşım kodu encode/decode.
 *
 * Format: `dhp:v1:<base64url>` — prefix veriyi kim/ne olduğu konusunda
 * netleştirir; base64url `=` padding olmadan, URL-safe karakterler.
 */

import type { Persona } from "../generators";

const PREFIX = "dhp:v1:";

function toBase64Url(s: string): string {
  // unicode -> bytes -> base64
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(b64: string): string {
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const bin = atob(b64.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodePersona(persona: Persona): string {
  return PREFIX + toBase64Url(JSON.stringify(persona));
}

export function decodePersona(code: string): Persona {
  const trimmed = code.trim();
  if (!trimmed.startsWith(PREFIX)) {
    throw new Error(`Kod "${PREFIX}" ile başlamalı`);
  }
  const body = trimmed.slice(PREFIX.length);
  const json = fromBase64Url(body);
  return JSON.parse(json) as Persona;
}
