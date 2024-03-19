// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { EResource } from "src/Types.sol";
import { ResourceCount, MaxResourceCount, IsFleet, P_Transportables, UnitCount, P_Unit, UnitLevel, ResourceCount, OwnedBy, P_UnitPrototypes } from "codegen/index.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";
import { LibResource } from "libraries/LibResource.sol";
import { LibFleetStance } from "libraries/fleet/LibFleetStance.sol";

import { EResource } from "src/Types.sol";

/**
 * @title LibCombatAttributes
 * @dev Library to compute combat related attributes for entities such as fleets and asteroids in a game.
 */
library LibCombatAttributes {
  /* --------------------------- Asteroid and Fleet --------------------------- */

  /**
   * @notice Retrieves the total unit counts for an entity.
   * @param entity The address identifier of the entity.
   * @return units Array of total unit counts indexed by unit prototype IDs.
   */
  function getAllUnits(bytes32 entity) internal view returns (uint256[] memory units) {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    units = new uint256[](unitPrototypes.length);
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      units[i] = UnitCount.get(entity, unitPrototypes[i]);
    }
    return units;
  }

  /**
   * @notice Computes the total attack value for an entity.
   * @param entity The address identifier of the entity.
   * @return attack Total attack value of the entity.
   */
  function getAttack(bytes32 entity) internal view returns (uint256 attack) {
    bytes32 asteroidEntity = IsFleet.get(entity) ? OwnedBy.get(entity) : entity;
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      uint256 unitCount = UnitCount.get(entity, unitPrototypes[i]);
      if (unitCount == 0) continue;
      uint256 unitLevel = UnitLevel.get(asteroidEntity, unitPrototypes[i]);
      attack += P_Unit.getAttack(unitPrototypes[i], unitLevel) * unitCount;
    }
  }

  /**
   * @notice Computes the total attack value for an entity including its allies.
   * @param entity The address identifier of the entity.
   * @return attack Total attack value including allies' contributions.
   */
  function getAttackWithAllies(bytes32 entity) internal view returns (uint256 attack) {
    attack = getAttack(entity);
    bytes32[] memory allies = LibFleetStance.getAllies(entity);
    for (uint8 i = 0; i < allies.length; i++) {
      attack += getAttack(allies[i]);
    }
  }

  /**
   * @notice Computes the individual and total attack values for an entity and its allies.
   * @param entity The address identifier of the entity.
   * @return attack Entity's own attack value.
   * @return attacks Array of attack values by allies.
   * @return totalAttack Total attack value including all allies.
   */
  function getAttacksWithAllies(
    bytes32 entity
  ) internal view returns (uint256 attack, uint256[] memory attacks, uint256 totalAttack) {
    bytes32[] memory allies = LibFleetStance.getAllies(entity);

    attacks = new uint256[](allies.length);

    attack = getAttack(entity);
    totalAttack += attack;
    for (uint8 i = 0; i < allies.length; i++) {
      attacks[i] = getAttack(allies[i]);
      totalAttack += attacks[i];
    }
  }

  /**
   * @notice Computes the total defense value for an entity.
   * @param entity The address identifier of the entity.
   * @return The total defense value of the entity.
   */
  function getDefense(bytes32 entity) internal view returns (uint256) {
    bool isFleet = IsFleet.get(entity);
    bytes32 asteroidEntity = isFleet ? OwnedBy.get(entity) : entity;
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256 unitDefense = 0;
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      uint256 unitCount = UnitCount.get(entity, unitPrototypes[i]);
      if (unitCount == 0) continue;
      uint256 unitLevel = UnitLevel.get(asteroidEntity, unitPrototypes[i]);
      unitDefense += P_Unit.getDefense(unitPrototypes[i], unitLevel) * unitCount;
    }
    if (isFleet) return unitDefense;
    uint256 maxHp = MaxResourceCount.get(asteroidEntity, uint8(EResource.R_HP));
    uint256 hp = ResourceCount.get(asteroidEntity, uint8(EResource.R_HP));
    uint256 defenseResource = ResourceCount.get(asteroidEntity, uint8(EResource.U_Defense));
    uint256 defense = ((defenseResource + unitDefense) *
      (100 + ResourceCount.get(asteroidEntity, uint8(EResource.M_DefenseMultiplier)))) / 100;
    if (maxHp == 0) return defense;
    return (defense * hp) / maxHp;
  }

  /**
   * @notice Computes the total defense value for an entity including its allies.
   * @param entity The address identifier of the entity.
   * @return defense Total defense value including allies' contributions.
   */
  function getDefenseWithAllies(bytes32 entity) internal view returns (uint256 defense) {
    defense = getDefense(entity);
    bytes32[] memory allies = LibFleetStance.getAllies(entity);
    for (uint8 i = 0; i < allies.length; i++) {
      defense += getDefense(allies[i]);
    }
  }

  /**
   * @notice Computes the individual and total defense values for an entity and its allies.
   * @param entity The address identifier of the entity.
   * @return defense Entity's own defense value.
   * @return defenses Array of defense values by allies.
   * @return totalDefense Total defense value including all allies.
   */
  function getDefensesWithAllies(
    bytes32 entity
  ) internal view returns (uint256 defense, uint256[] memory defenses, uint256 totalDefense) {
    bytes32[] memory allies = LibFleetStance.getAllies(entity);

    defenses = new uint256[](allies.length);

    defense = getDefense(entity);
    totalDefense += defense;

    for (uint8 i = 0; i < allies.length; i++) {
      defenses[i] = getDefense(allies[i]);
      totalDefense += defenses[i];
    }
  }

  /**
   * @notice Computes the total hit points (HP) for an entity.
   * @param entity The address identifier of the entity.
   * @return hp Total HP of the entity.
   */
  function getHp(bytes32 entity) internal view returns (uint256 hp) {
    bytes32 ownerAsteroidEntity = IsFleet.get(entity) ? OwnedBy.get(entity) : entity;
    hp += ResourceCount.get(entity, uint8(EResource.R_HP));
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      uint256 unitCount = UnitCount.get(entity, unitPrototypes[i]);
      if (unitCount == 0) continue;
      uint256 unitLevel = UnitLevel.get(ownerAsteroidEntity, unitPrototypes[i]);
      hp += P_Unit.getHp(unitPrototypes[i], unitLevel) * unitCount;
    }
  }

  /**
   * @notice Computes the total hit points (HP) for an entity including its allies.
   * @param entity The address identifier of the entity.
   * @return hp Total HP including allies' contributions.
   */
  function getHpWithAllies(bytes32 entity) internal view returns (uint256 hp) {
    hp = getHp(entity);
    bytes32[] memory allies = LibFleetStance.getAllies(entity);
    for (uint8 i = 0; i < allies.length; i++) {
      hp += getHp(allies[i]);
    }
  }

  /**
   * @notice Computes the individual and total HP for an entity and its allies.
   * @param entity The address identifier of the entity.
   * @return hp Entity's own HP.
   * @return hps Array of HP values by allies.
   * @return totalHp Total HP including all allies.
   */

  function getHpsWithAllies(bytes32 entity) internal view returns (uint256 hp, uint256[] memory hps, uint256 totalHp) {
    hp = getHp(entity);
    bytes32[] memory allies = LibFleetStance.getAllies(entity);
    hps = new uint256[](allies.length);
    totalHp = hp;
    for (uint8 i = 0; i < allies.length; i++) {
      hps[i] = getHp(allies[i]);
      totalHp += hps[i];
    }
  }

  /**
   * @notice Computes the total cargo (resources) carried by an entity.
   * @param entity The address identifier of the entity.
   * @return cargo Total cargo carried by the entity.
   */
  function getCargo(bytes32 entity) internal view returns (uint256 cargo) {
    uint8[] memory transportables = P_Transportables.get();
    for (uint8 i = 0; i < transportables.length; i++) {
      cargo += ResourceCount.get(entity, transportables[i]);
    }
  }

  /**
   * @notice Computes the total cargo (resources) carried by an entity including its allies.
   * @param entity The address identifier of the entity.
   * @return cargo Total cargo including allies' contributions.
   */
  function getCargoWithAllies(bytes32 entity) internal view returns (uint256 cargo) {
    cargo = getCargo(entity);
    bytes32[] memory allies = LibFleetStance.getAllies(entity);
    for (uint8 i = 0; i < allies.length; i++) {
      cargo += getCargo(allies[i]);
    }
  }

  /**
   * @notice Computes the total cargo capacity for an entity.
   * @param entity The address identifier of the entity.
   * @return cargoCapacity Total cargo capacity of the entity.
   */
  function getCargoCapacity(bytes32 entity) internal view returns (uint256 cargoCapacity) {
    bytes32 asteroidEntity = IsFleet.get(entity) ? OwnedBy.get(entity) : entity;
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      uint256 unitCount = UnitCount.get(entity, unitPrototypes[i]);
      uint256 unitLevel = UnitLevel.get(asteroidEntity, unitPrototypes[i]);
      cargoCapacity += P_Unit.getCargo(unitPrototypes[i], unitLevel) * unitCount;
    }
  }

  /**
   * @notice Computes the total cargo capacity for an entity including its allies.
   * @param entity The address identifier of the entity.
   * @return cargoCapacity Total cargo capacity including allies' contributions.
   */
  function getCargoCapacityWithAllies(bytes32 entity) internal view returns (uint256 cargoCapacity) {
    cargoCapacity = getCargoCapacity(entity);
    bytes32[] memory allies = LibFleetStance.getAllies(entity);
    for (uint8 i = 0; i < allies.length; i++) {
      cargoCapacity += getCargoCapacity(allies[i]);
    }
  }

  /**
   * @notice Computes the available cargo space for an entity.
   * @param entity The address identifier of the entity.
   * @return The available cargo space for the entity.
   */
  function getCargoSpace(bytes32 entity) internal view returns (uint256) {
    uint256 cargoCapacity = getCargoCapacity(entity);
    uint256 cargo = getCargo(entity);
    return cargoCapacity > cargo ? cargoCapacity - cargo : 0;
  }

  /**
   * @notice Computes the available cargo space for an entity including its allies.
   * @param entity The address identifier of the entity.
   * @return cargoSpace Total available cargo space including allies' contributions.
   */
  function getCargoSpaceWithAllies(bytes32 entity) internal view returns (uint256 cargoSpace) {
    cargoSpace = getCargoSpace(entity);
    bytes32[] memory allies = LibFleetStance.getAllies(entity);
    for (uint256 i = 0; i < allies.length; i++) {
      cargoSpace += getCargoSpace(allies[i]);
    }
  }

  /**
   * @notice Computes the individual and total available cargo spaces for an entity and its allies.
   * @param entity The address identifier of the entity.
   * @return cargoSpace Entity's own available cargo space.
   * @return cargoSpaces Array of available cargo spaces by allies.
   * @return totalCargoSpace Total available cargo space including all allies.
   */
  function getCargoSpacesWithAllies(
    bytes32 entity
  ) internal view returns (uint256 cargoSpace, uint256[] memory cargoSpaces, uint256 totalCargoSpace) {
    bytes32[] memory allies = LibFleetStance.getAllies(entity);
    cargoSpaces = new uint256[](allies.length);
    cargoSpace = getCargoSpace(entity);
    totalCargoSpace = cargoSpace;

    for (uint8 i = 0; i < allies.length; i++) {
      cargoSpaces[i] = getCargoSpace(allies[i]);
      totalCargoSpace += cargoSpaces[i];
    }
  }

  /* -------------------------------- Asteroid -------------------------------- */
  /**
   * @notice Computes the total stored resources in an asteroid and its defending fleets.
   * @param asteroidEntity The identifier of the asteroid.
   * @return totalResources Total resources stored in the asteroid and its defenders.
   */
  function getStoredResourceCountWithDefenders(bytes32 asteroidEntity) internal view returns (uint256 totalResources) {
    totalResources = LibResource.getStoredResourceCountVaulted(asteroidEntity);
    bytes32[] memory allies = LibFleetStance.getDefendingFleets(asteroidEntity);
    for (uint256 i = 0; i < allies.length; i++) {
      totalResources += getCargo(allies[i]);
    }
  }

  /**
   * @notice Computes the stored resource counts in an asteroid and its defending fleets.
   * @param asteroidEntity The identifier of the asteroid.
   * @return resourceCounts Array of stored resource counts by resource type.
   * @return totalResources Total resources stored in the asteroid and its defenders.
   */
  function getStoredResourceCountsWithDefenders(
    bytes32 asteroidEntity
  ) internal view returns (uint256[] memory, uint256) {
    (uint256[] memory resourceCounts, uint256 totalResources) = LibResource.getStoredResourceCountsVaulted(
      asteroidEntity
    );
    bytes32[] memory defenderFleetEntities = LibFleetStance.getDefendingFleets(asteroidEntity);
    for (uint256 i = 0; i < defenderFleetEntities.length; i++) {
      uint256[] memory defenderResourceCounts = LibFleet.getResourceCounts(defenderFleetEntities[i]);
      for (uint256 j = 0; j < defenderResourceCounts.length; j++) {
        resourceCounts[j] += defenderResourceCounts[j];
        totalResources += defenderResourceCounts[j];
      }
    }
    return (resourceCounts, totalResources);
  }

  /**
   * @notice Retrieves the encryption level of an asteroid.
   * @param asteroidEntity The identifier of the asteroid.
   * @return encryption The encryption level of the asteroid.
   */
  function getEncryption(bytes32 asteroidEntity) internal view returns (uint256 encryption) {
    encryption = ResourceCount.get(asteroidEntity, uint8(EResource.R_Encryption));
  }
}
