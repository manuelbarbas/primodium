import { EMotherlodeSize, EMotherlodeType } from "src/util/web3/types";

export const MotherlodeSizeNames: Record<number, string> = {
  [EMotherlodeSize.SMALL]: "small",
  [EMotherlodeSize.MEDIUM]: "medium",
  [EMotherlodeSize.LARGE]: "large",
};

// do the same for types
export const MotherlodeTypeNames: Record<number, string> = {
  [EMotherlodeType.TITANIUM]: "titanium",
  [EMotherlodeType.IRIDIUM]: "iridium",
  [EMotherlodeType.PLATINUM]: "platinum",
  [EMotherlodeType.KIMBERLITE]: "kimberlite",
};
