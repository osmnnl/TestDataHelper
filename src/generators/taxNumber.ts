import { rng } from "./random";

/**
 * Vergi Kimlik No Generator
 * 10 haneli numerik
 *
 * Not: Gerçek VKN'ler belirli algoritmalara sahiptir ancak
 * test amaçlı 10 haneli rastgele numara yeterlidir
 */

export function generateVKN(): string {
  const digits: number[] = [];

  // İlk hane 1-9 arası (0 ile başlamaz)
  digits.push(Math.floor(rng() * 9) + 1);

  // 2-10. haneler 0-9 arası
  for (let i = 1; i < 10; i++) {
    digits.push(Math.floor(rng() * 10));
  }

  return digits.join("");
}