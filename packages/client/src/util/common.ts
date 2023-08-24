import { EntityID } from "@latticexyz/recs";
import { BlockIdToKey } from "./constants";

export function hasCommonElement(setA: Set<any>, setB: Set<any>) {
  for (let element of setA) {
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

export const getBlockTypeName = (blockType: EntityID | undefined) => {
  if (blockType === undefined) return "";

  return BlockIdToKey[blockType]
    .replace(/([A-Z]+)/g, "$1")
    .replace(/([A-Z][a-z])/g, " $1")
    .trimStart();
};

export const shortenAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
