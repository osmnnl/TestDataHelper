import type { GeneratorOptions } from "../types";

/**
 * Dinamik Metin Generator
 * Karakter sayısı, sayı dahil etme, özel karakter dahil etme seçenekleri
 */

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SPECIAL_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

export function generateText(options: GeneratorOptions = {}): string {
  const {
    length = 50,
    includeNumbers = false,
    includeSpecialChars = false,
    caseType = "mixed",
  } = options;

  // Karakter havuzunu oluştur
  let charPool = "";

  switch (caseType) {
    case "upper":
      charPool = UPPERCASE;
      break;
    case "lower":
      charPool = LOWERCASE;
      break;
    case "mixed":
    default:
      charPool = LOWERCASE + UPPERCASE;
      break;
  }

  if (includeNumbers) {
    charPool += NUMBERS;
  }

  if (includeSpecialChars) {
    charPool += SPECIAL_CHARS;
  }

  // Rastgele metin oluştur
  let result = "";
  const poolLength = charPool.length;

  for (let i = 0; i < length; i++) {
    result += charPool.charAt(Math.floor(Math.random() * poolLength));
  }

  return result;
}

/**
 * Lorem Ipsum benzeri metin üretici (kelime bazlı)
 */
const LOREM_WORDS = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
  "enim",
  "ad",
  "minim",
  "veniam",
  "quis",
  "nostrud",
  "exercitation",
  "ullamco",
  "laboris",
  "nisi",
];

export function generateLoremIpsum(wordCount: number = 10): string {
  const words: string[] = [];

  for (let i = 0; i < wordCount; i++) {
    words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
  }

  // İlk harfi büyük yap
  const result = words.join(" ");
  return result.charAt(0).toUpperCase() + result.slice(1);
}
