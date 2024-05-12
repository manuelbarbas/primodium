import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { toast } from "react-toastify";
import { decodeEntity } from "src/util/encode";
import { Hex, hexToString, padHex, zeroAddress } from "viem";
import { components } from "../components";
import { MUD } from "../types";
import { world } from "../world";
import { EAllianceRole } from "contracts/config/enums";
import { entityToPlayerName } from "@/util/name";
import { getAllianceName } from "@/util/alliance";

export function setupInvitations(mud: MUD) {
  const { AllianceInvitation, Alliance, AllianceJoinRequest, AllianceRequest, PlayerAlliance, PlayerInvite } =
    components;
  const systemWorld = namespaceWorld(world, "systems");
  const playerEntity = mud.playerAccount.entity;

  defineComponentSystem(systemWorld, AllianceInvitation, ({ entity, value }) => {
    const { alliance, entity: player } = decodeEntity(AllianceInvitation.metadata.keySchema, entity);

    if (value[0]?.inviter === padHex(zeroAddress, { size: 32 })) {
      PlayerInvite.remove(entity);
      return;
    }

    PlayerInvite.set(
      {
        target: player as Entity,
        alliance: alliance as Entity,
        player: value[0]?.inviter as Entity,
        timestamp: value[0]?.timeStamp ?? 0n,
      },
      entity
    );
  });

  defineComponentSystem(systemWorld, AllianceJoinRequest, ({ entity, value }) => {
    const { alliance, entity: player } = decodeEntity({ entity: "bytes32", alliance: "bytes32" }, entity);

    // The request has either been accepted or rejected
    if (!value[0]?.timeStamp) {
      AllianceRequest.remove(entity);
      // Bail if it's not the concerned player
      if (player !== playerEntity) return;

      // Notify the player about the outcome
      const allianceName = getAllianceName(alliance as Entity);
      if (PlayerAlliance.get(playerEntity)?.alliance === alliance) {
        toast.success(`You have been accepted into [${allianceName}]!`);
      } else {
        toast.info(`Your request to join [${allianceName}] was declined`);
      }

      return;
    }

    AllianceRequest.set(
      {
        player: player as Entity,
        alliance: alliance as Entity,
        timestamp: value[0]?.timeStamp ?? 0n,
      },
      entity
    );

    // Notify members of the alliance (only officers that can actually accept)
    const officers = PlayerAlliance.getAllWith({
      alliance,
    }).filter((p) => PlayerAlliance.get(p)?.role !== EAllianceRole.Member);
    if (officers.includes(playerEntity)) {
      const playerName = entityToPlayerName(player as Entity);
      toast.info(`${playerName} has requested to join the alliance`);
    }
  });

  defineComponentSystem(systemWorld, PlayerInvite, ({ entity, value }) => {
    if (!value[0]) return;

    if (value[0]?.player === padHex(zeroAddress, { size: 32 })) {
      return;
    }

    // 30 sec buffer
    const now = components.Time.get()?.value ?? 0n;
    if (value[0]?.timestamp + 30n < now) return;

    const invite = PlayerInvite.get(entity);
    const inviteAlliance = Alliance.get(invite?.alliance as Entity)?.name as Hex | undefined;

    if (!inviteAlliance || invite?.target !== playerEntity) return;

    const allianceName = hexToString(inviteAlliance, { size: 32 });

    toast.info(`You have been invited to join [${allianceName}]`);
  });
}
