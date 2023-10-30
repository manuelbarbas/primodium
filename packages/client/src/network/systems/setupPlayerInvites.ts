import { Entity, defineComponentSystem } from "@latticexyz/recs";
import { components } from "../components";
import { world } from "../world";
import { SetupResult } from "../types";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { Hex, hexToString, padHex, zeroAddress } from "viem";
import { toast } from "react-toastify";

export function setupInvitations(mud: SetupResult) {
  const { AllianceInvitation, PlayerInvite, Alliance, AllianceJoinRequest, AllianceRequest } = components;
  const playerEntity = mud.network.playerEntity;

  defineComponentSystem(world, AllianceInvitation, ({ entity, value }) => {
    const { alliance, entity: player } = decodeEntity({ entity: "bytes32", alliance: "bytes32" }, entity);

    if (value[0]?.value === padHex(zeroAddress, { size: 32 })) {
      PlayerInvite.remove(entity);
      return;
    }

    PlayerInvite.set(
      {
        target: player as Entity,
        alliance: alliance as Entity,
        player: value[0]?.value as Entity,
      },
      entity
    );
  });

  defineComponentSystem(world, AllianceJoinRequest, ({ entity, value }) => {
    const { alliance, entity: player } = decodeEntity({ entity: "bytes32", alliance: "bytes32" }, entity);

    if (!value[0]?.value) {
      AllianceRequest.remove(entity);
      return;
    }

    AllianceRequest.set(
      {
        player: player as Entity,
        alliance: alliance as Entity,
      },
      entity
    );
  });

  defineComponentSystem(
    world,
    PlayerInvite,
    ({ entity, value }) => {
      if (value[0]?.player === padHex(zeroAddress, { size: 32 })) {
        return;
      }

      const invite = PlayerInvite.get(entity);
      const inviteAlliance = Alliance.get(invite?.alliance as Entity)?.name as Hex | undefined;

      if (!inviteAlliance || invite?.target !== playerEntity) return;

      const allianceName = hexToString(inviteAlliance, { size: 32 });

      toast.info(`You have been invited to join [${allianceName}]`);
    },
    { runOnInit: false }
  );
}
