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

// Arrivals

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
