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

// note: for use when we get special asteroids
enum EAsteroidType {
  NONE,
  NORMAL
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

struct BattleResult {
  uint256 winnerAddress;
  uint32[] attackerUnitsLeft;
  uint32[] defenderUnitsLeft;
}

struct BattleParticipant {
  address playerAddress;
  uint256[] unitTypes;
  uint32[] unitLevels;
  uint32[] unitCounts;
}
