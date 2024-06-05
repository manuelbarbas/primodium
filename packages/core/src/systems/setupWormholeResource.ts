import { Core } from "@/lib/types";
import { EResource } from "contracts/config/enums";
import { EntityType, ResourceEntityLookup, SPEED_SCALE } from "@/lib/constants";
import { encodeAbiParameters, Hex, keccak256 } from "viem";
import { defineComponentSystem, Entity, namespaceWorld } from "@latticexyz/recs";
import { bigIntMin } from "@latticexyz/common/utils";

export const setupWormholeResource = async (core: Core) => {
  const {
    network: { world },
    components,
  } = core;

  function getRandomResource(seed: Entity, turn: bigint, prevResource: Entity) {
    const transportableLength = components.P_Transportables.get()?.value.length ?? 0;
    let resource = EntityType.NULL;
    console.log({ seed, turn });
    do {
      seed = keccak256(
        encodeAbiParameters(
          [
            { name: "seed", type: "bytes32" },
            { name: "turn", type: "uint256" },
          ],
          [seed as Hex, turn]
        )
      ) as Entity;

      const resourceIndex = Number(BigInt(seed) % BigInt(transportableLength)) + 1;
      resource = ResourceEntityLookup[resourceIndex as EResource];
    } while (resource == prevResource);
    return resource;
  }

  const systemWorld = namespaceWorld(world, "coreSystems");
  defineComponentSystem(systemWorld, components.Time, ({ value }) => {
    const time = value[0]?.value;
    const wormholeData = components.Wormhole.get();
    const wormholeConfig = components.P_WormholeConfig.get();
    const gameConfig = components.P_GameConfig.get();

    if (!time || !wormholeData || !wormholeConfig || !gameConfig) return;
    const storedTurn = wormholeData.turn;
    const worldSpeed = gameConfig?.worldSpeed ?? 0n;

    const turnDuration = (wormholeConfig.turnDuration * SPEED_SCALE) / worldSpeed;
    const expectedTurn = bigIntMin(0n, (time - wormholeConfig.initTime) / turnDuration);

    const timeUntilNextResource = wormholeConfig.initTime + (expectedTurn + 1n) * turnDuration - time;
    const resourceEntity = ResourceEntityLookup[wormholeData.resource as EResource];
    const nextResourceEntity = ResourceEntityLookup[wormholeData.nextResource as EResource];
    if (storedTurn === expectedTurn) {
      components.WormholeResource.set({
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
    components.WormholeResource.set(newData);
  });
};
