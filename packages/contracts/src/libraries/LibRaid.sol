// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "codegen/world/IWorld.sol";
import { RockType, OwnedBy, BattleResultData, RaidResult, RaidResultData, P_IsUtility, P_UnitPrototypes, Home } from "codegen/Tables.sol";
import { ERock, EResource, ESendType } from "src/Types.sol";
import { LibBattle } from "libraries/LibBattle.sol";
import { LibResource } from "libraries/LibResource.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibUnit } from "libraries/LibUnit.sol";

function toString(bytes32 entity) pure returns (string memory) {
  return string(abi.encodePacked(entity));
}

library LibRaid {
  function raid(
    IWorld world,
    bytes32 playerEntity,
    bytes32 rockEntity
  ) internal {
    require(RockType.get(rockEntity) == ERock.Asteroid, "[LibRaid] Can only raid asteroids");

    bytes32 defenderEntity = OwnedBy.get(rockEntity);
    require(defenderEntity != 0, "[LibRaid] Can not raid unowned rock");
    require(defenderEntity != playerEntity, "[LibRaid] Can not raid your own rock");

    BattleResultData memory br = world.battle(playerEntity, defenderEntity, rockEntity, ESendType.Raid);
    for (uint256 i = 0; i < br.attackerStartingUnits.length; i++) {}

    resolveRaid(br);
  }

  function resolveRaid(BattleResultData memory br) internal returns (RaidResultData memory) {
    LibBattle.updateUnitsAfterBattle(br, ESendType.Raid);

    (uint256 totalResources, uint256[] memory defenderResources) = LibResource.getAllResourceCounts(br.defender);

    RaidResultData memory raidResult = RaidResultData({
      defenderValuesBeforeRaid: new uint256[](defenderResources.length),
      raidedAmount: new uint256[](defenderResources.length)
    });

    if (br.totalCargo == 0 || totalResources == 0) return raidResult;

    for (uint256 i = 1; i < defenderResources.length; i++) {
      EResource resource = EResource(i);
      if (P_IsUtility.get(resource)) continue;
      uint256 raidAmount = (br.totalCargo * defenderResources[i]) / totalResources;

      if (defenderResources[i] < raidAmount) {
        raidAmount = defenderResources[i];
      }
      if (raidAmount == 0) continue;
      raidResult.defenderValuesBeforeRaid[i] = defenderResources[i];
      raidResult.raidedAmount[i] = raidAmount;
      LibStorage.increaseStoredResource(br.attacker, resource, raidAmount);
      LibStorage.decreaseStoredResource(br.defender, resource, raidAmount);
    }
    RaidResult.emitEphemeral(keccak256(abi.encode(br)), raidResult);
    return raidResult;
  }
}
