// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// research components
import { CopperResearchComponent, ID as CopperResearchComponentID } from "components/CopperResearchComponent.sol";
import { LithiumResearchComponent, ID as LithiumResearchComponentID } from "components/LithiumResearchComponent.sol";
import { TitaniumResearchComponent, ID as TitaniumResearchComponentID } from "components/TitaniumResearchComponent.sol";
import { OsmiumResearchComponent, ID as OsmiumResearchComponentID } from "components/OsmiumResearchComponent.sol";
import { TungstenResearchComponent, ID as TungstenResearchComponentID } from "components/TungstenResearchComponent.sol";
import { IridiumResearchComponent, ID as IridiumResearchComponentID } from "components/IridiumResearchComponent.sol";
import { KimberliteResearchComponent, ID as KimberliteResearchComponentID } from "components/KimberliteResearchComponent.sol";

// prevents stack too deep error
struct ResourceResearchComponents {
  CopperResearchComponent copperResearchComponent;
  LithiumResearchComponent lithiumResearchComponent;
  TitaniumResearchComponent titaniumResearchComponent;
  OsmiumResearchComponent osmiumResearchComponent;
  TungstenResearchComponent tungstenResearchComponent;
  IridiumResearchComponent iridiumResearchComponent;
  KimberliteResearchComponent kimberliteResearchComponent;
}
