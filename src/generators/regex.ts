import { rng } from "./random";

/**
 * Minimal pattern generator. Tam regex değil — aşağıdaki alt kümeyi destekler:
 *
 *   - Literal karakterler (`-`, `/`, `:`, boşluk, vb.)
 *   - Kaçış: `\\d`, `\\w`, `\\s`, `\\\\`, `\\.`, `\\-`, `\\[`, ...
 *   - Karakter sınıfları: `[A-Z]`, `[a-z0-9]`, `[^abc]` desteklenmez (sadece pozitif)
 *   - Nicelikler: `{n}`, `{min,max}`
 *
 * Yeterince zengin: `[A-Z]{3}-\\d{5}`, `TR\\d{2} \\d{4} \\d{4}`, `BA-\\d{6}` gibi
 * tipik test-data kalıplarını karşılar. Desteklenmeyen sözdizimi hata fırlatır.
 */

type Atom =
  | { kind: "char"; char: string }
  | { kind: "class"; chars: string[] };

interface Piece {
  atom: Atom;
  min: number;
  max: number;
}

const DIGITS = "0123456789".split("");
const ALPHA_LOWER = "abcdefghijklmnopqrstuvwxyz".split("");
const ALPHA_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const WORD = [...ALPHA_LOWER, ...ALPHA_UPPER, ...DIGITS, "_"];
const SPACE = [" "];

function parseCharClass(
  pattern: string,
  start: number,
): { chars: string[]; next: number } {
  // `[...]` — start at `[`
  let i = start + 1;
  const chars: string[] = [];
  while (i < pattern.length && pattern[i] !== "]") {
    const c = pattern[i];
    if (c === "\\" && i + 1 < pattern.length) {
      const next = pattern[i + 1];
      if (next === "d") chars.push(...DIGITS);
      else if (next === "w") chars.push(...WORD);
      else if (next === "s") chars.push(...SPACE);
      else chars.push(next);
      i += 2;
      continue;
    }
    // range: `a-z`
    if (pattern[i + 1] === "-" && pattern[i + 2] && pattern[i + 2] !== "]") {
      const from = c.charCodeAt(0);
      const to = pattern[i + 2].charCodeAt(0);
      if (from > to) throw new Error(`Geçersiz aralık: ${c}-${pattern[i + 2]}`);
      for (let code = from; code <= to; code++) chars.push(String.fromCharCode(code));
      i += 3;
      continue;
    }
    chars.push(c);
    i += 1;
  }
  if (pattern[i] !== "]") throw new Error("Kapanmayan [ ]");
  return { chars, next: i + 1 };
}

function parseQuantifier(
  pattern: string,
  start: number,
): { min: number; max: number; next: number } {
  if (pattern[start] !== "{") return { min: 1, max: 1, next: start };
  const end = pattern.indexOf("}", start);
  if (end < 0) throw new Error("Kapanmayan { }");
  const body = pattern.slice(start + 1, end);
  const parts = body.split(",");
  const min = parseInt(parts[0], 10);
  if (Number.isNaN(min)) throw new Error(`Geçersiz nicelik: {${body}}`);
  const max = parts.length === 1 ? min : parseInt(parts[1], 10);
  if (Number.isNaN(max)) throw new Error(`Geçersiz nicelik: {${body}}`);
  return { min, max, next: end + 1 };
}

function parsePattern(pattern: string): Piece[] {
  const pieces: Piece[] = [];
  let i = 0;
  while (i < pattern.length) {
    let atom: Atom;

    if (pattern[i] === "\\") {
      if (i + 1 >= pattern.length) throw new Error("Dangling \\");
      const next = pattern[i + 1];
      if (next === "d") atom = { kind: "class", chars: DIGITS };
      else if (next === "w") atom = { kind: "class", chars: WORD };
      else if (next === "s") atom = { kind: "class", chars: SPACE };
      else atom = { kind: "char", char: next };
      i += 2;
    } else if (pattern[i] === "[") {
      const { chars, next } = parseCharClass(pattern, i);
      atom = { kind: "class", chars };
      i = next;
    } else if (pattern[i] === "(" || pattern[i] === ")" || pattern[i] === "|") {
      throw new Error(`Desteklenmiyor: ${pattern[i]}`);
    } else {
      atom = { kind: "char", char: pattern[i] };
      i += 1;
    }

    const { min, max, next } = parseQuantifier(pattern, i);
    i = next;
    pieces.push({ atom, min, max });
  }
  return pieces;
}

function renderAtom(atom: Atom): string {
  if (atom.kind === "char") return atom.char;
  return atom.chars[Math.floor(rng() * atom.chars.length)];
}

/**
 * Verilen pattern'e uyan rastgele dize üret. Desteklenmeyen sözdizimi hata
 * fırlatır — çağıran try/catch ile sarmalı.
 */
export function generateFromPattern(pattern: string): string {
  const pieces = parsePattern(pattern);
  let out = "";
  for (const piece of pieces) {
    const count =
      piece.min === piece.max
        ? piece.min
        : piece.min +
          Math.floor(rng() * (piece.max - piece.min + 1));
    for (let k = 0; k < count; k++) out += renderAtom(piece.atom);
  }
  return out;
}