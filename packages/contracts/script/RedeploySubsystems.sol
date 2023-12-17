// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Script.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Systems } from "@latticexyz/world/src/codegen/index.sol";
import { FunctionSelectors } from "@latticexyz/world/src/codegen/tables/FunctionSelectors.sol";
import { WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { ResourceId, ResourceIdInstance } from "@latticexyz/store/src/ResourceId.sol";

import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";
import { S_BattleSystem } from "src/systems/subsystems/S_BattleSystem.sol";
import { S_SpawnPirateAsteroidSystem } from "src/systems/subsystems/S_SpawnPirateAsteroidSystem.sol";
import { InvadeSystem } from "src/systems/InvadeSystem.sol";
import { RaidSystem } from "src/systems/RaidSystem.sol";
import { ResourceAccess } from "@latticexyz/world/src/codegen/tables/ResourceAccess.sol";
import { OwnedBy, UnitCount, P_UnitPrototypes } from "codegen/index.sol";
import { EUnit } from "src/Types.sol";

contract RedeploySubsystems is Script {
  using ResourceIdInstance for ResourceId;
  using WorldResourceIdInstance for ResourceId;
  address worldAddress = 0xdd8EbC2CBCDe94D7c12FE137D0cb47eC560ea587;

  function hasAccess(ResourceId resourceId, address caller) internal view returns (bool) {
    return
      // First check access based on the namespace. If caller has no namespace access, check access on the resource.
      ResourceAccess.get(resourceId.getNamespaceId(), caller) || ResourceAccess.get(resourceId, caller);
  }

  function redeployBattle(IWorld world) internal {
    ResourceId battleSystemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "", "S_BattleSystem");
    (address battleAddr, bool publicAccess) = Systems.get(battleSystemId);
    console.log("Found existing S_BattleSystem address: %s, public access: %s", battleAddr, publicAccess);

    world.registerSystem(battleSystemId, new S_BattleSystem(), false);
    (battleAddr, publicAccess) = Systems.get(battleSystemId);
    console.log("new S_BattleSystem address: %s, public access: %s", battleAddr, publicAccess);

    ResourceId raidSystemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "", "RaidSystem");
    (address raidSystemAddress, bool raidSystemPublicAccess) = Systems.get(raidSystemId);
    console.log("Found existing RaidSystem address: %s, public access: %s", raidSystemAddress, raidSystemPublicAccess);

    ResourceId invadeSystemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "", "InvadeSystem");
    (address invadeSystemAddress, bool invadeSystemPublicAccess) = Systems.get(invadeSystemId);
    console.log(
      "Found existing InvadeSystem address: %s, public access: %s",
      invadeSystemAddress,
      invadeSystemPublicAccess
    );

    world.grantAccess(battleSystemId, raidSystemAddress);

    console.log("raid system has access to battle system: ", hasAccess(battleSystemId, raidSystemAddress));
    console.log("invade system has access to battle system: ", hasAccess(battleSystemId, invadeSystemAddress));
  }

  function redeploySpawnPirate(IWorld world) internal {
    ResourceId spawnPirateAsteroidSystem = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "", "S_SpawnPirateAst");
    (address spawnAddr, bool pubAcc) = Systems.get(spawnPirateAsteroidSystem);
    console.log("Found existing spawnPirateAsteroidSystem address: %s, public access: %s", spawnAddr, pubAcc);

    world.registerSystem(spawnPirateAsteroidSystem, new S_SpawnPirateAsteroidSystem(), false);
    (spawnAddr, pubAcc) = Systems.get(spawnPirateAsteroidSystem);
    console.log("new spawnPirateAsteroidSystem address: %s, public access: %s", spawnAddr, pubAcc);

    ResourceId claimObjectiveSystem = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "", "ClaimObjectiveSy");
    (address claimObjectiveSystemAddress, bool claimObjectiveSystemPublicAccess) = Systems.get(claimObjectiveSystem);
    console.log(
      "Found existing claimObjectiveSystem address: %s, public access: %s",
      claimObjectiveSystemAddress,
      claimObjectiveSystemPublicAccess
    );

    world.grantAccess(spawnPirateAsteroidSystem, claimObjectiveSystemAddress);
    console.log(
      "claimObjectiveSystem has access to spawnPirateAsteroidSystem: ",
      hasAccess(spawnPirateAsteroidSystem, claimObjectiveSystemAddress)
    );
  }

  function resetPlayerAsteroid(IWorld world) internal {
    StoreSwitch.setStoreAddress(address(world));
    bytes32[] memory rocks = new bytes32[](4);
    rocks[0] = 0xc42968f35ddcbf94cb349d51a19f26f15e30593fccc76f390fc55046a7e7a8c2;
    rocks[1] = 0xfc7eed37b93510ceeb400a4866223971ad933a0e9436d85336122018b03d9bd7;
    rocks[2] = 0xb21856b6c1692abdf97d0dced09f2ba9312710f343e1cafd6506d61675623f1c;
    rocks[3] = 0xedb106a43f3fca89f1060ab108233969879d57b80a3ce6fc31d20b5c0a57b110;

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    console.log("unitPrototypes: ", unitPrototypes.length);
    for (uint256 i = 0; i < rocks.length; i++) {
      bytes32 rockEntity = rocks[i];
      bytes32 owner = OwnedBy.get(rockEntity);
      console.log("checking %s, owned by %s", uint256(rockEntity), uint256(owner));
      for (uint256 j = 1; j < unitPrototypes.length; j++) {
        uint256 unitCount = UnitCount.get(owner, rockEntity, unitPrototypes[j]);
        UnitCount.set(owner, rockEntity, unitPrototypes[j], 0);
        console.log(
          "old unit count: %s, new unit count: %s ",
          unitCount,
          UnitCount.get(owner, rockEntity, unitPrototypes[j])
        );
      }
    }
  }

  function run() external {
    IWorld world = IWorld(worldAddress);
    StoreSwitch.setStoreAddress(worldAddress);

    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    vm.startBroadcast(deployerPrivateKey);

    // redeployBattle(world);
    // redeploySpawnPirate(world);
    resetPlayerAsteroid(world);

    vm.stopBroadcast();
  }
}
