// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import { EObjectives } from "src/Types.sol";
import { ObjectiveKey } from "src/Keys.sol";
import { P_RequiredObjectives } from "codegen/tables/P_RequiredObjectives.sol";
import { P_EnumToPrototype } from "codegen/tables/P_EnumToPrototype.sol";
import "test/PrimodiumTest.t.sol";

contract ClaimObjectiveSystemTest is PrimodiumTest {
  bytes32 playerEntity = "playerEntity";
  bytes32 buildingPrototype = "buildingPrototype";
  bytes32 unitPrototype = "unitPrototype";
  bytes32 buildingEntity = "building";
  uint256 level = 2;

  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
    BuildingType.set(buildingEntity, buildingPrototype);
    OwnedBy.set(buildingEntity, playerEntity);
  }

  function testFailClaimInvalidObjective() public {
    world.claimObjective(EObjectives.LENGTH);
  }

  function testFailRequiredClaimObjective() public {
    bytes32[] memory objectives = new bytes32[](1);
    objectives[0] = P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstIronMine));
    P_RequiredObjectives.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstCopperMine)), objectives);
    world.claimObjective(EObjectives.BuildFirstCopperMine);
  }
}
