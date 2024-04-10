import { Entity } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums";
import { useMemo } from "react";
import { components } from "src/network/components";
import { EntityType, ResourceEntityLookup, SPEED_SCALE } from "src/util/constants";
import { encodeAbiParameters, Hex, keccak256 } from "viem";

export const useWormholeResource = () => {
  const wormholeData = components.Wormhole.use();
  const wormholeConfig = components.P_WormholeConfig.use();
  const time = components.Time.use()?.value ?? 0n;

  return useMemo(() => {
    if (!wormholeData || !wormholeConfig)
      return { resource: EntityType.NULL, nextResource: EntityType.NULL, timeUntilNextResource: 0n };
    const storedTurn = wormholeData.turn;
    const worldSpeed = components.P_GameConfig.get()?.worldSpeed ?? 0n;

    const turnDuration = (wormholeConfig.turnDuration * SPEED_SCALE) / worldSpeed;
    const expectedTurn = (time - wormholeConfig.initTime) / turnDuration;

    const timeUntilNextResource = wormholeConfig.initTime + (expectedTurn + 1n) * turnDuration - time;
    const resourceEntity = ResourceEntityLookup[wormholeData.resource as EResource];
    const nextResourceEntity = ResourceEntityLookup[wormholeData.nextResource as EResource];
    if (storedTurn === expectedTurn)
      return { timeUntilNextResource, resource: resourceEntity, nextResource: nextResourceEntity };
    return {
      timeUntilNextResource,
      nextResource: getRandomResource(wormholeData.hash as Entity, expectedTurn, resourceEntity),
      resource: nextResourceEntity,
    };
  }, [time, wormholeConfig, wormholeData]);
};

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

    const resourceIndex = Number(BigInt(seed) % BigInt(transportableLength));
    resource = ResourceEntityLookup[resourceIndex as EResource];
  } while (resource == prevResource);
  return resource;
}

// function testRandomResourceSanityCheck() {
//   const seed = encodeBytes32("hello");
//   const prevResource = EntityType.Iron;
//   const turn = 1n;
//   const resource = getRandomResource(seed as Entity, turn, prevResource);
// }
