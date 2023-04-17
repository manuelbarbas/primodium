// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { BoolComponent } from "std-contracts/components/BoolComponent.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";

library LibResearch {
  // research fast miner with 100 IronResource and 100 CopperResource
  function researchFastMiner(
    Uint256Component ironResourceComponent,
    Uint256Component copperResourceComponent,
    BoolComponent fastMinerResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 IRON_REQUIRED = 100;
    uint256 COPPER_REQUIRED = 100;

    if (fastMinerResearchComponent.has(entity) && fastMinerResearchComponent.getValue(entity)) {
      return abi.encode(false);
    }

    uint256 curCopper = copperResourceComponent.has(entity) ? copperResourceComponent.getValue(entity) : 0;
    uint256 curIron = ironResourceComponent.has(entity) ? ironResourceComponent.getValue(entity) : 0;

    if (curCopper < COPPER_REQUIRED || curIron < IRON_REQUIRED) {
      return abi.encode(false);
    } else {
      copperResourceComponent.set(entity, curCopper - COPPER_REQUIRED);
      ironResourceComponent.set(entity, curIron - IRON_REQUIRED);

      fastMinerResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // research copper with 200 IronResource
  function researchCopper(
    Uint256Component ironResourceComponent,
    BoolComponent copperResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 IRON_REQUIRED = 200;

    if (copperResearchComponent.has(entity) && copperResearchComponent.getValue(entity)) {
      return abi.encode(false);
    }

    uint256 curIron = ironResourceComponent.has(entity) ? ironResourceComponent.getValue(entity) : 0;

    if (curIron < IRON_REQUIRED) {
      return abi.encode(false);
    } else {
      ironResourceComponent.set(entity, curIron - IRON_REQUIRED);

      copperResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // research lithium with 20 IronPlateCrafted and 100 CopperResource
  function researchLithium(
    Uint256Component ironPlateCraftedComponent,
    Uint256Component copperResourceComponent,
    BoolComponent lithiumResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 IRON_PLATE_REQUIRED = 20;
    uint256 COPPER_REQUIRED = 100;

    if (lithiumResearchComponent.has(entity) && lithiumResearchComponent.getValue(entity)) {
      return abi.encode(false);
    }

    uint256 curIronPlate = ironPlateCraftedComponent.has(entity) ? ironPlateCraftedComponent.getValue(entity) : 0;
    uint256 curCopper = copperResourceComponent.has(entity) ? copperResourceComponent.getValue(entity) : 0;

    if (curIronPlate < IRON_PLATE_REQUIRED || curCopper < COPPER_REQUIRED) {
      return abi.encode(false);
    } else {
      ironPlateCraftedComponent.set(entity, curIronPlate - IRON_PLATE_REQUIRED);
      copperResourceComponent.set(entity, curCopper - COPPER_REQUIRED);

      lithiumResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // research titanium with 50 BasicPowerSourceCrafted
  function researchTitanium(
    Uint256Component basicPowerSourceCraftedComponent,
    BoolComponent titaniumResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 BASIC_POWER_SOURCE_REQUIRED = 50;

    if (titaniumResearchComponent.has(entity) && titaniumResearchComponent.getValue(entity)) {
      return abi.encode(false);
    }

    uint256 curBasicPowerSource = basicPowerSourceCraftedComponent.has(entity)
      ? basicPowerSourceCraftedComponent.getValue(entity)
      : 0;

    if (curBasicPowerSource < BASIC_POWER_SOURCE_REQUIRED) {
      return abi.encode(false);
    } else {
      basicPowerSourceCraftedComponent.set(entity, curBasicPowerSource - BASIC_POWER_SOURCE_REQUIRED);

      titaniumResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // research osmium with 300 TitaniumResource
  function researchOsmium(
    Uint256Component titaniumResourceComponent,
    BoolComponent osmiumResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 TITANIUM_REQUIRED = 300;

    if (osmiumResearchComponent.has(entity) && osmiumResearchComponent.getValue(entity)) {
      return abi.encode(false);
    }

    uint256 curTitanium = titaniumResourceComponent.has(entity) ? titaniumResourceComponent.getValue(entity) : 0;

    if (curTitanium < TITANIUM_REQUIRED) {
      return abi.encode(false);
    } else {
      titaniumResourceComponent.set(entity, curTitanium - TITANIUM_REQUIRED);

      osmiumResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // research tungsten with 100 RefinedOsmiumCrafted 200 TitaniumResource
  function researchTungsten(
    Uint256Component refinedOsmiumCraftedComponent,
    Uint256Component titaniumResourceComponent,
    BoolComponent tungstenResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 REFINED_OSMIUM_REQUIRED = 100;
    uint256 TITANIUM_REQUIRED = 200;

    if (tungstenResearchComponent.has(entity) && tungstenResearchComponent.getValue(entity)) {
      return abi.encode(false);
    }

    uint256 curRefinedOsmium = refinedOsmiumCraftedComponent.has(entity)
      ? refinedOsmiumCraftedComponent.getValue(entity)
      : 0;
    uint256 curTitanium = titaniumResourceComponent.has(entity) ? titaniumResourceComponent.getValue(entity) : 0;

    if (curRefinedOsmium < REFINED_OSMIUM_REQUIRED || curTitanium < TITANIUM_REQUIRED) {
      return abi.encode(false);
    } else {
      refinedOsmiumCraftedComponent.set(entity, curRefinedOsmium - REFINED_OSMIUM_REQUIRED);
      titaniumResourceComponent.set(entity, curTitanium - TITANIUM_REQUIRED);

      tungstenResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // research iridium with 100 TungstenRodCrafted 100 OsmiumResource
  function researchIridium(
    Uint256Component tungstenRodCraftedComponent,
    Uint256Component osmiumResourceComponent,
    BoolComponent iridiumResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 TUNGSTEN_ROD_REQUIRED = 100;
    uint256 OSMIUM_REQUIRED = 100;

    if (iridiumResearchComponent.has(entity) && iridiumResearchComponent.getValue(entity)) {
      return abi.encode(false);
    }

    uint256 curTungstenRod = tungstenRodCraftedComponent.has(entity) ? tungstenRodCraftedComponent.getValue(entity) : 0;
    uint256 curOsmium = osmiumResourceComponent.has(entity) ? osmiumResourceComponent.getValue(entity) : 0;

    if (curTungstenRod < TUNGSTEN_ROD_REQUIRED || curOsmium < OSMIUM_REQUIRED) {
      return abi.encode(false);
    } else {
      tungstenRodCraftedComponent.set(entity, curTungstenRod - TUNGSTEN_ROD_REQUIRED);
      osmiumResourceComponent.set(entity, curOsmium - OSMIUM_REQUIRED);

      iridiumResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // research kimberlite with 100 IridiumCrystalCrafted 100 TungstenResource
  function researchKimberlite(
    Uint256Component iridiumCrystalCraftedComponent,
    Uint256Component tungstenResourceComponent,
    BoolComponent kimberliteResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 IRIDIUM_CRYSTAL_REQUIRED = 100;
    uint256 TUNGSTEN_REQUIRED = 100;

    if (kimberliteResearchComponent.has(entity) && kimberliteResearchComponent.getValue(entity)) {
      return abi.encode(false);
    }

    uint256 curIridiumCrystal = iridiumCrystalCraftedComponent.has(entity)
      ? iridiumCrystalCraftedComponent.getValue(entity)
      : 0;
    uint256 curTungsten = tungstenResourceComponent.has(entity) ? tungstenResourceComponent.getValue(entity) : 0;

    if (curIridiumCrystal < IRIDIUM_CRYSTAL_REQUIRED || curTungsten < TUNGSTEN_REQUIRED) {
      return abi.encode(false);
    } else {
      iridiumCrystalCraftedComponent.set(entity, curIridiumCrystal - IRIDIUM_CRYSTAL_REQUIRED);
      tungstenResourceComponent.set(entity, curTungsten - TUNGSTEN_REQUIRED);

      kimberliteResearchComponent.set(entity);
      return abi.encode(true);
    }
  }
}
