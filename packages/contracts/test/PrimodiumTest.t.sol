// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { ResourceAccess, NamespaceOwner } from "@latticexyz/world/src/codegen/index.sol";
import { ROOT_NAMESPACE_ID } from "@latticexyz/world/src/constants.sol";
import { WORLD_SPEED_SCALE, NUM_UNITS, UNIT_SPEED_SCALE } from "src/constants.sol";
import { IERC20Mintable } from "@latticexyz/world-modules/src/modules/erc20-puppet/IERC20Mintable.sol";

import "src/utils.sol";
import "codegen/world/IWorld.sol";
import "codegen/index.sol";
import "src/Types.sol";
import "codegen/Prototypes.sol";
import "codegen/Libraries.sol";
import "src/Keys.sol";
import "src/Types.sol";

struct PositionData2D {
  int32 x;
  int32 y;
}

function toString(bytes32 entity) pure returns (string memory) {
  return string(abi.encodePacked(entity));
}

contract PrimodiumTest is MudTest {
  IWorld public world;
  uint256 userNonce = 0;

  address creator;
  address payable alice;
  address payable bob;
  address payable eve;

  uint8 Iron = uint8(EResource.Iron);
  uint8 Copper = uint8(EResource.Copper);
  uint8 Platinum = uint8(EResource.Platinum);
  uint8 U_MaxMoves = uint8(EResource.U_MaxMoves);
  uint8 Kimberlite = uint8(EResource.Kimberlite);
  uint8 Lithium = uint8(EResource.Lithium);
  uint8 Titanium = uint8(EResource.Titanium);
  uint8 R_Titanium = uint8(EResource.R_Titanium);

  function setUp() public virtual override {
    super.setUp();
    world = IWorld(worldAddress);
    creator = world.creator();

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    address admin = vm.addr(deployerPrivateKey);
    IERC20Mintable wETH = IERC20Mintable(P_GameConfig2.getWETHAddress());
    vm.prank(admin);
    wETH.mint(creator, 100 ether);

    vm.startPrank(creator);
    ResourceAccess.set(ROOT_NAMESPACE_ID, creator, true);
    NamespaceOwner.set(ROOT_NAMESPACE_ID, creator);
    vm.stopPrank();

    alice = getUser();
    bob = getUser();
    eve = getUser();
  }

  function getUser() internal returns (address payable) {
    address payable user = payable(address(uint160(uint256(keccak256(abi.encodePacked(userNonce++))))));
    vm.deal(user, 100 ether);
    return user;
  }

  modifier prank(address prankster) {
    vm.startPrank(prankster);
    _;
    vm.stopPrank();
  }

  function switchPrank(address prankster) internal {
    vm.stopPrank();
    vm.startPrank(prankster);
  }

  function assertEq(PositionData memory coordA, PositionData memory coordB) internal {
    assertEq(coordA.x, coordB.x, "[assertEq]: x doesn't match");
    assertEq(coordA.y, coordB.y, "[assertEq]: y doesn't match");
    assertEq(coordA.parent, coordB.parent, "[assertEq]: parent doesn't match");
  }

  function assertEq(EResource a, EResource b) internal {
    assertEq(uint256(a), uint256(b));
  }

  function logPosition(PositionData memory coord) internal view {
    console.log("x");
    console.logInt(coord.x);
    console.log("y");
    console.logInt(coord.y);
    console.log("parent", uint256(coord.parent));
  }

  function getHomeAsteroidPosition(address player) public view returns (PositionData memory) {
    bytes32 asteroid = Home.get(addressToEntity(player));
    return Position.get(asteroid);
  }

  function getMainBasePosition(address player) internal view returns (PositionData memory) {
    PositionData memory position = Position.get(MainBasePrototypeId);
    return getPosition(PositionData2D(position.x, position.y), player);
  }

  function getPosition1(address player) internal pure returns (PositionData memory) {
    PositionData2D memory coord1 = PositionData2D(15, 12);
    return getPosition(coord1, player);
  }

  function getPosition2(address player) internal pure returns (PositionData memory) {
    PositionData2D memory coord2 = PositionData2D(23, 17);
    return getPosition(coord2, player);
  }

  function getPosition3(address player) internal pure returns (PositionData memory) {
    PositionData2D memory coord3 = PositionData2D(13, 8);
    return getPosition(coord3, player);
  }

  function getIronPosition(address player) internal pure returns (PositionData memory) {
    PositionData2D memory coord = PositionData2D(20, 8);
    return getPosition(coord, player);
  }

  function getIronPosition2(address player) internal pure returns (PositionData memory) {
    PositionData2D memory coord = PositionData2D(21, 8);
    return getPosition(coord, player);
  }

  function getCopperPosition(address player) internal pure returns (PositionData memory) {
    PositionData2D memory coord = PositionData2D(20, 15);
    return getPosition(coord, player);
  }

  function getNonIronPosition(address player) internal pure returns (PositionData memory) {
    PositionData2D memory coord = PositionData2D(8, 15);
    return getPosition(coord, player);
  }

  function getTilePosition(bytes32 asteroidEntity, EResource resource) internal view returns (PositionData memory) {
    uint8 mapId = Asteroid.getMapId(asteroidEntity);
    console.log("map id:, ", mapId);
    Bounds memory bounds = LibBuilding.getSpaceRockBounds(asteroidEntity);
    console.log("x bounds: %s, %s", uint32(bounds.minX), uint32(bounds.maxX));
    console.log("y bounds: %s, %s", uint32(bounds.minY), uint32(bounds.maxY));
    for (int32 i = bounds.minX; i < bounds.maxX; i++) {
      for (int32 j = bounds.minY; j < bounds.maxY; j++) {
        uint8 foundResource = P_Terrain.get(mapId, i, j);
        if (foundResource == uint8(resource)) {
          return PositionData(i, j, asteroidEntity);
        }
      }
    }
    revert("Resource not found");
  }

  function getPosition(
    int32 x,
    int32 y,
    address player
  ) internal pure returns (PositionData memory coord) {
    return getPosition(PositionData2D(x, y), player);
  }

  function getPosition(PositionData2D memory coord2D, address player)
    internal
    pure
    returns (PositionData memory coord)
  {
    bytes32 playerEntity = addressToEntity(player);
    bytes32 asteroid = LibEncode.getHash(playerEntity);

    coord = PositionData(coord2D.x, coord2D.y, asteroid);
  }

  function spawn(address player) internal returns (bytes32) {
    vm.prank(player);
    world.spawn();
    bytes32 playerEntity = addressToEntity(player);
    return Home.get(playerEntity);
  }

  function get2x2Blueprint() internal pure returns (int32[] memory blueprint) {
    blueprint = new int32[](8);

    blueprint[0] = 0;
    blueprint[1] = 0;

    blueprint[2] = 0;
    blueprint[3] = -1;

    blueprint[4] = -1;
    blueprint[5] = 0;

    blueprint[6] = -1;
    blueprint[7] = -1;
  }

  function removeRequiredTile(EBuilding building) internal {
    bytes32 buildingEntity = P_EnumToPrototype.get(BuildingKey, uint8(building));
    P_RequiredTile.deleteRecord(buildingEntity);
  }

  function removeRequiredResources(EBuilding building) internal {
    bytes32 buildingEntity = P_EnumToPrototype.get(BuildingKey, uint8(building));
    uint256 buildingMaxLevel = P_MaxLevel.get(buildingEntity);
    for (uint256 i = 0; i <= buildingMaxLevel; i++) {
      P_RequiredResources.deleteRecord(buildingEntity, i);
    }
  }

  function removeRequiredMainBase(EBuilding building) internal {
    bytes32 buildingEntity = P_EnumToPrototype.get(BuildingKey, uint8(building));
    uint256 buildingMaxLevel = P_MaxLevel.get(buildingEntity);
    for (uint256 i = 0; i <= buildingMaxLevel; i++) {
      P_RequiredBaseLevel.deleteRecord(buildingEntity, i);
    }
  }

  function removeRequirements(EBuilding building) internal {
    removeRequiredTile(building);
  }

  function getUnitArray(uint256 unit1Count, uint256 unit2Count) internal pure returns (uint256[] memory) {
    uint256[] memory unitArray = new uint256[](NUM_UNITS);
    unitArray[0] = unit1Count;
    unitArray[1] = unit2Count;
    return unitArray;
  }
}
