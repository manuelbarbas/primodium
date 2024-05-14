import { components } from "@/network/components";
import { world } from "@/network/world";
import { defineComponentSystem, Entity, namespaceWorld } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums";
import { EntityType, ResourceEntityLookup, SPEED_SCALE } from "src/util/constants";
import { encodeAbiParameters, Hex, keccak256 } from "viem";

export const setupWormholeResource = async () => {
  function getRandomResource(seed: Entity, turn: bigint, prevResource: Entity) {
    const transportableLength = components.P_Transportables.get()?.value.length ?? 0;
    let resource = EntityType.NULL;
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

  const systemWorld = namespaceWorld(world, "systems");
  defineComponentSystem(systemWorld, components.Time, ({ value }) => {
    const wormholeData = components.Wormhole.get();
    const wormholeConfig = components.P_WormholeConfig.get();
    const time = value[0]?.value ?? 0n;

    if (!wormholeData || !wormholeConfig) return;
    const storedTurn = wormholeData.turn;
    const worldSpeed = components.P_GameConfig.get()?.worldSpeed ?? 0n;

    const turnDuration = (wormholeConfig.turnDuration * SPEED_SCALE) / worldSpeed;
    const expectedTurn = (time - wormholeConfig.initTime) / turnDuration;

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
