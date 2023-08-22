export enum ESpaceRockType {
  None,
  Asteroid,
  Motherlode,
}

export enum EMotherlodeSize {
  SMALL,
  MEDIUM,
  LARGE,
}

export enum EMotherlodeType {
  TITANIUM,
  IRIDIUM,
  PLATINUM,
  KIMBERLITE,
}

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
