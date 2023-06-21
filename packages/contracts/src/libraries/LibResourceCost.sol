// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { Uint256ArrayComponent } from "std-contracts/components/Uint256ArrayComponent.sol";
import { BoolComponent } from "std-contracts/components/BoolComponent.sol";
import { entityToAddress } from "solecs/utils.sol";
import { LibMath } from "./LibMath.sol";
import { LibEncode } from "./LibEncode.sol";

library LibResourceCost {
  
   
   function hasRequiredResources(Uint256ArrayComponent requiredResourcesComponent,
   Uint256Component itemComponent,uint256 entity,uint256 playerEntity) internal view returns (bool) 
   {
    uint256[] memory requiredResources = requiredResourcesComponent.getValue(entity);    
        for (uint256 i = 0; i < requiredResources.length; i++) 
        {
            uint256 resourceCost = LibMath.getSafeUint256Value(itemComponent,
                LibEncode.hashFromKey(requiredResources[i], entity));
            if(resourceCost > LibMath.getSafeUint256Value(itemComponent,
                LibEncode.hashFromAddress(requiredResources[i], entityToAddress(playerEntity))))
                return false;
        }
        return true; 
   }

   
   function spendRequiredResources(Uint256ArrayComponent requiredResourcesComponent,
   Uint256Component itemComponent,uint256 entity,uint256 playerEntity) internal 
   {
        uint256[] memory requiredResources = requiredResourcesComponent.getValue(entity);    
        for (uint256 i = 0; i < requiredResources.length; i++) 
        {
            uint256 resourceCost = LibMath.getSafeUint256Value(itemComponent,
                LibEncode.hashFromKey(requiredResources[i], entity));
            uint256 curItem = LibMath.getSafeUint256Value(
            itemComponent,LibEncode.hashFromAddress(requiredResources[i],
             entityToAddress(playerEntity)));
            itemComponent.set(
            LibEncode.hashFromAddress(requiredResources[i], entityToAddress(playerEntity)),
            curItem - resourceCost); 
        }
   }  
}
