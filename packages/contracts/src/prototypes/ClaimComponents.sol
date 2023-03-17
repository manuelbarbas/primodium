// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";

// prevents stack too deep error
struct ClaimComponents {
  PositionComponent positionComponent;
  TileComponent tileComponent;
  OwnedByComponent ownedByComponent;
  LastClaimedAtComponent lastClaimedAtComponent;
}
