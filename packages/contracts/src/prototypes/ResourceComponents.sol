// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

import { BolutiteResourceComponent, ID as BolutiteResourceComponentID } from "components/BolutiteResourceComponent.sol";
import { CopperResourceComponent, ID as CopperResourceComponentID } from "components/CopperResourceComponent.sol";
import { IridiumResourceComponent, ID as IridiumResourceComponentID } from "components/IridiumResourceComponent.sol";
import { IronResourceComponent, ID as IronResourceComponentID } from "components/IronResourceComponent.sol";
import { KimberliteResourceComponent, ID as KimberliteResourceComponentID } from "components/KimberliteResourceComponent.sol";
import { LithiumResourceComponent, ID as LithiumResourceComponentID } from "components/LithiumResourceComponent.sol";
import { OsmiumResourceComponent, ID as OsmiumResourceComponentID } from "components/OsmiumResourceComponent.sol";
import { TungstenResourceComponent, ID as TungstenResourceComponentID } from "components/TungstenResourceComponent.sol";
import { UraniniteResourceComponent, ID as UraniniteResourceComponentID } from "components/UraniniteResourceComponent.sol";

// prevents stack too deep error
struct ResourceComponents {
  BolutiteResourceComponent bolutiteResourceComponent;
  CopperResourceComponent copperResourceComponent;
  IridiumResourceComponent iridiumResourceComponent;
  IronResourceComponent ironResourceComponent;
  KimberliteResourceComponent kimberliteResourceComponent;
  LithiumResourceComponent lithiumResourceComponent;
  OsmiumResourceComponent osmiumResourceComponent;
  TungstenResourceComponent tungstenResourceComponent;
  UraniniteResourceComponent uraniniteResourceComponent;
}
