/**
 * SMMM (Serbest Muhasebeci Mali Müşavir) Sicil No Generator
 * Format: 5 haneli numerik
 */

export function generateSMMMNo(): string {
  const digits: number[] = [];

  // 5 haneli numara (ilk hane 0 olabilir)
  for (let i = 0; i < 5; i++) {
    digits.push(Math.floor(Math.random() * 10));
  }

  return digits.join("");
}
