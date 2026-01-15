/**
 * Adres Generator
 * Ülke, İl, İlçe, Mahalle, Sokak, Bina No, Daire No, Tam Adres
 */

import { CITIES, DISTRICTS, NEIGHBORHOODS, STREETS } from "../data/names";

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Ülke döndür (Türkiye sabit)
 */
export function generateCountry(): string {
  return "Türkiye";
}

/**
 * Rastgele il üret
 */
export function generateCity(): string {
  return getRandomItem(CITIES);
}

/**
 * Rastgele ilçe üret (şehire bağlı olabilir)
 */
export function generateDistrict(city?: string): string {
  if (city && DISTRICTS[city]) {
    return getRandomItem(DISTRICTS[city]);
  }

  // Rastgele bir şehrin ilçesi
  const allDistricts = Object.values(DISTRICTS).flat();
  return getRandomItem(allDistricts);
}

/**
 * Rastgele mahalle üret
 */
export function generateNeighborhood(): string {
  return `${getRandomItem(NEIGHBORHOODS)} Mahallesi`;
}

/**
 * Rastgele sokak üret
 */
export function generateStreet(): string {
  return getRandomItem(STREETS);
}

/**
 * Rastgele bina no üret
 */
export function generateBuildingNo(): string {
  return getRandomNumber(1, 150).toString();
}

/**
 * Rastgele daire no üret
 */
export function generateApartmentNo(): string {
  return getRandomNumber(1, 20).toString();
}

/**
 * Tam adres üret
 */
export function generateFullAddress(): string {
  const city = generateCity();
  const district = generateDistrict(city);
  const neighborhood = generateNeighborhood();
  const street = generateStreet();
  const buildingNo = generateBuildingNo();
  const apartmentNo = generateApartmentNo();

  return `${neighborhood}, ${street} No: ${buildingNo}, Daire: ${apartmentNo}, ${district}/${city}`;
}
