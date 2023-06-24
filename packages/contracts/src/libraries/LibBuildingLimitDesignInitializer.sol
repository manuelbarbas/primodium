pragma solidity >=0.8.0;


import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById } from "solecs/utils.sol";
// Production Buildings
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { Uint256ArrayComponent } from "std-contracts/components/Uint256ArrayComponent.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { BuildingLimitComponent, ID as BuildingLimitComponentID } from "components/BuildingLimitComponent.sol";


import { LibEncode } from "../libraries/LibEncode.sol";


library LibBuildingLimitDesignInitializer {

    function init(IWorld world) internal
    {
        IUint256Component components = world.components();
        BuildingLimitComponent buildingLimitComponent = BuildingLimitComponent(getAddressById(components,BuildingLimitComponentID));

        buildingLimitComponent.set(uint256(1), 5);
        buildingLimitComponent.set(uint256(2), 10);
        buildingLimitComponent.set(uint256(3), 15);
        buildingLimitComponent.set(uint256(4), 20);
        buildingLimitComponent.set(uint256(5), 25);
        buildingLimitComponent.set(uint256(6), 30);

    }
}