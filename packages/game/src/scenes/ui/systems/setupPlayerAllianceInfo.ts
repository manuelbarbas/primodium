import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { components } from "../../../../network/components";
import { world } from "../../../../network/world";

export function setupPlayerAllianceInfo() {
  const { Alliance, PlayerAlliance, PlayerAllianceInfo } = components;
  const systemWorld = namespaceWorld(world, "systems");

  defineComponentSystem(systemWorld, Alliance, ({ entity, value: [current] }) => {
    const members = PlayerAlliance.getAllWith({
      alliance: entity,
    });

    for (const member of members) {
      PlayerAllianceInfo.set(
        {
          alliance: entity,
          name: current?.name ?? "",
          inviteMode: current?.inviteMode ?? 0,
        },
        member
      );
    }
  });
}
