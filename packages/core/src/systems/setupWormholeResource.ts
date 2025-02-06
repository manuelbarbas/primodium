import { bigIntMin } from "@latticexyz/common/utils";
import { EResource } from "contracts/config/enums";
import { encodeAbiParameters, Hex, keccak256 } from "viem";

import { Entity, namespaceWorld } from "@primodiumxyz/reactive-tables";
import { EntityType, ResourceEntityLookup, SPEED_SCALE } from "@/lib";
import { Core } from "@/lib/types";

export const setupWormholeResource = async (core: Core) => {
  const {
    network: { world },
    tables,
  } = core;

  function getRandomResource(seed: Entity, turn: bigint, prevResource: Entity) {
    const transportableLength = tables.P_Transportables.get()?.value.length ?? 0;
    let resource = EntityType.NULL;

    do {
      seed = keccak256(
        encodeAbiParameters(
          [
            { name: "seed", type: "bytes32" },
            { name: "turn", type: "uint256" },
          ],
          [seed as Hex, turn],
        ),
      ) as Entity;

      const resourceIndex = Number(BigInt(seed) % BigInt(transportableLength)) + 1;
      resource = ResourceEntityLookup[resourceIndex as EResource];
    } while (resource == prevResource);
    return resource;
  }

  const systemWorld = namespaceWorld(world, "coreSystems");
  tables.Time.watch({
    world: systemWorld,
    onChange: ({ properties }) => {
      const time = properties.current?.value;
      const wormholeData = tables.Wormhole.get();
      const wormholeConfig = tables.P_WormholeConfig.get();
      const gameConfig = tables.P_GameConfig.get();

      if (!time || !wormholeData || !wormholeConfig || !gameConfig) return;
      const storedTurn = wormholeData.turn;
      const worldSpeed = gameConfig?.worldSpeed ?? 0n;

      const turnDuration = (wormholeConfig.turnDuration * SPEED_SCALE) / worldSpeed;
      const expectedTurn = bigIntMin(0n, (time - wormholeConfig.initTime) / turnDuration);

      const timeUntilNextResource = wormholeConfig.initTime + (expectedTurn + 1n) * turnDuration - time;
      const resourceEntity = ResourceEntityLookup[wormholeData.resource as EResource];
      const nextResourceEntity = ResourceEntityLookup[wormholeData.nextResource as EResource];
      if (storedTurn === expectedTurn) {
        tables.WormholeResource.set({
          timeUntilNextResource,
          nextResource: nextResourceEntity,
          resource: resourceEntity,
        });
        return;
      }

      const newData = {
        timeUntilNextResource,
        nextResource: getRandomResource(wormholeData.hash as Entity, expectedTurn, nextResourceEntity),
        resource: nextResourceEntity,
      };
      tables.WormholeResource.set(newData);
    },
  });
};
