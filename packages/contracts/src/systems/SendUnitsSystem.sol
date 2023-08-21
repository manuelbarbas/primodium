// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { IWorld } from "solecs/System.sol";
import { addressToEntity, getAddressById } from "solecs/utils.sol";

import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { AsteroidTypeComponent, ID as AsteroidTypeComponentID } from "components/AsteroidTypeComponent.sol";
import { ArrivalsSizeComponent, ID as ArrivalsSizeComponentID } from "components/ArrivalsSizeComponent.sol";
import { UnitsComponent, ID as UnitsComponentID } from "components/UnitsComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { MaxMovesComponent, ID as MaxMovesComponentID } from "components/MaxMovesComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";

import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";
import { ID as S_UpdatePlayerSpaceRockSystem } from "./S_UpdatePlayerSpaceRockSystem.sol";

import { LibSend } from "libraries/LibSend.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";

import { MoveCountID } from "src/prototypes.sol";
import { MOVE_SPEED } from "src/constants.sol";
import { ESendType, ESpaceRockType, Coord, Arrival, ArrivalUnit } from "src/types.sol";

uint256 constant ID = uint256(keccak256("system.SendUnits"));

contract SendUnitsSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    (ArrivalUnit[] memory arrivalUnits, ESendType sendType, uint256 origin, uint256 destination, address to) = abi
      .decode(args, (ArrivalUnit[], ESendType, uint256, uint256, address));

    IOnEntitySubsystem(getAddressById(world.systems(), S_UpdatePlayerSpaceRockSystem)).executeTyped(msg.sender, origin);
    uint256 playerEntity = addressToEntity(msg.sender);

    checkMovementRules(origin, destination, playerEntity, to, sendType);

    PositionComponent positionComponent = PositionComponent(getC(PositionComponentID));
    Coord memory originPosition = positionComponent.getValue(origin);
    Coord memory destinationPosition = positionComponent.getValue(destination);

    // make sure the troop count at the planet is leq the one given and subtract from planet total
    UnitsComponent unitsComponent = UnitsComponent(getC(UnitsComponentID));
    for (uint256 i = 0; i < arrivalUnits.length; i++) {
      require(arrivalUnits[i].count > 0, "unit count must be positive");
      uint256 unitPlayerAsteroidEntity = LibEncode.hashEntities(
        uint256(arrivalUnits[i].unitType),
        playerEntity,
        origin
      );
      LibMath.subtract(unitsComponent, unitPlayerAsteroidEntity, arrivalUnits[i].count);
    }

    uint256 moveSpeed = LibSend.getSlowestUnitSpeed(world, arrivalUnits);
    Arrival memory arrival = Arrival({
      units: arrivalUnits,
      sendType: sendType,
      arrivalBlock: block.number +
        ((LibSend.distance(originPosition, destinationPosition) * moveSpeed * MOVE_SPEED) / 100 / 100),
      from: playerEntity,
      to: addressToEntity(to),
      origin: origin,
      destination: destination
    });

    LibSend.sendUnits(world, arrival);
    return abi.encode(arrival);
  }

  function checkMovementRules(
    uint256 origin,
    uint256 destination,
    uint256 playerEntity,
    address to,
    ESendType sendType
  ) internal view {
    OwnedByComponent ownedByComponent = OwnedByComponent(getC(OwnedByComponentID));
    AsteroidTypeComponent asteroidTypeComponent = AsteroidTypeComponent(getC(AsteroidTypeComponentID));
    /*
    Space rock movement rules:
      1. You can only move from an asteroid if it is yours. 
      2. You can only move from a motherlode to your asteroid. 
      3. You cannot move between motherlodes.
      4. You can only invade an enemy.
      5. You can only reinforce yourself on a motherlode.
      6. You must be under the max move count.
    */
    ESpaceRockType originType = ESpaceRockType(asteroidTypeComponent.getValue(origin));
    ESpaceRockType destinationType = ESpaceRockType(asteroidTypeComponent.getValue(destination));

    uint256 moveCount = LibMath.getSafe(ArrivalsSizeComponent(getC(ArrivalsSizeComponentID)), playerEntity);
    uint32 maxMoveCount = LibMath.getSafe(MaxMovesComponent(getC(MaxMovesComponentID)), playerEntity);

    require(moveCount < maxMoveCount, "you have reached your max move count");

    require(origin != destination, "origin and destination cannot be the same");
    if (originType == ESpaceRockType.ASTEROID) {
      require(ownedByComponent.getValue(origin) == playerEntity, "you can only move from an asteroid you own");
    }

    if (destinationType == ESpaceRockType.MOTHERLODE) {
      require(originType != ESpaceRockType.MOTHERLODE, "you cannot move between motherlodes");
      require(
        ownedByComponent.getValue(destination) == playerEntity,
        "you can only move to your asteroid from a motherlode"
      );
    }

    if (sendType == ESendType.INVADE) require(playerEntity != addressToEntity(to), "you cannot invade yourself");
    if (sendType == ESendType.REINFORCE)
      require(
        destinationType == ESpaceRockType.MOTHERLODE && playerEntity == addressToEntity(to),
        "you can only reinforce yourself on a motherlode"
      );
  }

  function executeTyped(
    ArrivalUnit[] calldata arrivalUnits,
    ESendType sendType,
    uint256 origin,
    uint256 destination,
    address to
  ) public returns (bytes memory) {
    return execute(abi.encode(arrivalUnits, sendType, origin, destination, to));
  }
}
