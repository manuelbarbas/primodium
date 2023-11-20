// import { Entity } from "@latticexyz/recs";
// import { Hex, getAddress, isAddress, trim } from "viem";

export function hasCommonElement<T>(setA: Set<T>, setB: Set<T>) {
  for (const element of setA) {
    if (setB.has(element)) {
      return true; // Found a common element
    }
  }
  return false; // No common elements found
}

export function clampedIndex(index: number, length: number) {
  if (index < 0) {
    return 0;
  }
  if (index >= length) {
    return length - 1;
  }
  return index;
}

export const wrap = (index: number, length: number) => {
  return ((index % length) + length) % length;
};

export function toRomanNumeral(number: number) {
  const romanNumerals = [
    { value: 1000, symbol: "M" },
    { value: 900, symbol: "CM" },
    { value: 500, symbol: "D" },
    { value: 400, symbol: "CD" },
    { value: 100, symbol: "C" },
    { value: 90, symbol: "XC" },
    { value: 50, symbol: "L" },
    { value: 40, symbol: "XL" },
    { value: 10, symbol: "X" },
    { value: 9, symbol: "IX" },
    { value: 5, symbol: "V" },
    { value: 4, symbol: "IV" },
    { value: 1, symbol: "I" },
  ];

  let result = "";

  for (const numeral of romanNumerals) {
    while (number >= numeral.value) {
      result += numeral.symbol;
      number -= numeral.value;
    }
  }

  return result;
}

function getDecimals(num: number, max = 3) {
  const parts = num.toString().split(".");
  const digits = parts[1] ? (parts[1].length > max ? max : parts[1].length) : 0;
  return num.toFixed(digits);
}

export const shortenAddress = (address: string): string => {
  return `0x${address.slice(2, 6)}...${address.slice(-4)}`;
};

// export function reverseRecord<T extends PropertyKey, U extends PropertyKey>(input: Record<T, U>) {
//   return Object.fromEntries(Object.entries(input).map(([key, value]) => [value, key])) as Record<U, T>;
// }

// export const entityToAddress = (entity: Entity | string, shorten = false): Hex => {
//   const checksumAddress = getAddress(trim(entity as Hex));

//   return shorten ? shortenAddress(checksumAddress) : checksumAddress;
// };

// export const isPlayer = (entity: Entity) => {
//   const trimmedAddress = trim(entity as Hex);

//   return isAddress(trimmedAddress);
// };
