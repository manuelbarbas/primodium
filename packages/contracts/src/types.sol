// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

struct ResourceValue {
  uint256 resource;
  uint32 value;
}

struct ResourceValues {
  uint256[] resources;
  uint32[] values;
}

enum EActionType {
  Build,
  Upgrade,
  Destroy
}

enum ESpaceRockType {
  NONE,
  ASTEROID,
  MOTHERLODE
}

struct Coord {
  int32 x;
  int32 y;
  uint256 parent;
}

// note: dimensions will always be positive, but are int32s so they work with coords
struct Dimensions {
  int32 x;
  int32 y;
}

struct Bounds {
  int32 minX;
  int32 minY;
  int32 maxX;
  int32 maxY;
}

/* -------------------------------------------------------------------------- */
/*                                  Arrivals                                  */
/* -------------------------------------------------------------------------- */
enum ESendType {
  INVADE,
  REINFORCE
}

struct ArrivalUnit {
  uint256 unitType;
  uint32 count;
}

struct Arrival {
  ESendType sendType;
  ArrivalUnit[] units;
  uint256 arrivalBlock;
  uint256 from;
  uint256 to;
  uint256 origin;
  uint256 destination;
}

/* -------------------------------------------------------------------------- */
/*                                 Motherlode                                 */
/* -------------------------------------------------------------------------- */
enum EMotherlodeSize {
  SMALL,
  MEDIUM,
  LARGE
}

enum EMotherlodeType {
  TITANIUM,
  IRIDIUM,
  PLATINUM,
  KIMBERLITE
}

struct Motherlode {
  EMotherlodeSize size;
  EMotherlodeType motherlodeType;
  uint256 cooldownBlocks;
}

/* -------------------------------------------------------------------------- */
/*                                   Battle                                   */
/* -------------------------------------------------------------------------- */
struct BattleResult {
  uint256 winnerEntity;
  uint32[] attackerUnitsLeft;
  uint32[] defenderUnitsLeft;
}

struct BattleParticipant {
  uint256 participantEntity;
  uint256[] unitTypes;
  uint32[] unitLevels;
  uint32[] unitCounts;
}
