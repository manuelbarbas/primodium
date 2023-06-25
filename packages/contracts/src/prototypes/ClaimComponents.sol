// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { HealthComponent, ID as HealthComponentID } from "components/HealthComponent.sol";

// prevents stack too deep error
struct ClaimComponents {
  TileComponent tileComponent;
  OwnedByComponent ownedByComponent;
  LastClaimedAtComponent lastClaimedAtComponent;
  HealthComponent healthComponent;
}
