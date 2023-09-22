// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IWorld } from "solecs/System.sol";
import { SingletonID } from "solecs/SingletonID.sol";

//components
import { ReversePositionComponent, ID as ReversePositionComponentID } from "components/ReversePositionComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { AsteroidCountComponent, ID as AsteroidCountComponentID } from "components/AsteroidCountComponent.sol";
import { AsteroidTypeComponent, ID as AsteroidTypeComponentID } from "components/AsteroidTypeComponent.sol";
import { P_UnitRequirementComponent, ID as P_UnitRequirementComponentID } from "components/P_UnitRequirementComponent.sol";
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "components/P_RequiredResourcesComponent.sol";
import { P_MaxResourceStorageComponent, ID as P_MaxResourceStorageComponentID } from "components/P_MaxResourceStorageComponent.sol";
import { P_MaxStorageComponent, ID as P_MaxStorageComponentID } from "components/P_MaxStorageComponent.sol";
import { P_SpawnPirateAsteroidComponent, ID as P_SpawnPirateAsteroidComponentID } from "components/P_SpawnPirateAsteroidComponent.sol";
import { Coord, ESpaceRockType } from "../types.sol";

import { Trigonometry as Trig } from "trig/src/Trigonometry.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibUpdateSpaceRock } from "libraries/LibUpdateSpaceRock.sol";
import { LibMath } from "libraries/LibMath.sol";
import { ABDKMath64x64 as Math } from "abdk-libraries-solidity/ABDKMath64x64.sol";
import { PersonalPirate, PirateKey } from "../prototypes/PirateAsteroids.sol";
import { ResourceValues } from "../types.sol";
import { PirateComponent, ID as PirateComponentID } from "components/PirateComponent.sol";

library LibPirateAsteroid {
  /**
   * @dev Creates a new asteroid for a player in the given world.
   * @param world The World contract address.
   * @param ownerEntity The entity ID of the owner player.
   * @param objectiveId The entity ID of the Objective which spawns the asteroid.
   * @return asteroidEntity The entity ID of the created asteroid.
   */
  function createAsteroid(
    IWorld world,
    uint256 ownerEntity,
    uint256 objectiveId
  ) internal returns (uint256 asteroidEntity) {
    P_SpawnPirateAsteroidComponent pirateAsteroidComponent = P_SpawnPirateAsteroidComponent(
      world.getComponent(P_SpawnPirateAsteroidComponentID)
    );

    if (!pirateAsteroidComponent.has(objectiveId)) {
      return 0;
    }
    uint256 spawnPirateAsteroid = pirateAsteroidComponent.getValue(objectiveId);

    uint256 personalPirateEntity = getPersonalPirate(ownerEntity);
    PirateComponent pirateComponent = PirateComponent(world.getComponent(PirateComponentID));
    //setup personal pirate if not setup
    if (!pirateComponent.has(personalPirateEntity)) {
      setupPersonalPirate(world, ownerEntity);
    }

    asteroidEntity = LibEncode.hashEntity(world, personalPirateEntity);
    AsteroidTypeComponent asteroidTypeComponent = AsteroidTypeComponent(world.getComponent(AsteroidTypeComponentID));
    require(!asteroidTypeComponent.has(asteroidEntity), "[LibAsteroid] asteroid already exists");
    P_SpawnPirateAsteroidComponent(world.getComponent(P_SpawnPirateAsteroidComponentID)).set(
      asteroidEntity,
      spawnPirateAsteroid
    );
    pirateComponent.set(asteroidEntity, ownerEntity);

    PositionComponent positionComponent = PositionComponent(world.getComponent(PositionComponentID));

    uint256 playerHomeAsteroidEntity = LibUpdateSpaceRock.getPlayerAsteroidEntity(world, ownerEntity);
    Coord memory playerHomeAsteroidPosition = positionComponent.getValue(playerHomeAsteroidEntity);

    Coord memory relativePosition = positionComponent.getValue(spawnPirateAsteroid);

    Coord memory position = Coord({
      x: playerHomeAsteroidPosition.x + relativePosition.x,
      y: playerHomeAsteroidPosition.y + relativePosition.y,
      parent: 0
    });

    positionComponent.set(asteroidEntity, position);
    asteroidTypeComponent.set(asteroidEntity, ESpaceRockType.ASTEROID);

    // For now, we will use this component to ensure the owner can only build on their asteroid.
    // TODO: remove this component later as it might be for temporary use.
    positionComponent.set(personalPirateEntity, 0, 0, asteroidEntity);
    uint256 encodedPosition = LibEncode.encodeCoord(position);

    //remove old pirate asteroid coord as active
    if (positionComponent.has(asteroidEntity)) {
      uint256 oldEncodedPosition = LibEncode.encodeCoord(positionComponent.getValue(asteroidEntity));
      ReversePositionComponent(world.getComponent(ReversePositionComponentID)).remove(oldEncodedPosition);
    }

    // Mark the asteroid's position as active in the ReversePositionComponent.
    ReversePositionComponent(world.getComponent(ReversePositionComponentID)).set(encodedPosition, asteroidEntity);

    positionComponent.set(asteroidEntity, position);

    OwnedByComponent(world.getComponent(OwnedByComponentID)).set(asteroidEntity, personalPirateEntity);

    setupPirateAsteroid(world, spawnPirateAsteroid, asteroidEntity);
  }

  function setupPersonalPirate(IWorld world, uint256 playerEntity) internal {
    uint256 personalPirateEntity = getPersonalPirate(playerEntity);
    P_MaxResourceStorageComponent maxResourceStorageComponent = P_MaxResourceStorageComponent(
      world.getComponent(P_MaxResourceStorageComponentID)
    );
    P_MaxStorageComponent maxStorageComponent = P_MaxStorageComponent(world.getComponent(P_MaxStorageComponentID));
    PirateComponent(world.getComponent(PirateComponentID)).set(personalPirateEntity, playerEntity);

    uint256[] memory resourceIds = maxResourceStorageComponent.getValue(PersonalPirate);
    maxResourceStorageComponent.set(personalPirateEntity, resourceIds);
    for (uint256 i = 0; i < resourceIds.length; i++) {
      maxStorageComponent.set(
        LibEncode.hashKeyEntity(resourceIds[i], personalPirateEntity),
        maxStorageComponent.getValue(LibEncode.hashKeyEntity(resourceIds[i], PersonalPirate))
      );
    }
  }

  function setupPirateAsteroid(IWorld world, uint256 spawnPirateAsteroid, uint256 asteroidEntity) internal {
    uint256 personalPirateEntity = OwnedByComponent(world.getComponent(OwnedByComponentID)).getValue(asteroidEntity);

    P_UnitRequirementComponent unitRequirementComponent = P_UnitRequirementComponent(
      world.getComponent(P_UnitRequirementComponentID)
    );
    if (unitRequirementComponent.has(spawnPirateAsteroid)) {
      ResourceValues memory unitsToSetup = unitRequirementComponent.getValue(spawnPirateAsteroid);

      for (uint256 i = 0; i < unitsToSetup.resources.length; i++) {
        LibUpdateSpaceRock.addUnitsToAsteroid(
          world,
          personalPirateEntity,
          asteroidEntity,
          unitsToSetup.resources[i],
          unitsToSetup.values[i]
        );
      }
    }

    P_RequiredResourcesComponent requiredResourcesComponent = P_RequiredResourcesComponent(
      world.getComponent(P_RequiredResourcesComponentID)
    );
    if (requiredResourcesComponent.has(spawnPirateAsteroid)) {
      ResourceValues memory resourcesToSetup = requiredResourcesComponent.getValue(spawnPirateAsteroid);

      for (uint256 i = 0; i < resourcesToSetup.resources.length; i++) {
        LibStorage.addResourceToStorage(
          world,
          personalPirateEntity,
          resourcesToSetup.resources[i],
          resourcesToSetup.values[i]
        );
      }
    }
  }

  function getPersonalPirate(uint256 playerEntity) internal pure returns (uint256) {
    return LibEncode.hashKeyEntity(PirateKey, playerEntity);
  }
}
