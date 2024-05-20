// import { SyncState } from "@latticexyz/network";
import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums";
import { getEntityTypeName } from "src/util/common";
import { ResourceEntityLookup } from "src/util/constants";
import { formatResourceCount } from "src/util/number";
import { components } from "../../../../network/components";
import { MUD } from "../../../../network/types";
import { world } from "../../../../network/world";
import { PrimodiumScene } from "@/game/api/scene";

export function setupSwapNotifications(mud: MUD, scene: PrimodiumScene) {
  const systemWorld = namespaceWorld(world, "systems");

  defineComponentSystem(
    systemWorld,
    components.Swap,
    ({ entity: swapper, value }) => {
      const player = mud.playerAccount.entity;
      const swap = value[0];
      if (!swap || swapper !== player) return;

      const inResource = ResourceEntityLookup[swap.resourceIn as EResource];
      const outResource = ResourceEntityLookup[swap.resourceOut as EResource];
      const formattedIn = formatResourceCount(inResource, swap.amountIn, { fractionDigits: 2 });
      const formattedOut = formatResourceCount(outResource, swap.amountOut, { fractionDigits: 2 });
      scene.notify(
        "success",
        `Swap success! ${formattedIn} ${getEntityTypeName(inResource)} swapped for ${formattedOut} ${getEntityTypeName(
          outResource
        )}.`
      );
    },
    { runOnInit: false }
  );
}
