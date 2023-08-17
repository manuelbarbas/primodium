// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { IWorld } from "solecs/System.sol";
import { addressToEntity, getAddressById } from "solecs/utils.sol";

import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { UnitsComponent, ID as UnitsComponentID } from "components/UnitsComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { ActiveComponent, ID as ActiveComponentID } from "components/ActiveComponent.sol";

import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";
import { ID as S_UpdatePlayerSpaceRockSystem } from "./S_UpdatePlayerSpaceRockSystem.sol";

import { LibSend } from "libraries/LibSend.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";

import { ESendType, Coord, Arrival, ArrivalUnit } from "src/types.sol";

uint256 constant ID = uint256(keccak256("system.SendUnits"));

contract SendUnitsSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    (
      ArrivalUnit[] memory arrivalUnits,
      ESendType sendType,
      Coord memory origin,
      Coord memory destination,
      address to
    ) = abi.decode(args, (ArrivalUnit[], ESendType, Coord, Coord, address));
    OwnedByComponent ownedByComponent = OwnedByComponent(getC(OwnedByComponentID));
    uint256 playerEntity = addressToEntity(msg.sender);
    // make sure the asteroid exists on the coord
    Coord memory asteroidPosition = PositionComponent(getC(PositionComponentID)).getValue(origin.parent);
    IOnEntitySubsystem(getAddressById(world.systems(), S_UpdatePlayerSpaceRockSystem)).executeTyped(
      msg.sender,
      origin.parent
    );
    // either the origin or destination must be owned by the player
    require(
      ownedByComponent.getValue(origin.parent) == playerEntity ||
        ownedByComponent.getValue(destination.parent) == playerEntity,
      "must own origin or destination"
    );

    require(asteroidPosition.x == origin.x && asteroidPosition.y == origin.y, "space rock not found at origin");
    // make sure an asteroid exists at the destination
    require(
      ActiveComponent(getC(ActiveComponentID)).has(LibEncode.encodeCoord(Coord(destination.x, destination.y, 0))),
      "destination has no space rock"
    );

    // make sure the troop count at the planet is leq the one given and subtract from planet total
    UnitsComponent unitsComponent = UnitsComponent(getC(UnitsComponentID));
    for (uint256 i = 0; i < arrivalUnits.length; i++) {
      uint256 unitPlayerAsteroidEntity = LibEncode.hashEntities(
        uint256(arrivalUnits[i].unitType),
        playerEntity,
        origin.parent
      );
      LibMath.subtract(unitsComponent, unitPlayerAsteroidEntity, arrivalUnits[i].count);
    }

    uint256 moveSpeed = LibSend.getSlowestUnitSpeed(world, arrivalUnits);
    Arrival memory arrival = Arrival({
      units: arrivalUnits,
      sendType: sendType,
      arrivalBlock: block.number + ((LibSend.distance(origin, destination) * moveSpeed) / 100),
      from: playerEntity,
      to: addressToEntity(to),
      origin: origin.parent,
      destination: destination.parent
    });

    LibSend.sendUnits(world, arrival);
    return "";
  }

  function executeTyped(
    ArrivalUnit[] calldata arrivalUnits,
    ESendType sendType,
    Coord memory origin,
    Coord memory destination,
    address to
  ) public returns (bytes memory) {
    return execute(abi.encode(arrivalUnits, sendType, origin, destination, to));
  }
}
