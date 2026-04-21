/**
 * Pluggable PRNG. Varsayılanda `Math.random` kullanılır; `withSeed(n, fn)`
 * içinde geçici olarak Mulberry32 seedli bir PRNG'ye geçer.
 *
 * Kullanım: tüm generator modülleri `rng()` çağırır (Math.random yerine).
 * `withSeed(42, () => generatePersona())` → aynı seed aynı çıktıyı verir.
 */

type Rng = () => number;

let currentRng: Rng = Math.random;

/** Mulberry32 PRNG — 32-bit seed, iyi dağılım, tek satır kod. */
function mulberry32(seed: number): Rng {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** String seed'i 32-bit integer'a hash'ler (FNV-1a). */
export function hashSeed(input: string | number): number {
  if (typeof input === "number") return input >>> 0;
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h;
}

export function rng(): number {
  return currentRng();
}

/**
 * `fn` çağrısını verilen seed altında çalıştır; bitince önceki PRNG'yi geri
 * yükler. Try/finally ile hata durumunda da eski durum korunur.
 */
export function withSeed<T>(seed: number | string, fn: () => T): T {
  const previous = currentRng;
  currentRng = mulberry32(hashSeed(seed));
  try {
    return fn();
  } finally {
    currentRng = previous;
  }
}
