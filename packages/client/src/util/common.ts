import { Entity } from "@latticexyz/recs";
import { hexlify, randomBytes } from "ethers/lib/utils";
import { Hex, trim, getAddress, isAddress } from "viem";
import { BlockIdToKey } from "./constants";

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

export function formatNumber(num: number | bigint, options?: { fractionDigits?: number; short?: boolean }): string {
  const digits = options?.fractionDigits === undefined ? 0 : options.fractionDigits;
  if (num === 0 || num === 0n) return "--";

  const shorten = (n: number): string => {
    const units = ["", "K", "M", "B", "T"];
    let unitIndex = 0;
    while (n >= 1000 && unitIndex < units.length - 1) {
      n /= 1000;
      unitIndex++;
    }
    return getDecimals(n, digits) + units[unitIndex];
  };

  if (typeof num === "number") {
    if (options?.short) return shorten(num);
    const fixedNum = num.toFixed(digits);
    return String(parseFloat(fixedNum).toLocaleString());
  } else if (typeof num === "bigint") {
    if (options?.short) return shorten(Number(num));
    return num.toLocaleString();
  }
  return "";
}

export const getBlockTypeName = (blockType: Entity | undefined) => {
  if (blockType === undefined || BlockIdToKey[blockType] == undefined) return "";

  return BlockIdToKey[blockType]
    .replace(/([A-Z])([0-9])/g, "$1 $2") // Insert a space between an uppercase letter and a number.
    .replace(/([0-9])([A-Z])/g, "$1 $2") // Insert a space between a number and an uppercase letter.
    .replace(/([a-z])([0-9])/g, "$1 $2") // Insert a space between a lowercase letter and a number.
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2") // Insert a space between consecutive uppercase letters where the second one is followed by lowercase letter (camelCase).
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Handle general camelCase like "minePlatinum".
    .trimStart();
};

export const shortenAddress = (address: Hex): Hex => {
  return `0x${address.slice(2, 6)}...${address.slice(-4)}`;
};

export function reverseRecord<T extends PropertyKey, U extends PropertyKey>(input: Record<T, U>) {
  return Object.fromEntries(Object.entries(input).map(([key, value]) => [value, key])) as Record<U, T>;
}

export const entityToAddress = (entity: Entity | string, shorten = false): Hex => {
  const checksumAddress = getAddress(trim(entity as Hex));

  return shorten ? shortenAddress(checksumAddress) : checksumAddress;
};

export const isPlayer = (entity: Entity) => {
  const trimmedAddress = trim(entity as Hex);

  return isAddress(trimmedAddress);
};

export const randomEntity = () => hexlify(randomBytes(32)) as Entity;
