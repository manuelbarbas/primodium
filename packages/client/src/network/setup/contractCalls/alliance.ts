import { Entity } from "@latticexyz/recs";
import { EAllianceInviteMode, EAllianceRole } from "contracts/config/enums";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { MUD } from "src/network/types";
import { world } from "src/network/world";
import { getAllianceName, getAllianceNameFromPlayer } from "src/util/alliance";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities, toHex32 } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const createAlliance = async (mud: MUD, name: string, inviteOnly: boolean) => {
  await execute(
    mud,
    (account) =>
      account.worldContract.write.create([
        toHex32(name.substring(0, 6).toUpperCase()),
        inviteOnly ? EAllianceInviteMode.Closed : EAllianceInviteMode.Open,
      ]),
    {
      id: world.registerEntity(),
      delegate: true,
    },
    (receipt) => {
      ampli.systemCreate({
        allianceName: name,
        allianceInviteOnly: inviteOnly,
        ...parseReceipt(receipt),
      });
    }
  );
};

export const leaveAlliance = async (mud: MUD) => {
  // Fetch alliance name before leaving
  const allianceName = getAllianceNameFromPlayer(account.entity);

  execute(
    mud,
    () => account.worldContract.write.leave(),
    {
      id: world.registerEntity(),
      delegate: true,
    },
    (receipt) => {
      ampli.systemLeave({
        allianceName: allianceName,
        ...parseReceipt(receipt),
      });
    }
  );
};

export const joinAlliance = async (mud: MUD, alliance: Entity) => {
  execute(
    mud,
    () => account.worldContract.write.join([alliance as Hex]),
    {
      id: hashEntities(TransactionQueueType.JoinAlliance, alliance),
      delegate: true,
    },
    (receipt) => {
      ampli.systemJoin({
        allianceName: getAllianceName(alliance),
        ...parseReceipt(receipt),
      });
    }
  );
};

export const declineInvite = async (mud: MUD, inviter: Entity) => {
  execute(
    mud,
    () => account.worldContract.write.declineInvite([inviter as Hex]),
    {
      id: hashEntities(TransactionQueueType.DeclineInvite, inviter),
      delegate: true,
    },
    (receipt) => {
      ampli.systemDeclineInvite({
        allianceName: getAllianceName(inviter),
        allianceInviter: inviter,
        ...parseReceipt(receipt),
      });
    }
  );
};

export const requestToJoin = async (mud: MUD, alliance: Entity) => {
  execute(
    mud,
    () => account.worldContract.write.requestToJoin([alliance as Hex]),
    {
      id: hashEntities(TransactionQueueType.JoinAlliance, alliance),
      delegate: true,
    },
    (receipt) => {
      ampli.systemRequestToJoin({
        allianceName: getAllianceName(alliance),
        ...parseReceipt(receipt),
      });
    }
  );
};

export const kickPlayer = async (mud: MUD, player: Entity) => {
  // Fetch alliance name before kicking
  const allianceName = getAllianceNameFromPlayer(player);

  execute(
    mud,
    () => account.worldContract.write.kick([player as Hex]),
    {
      id: hashEntities(TransactionQueueType.KickPlayer, player),
      delegate: true,
    },
    (receipt) => {
      ampli.systemKick({
        allianceName: allianceName,
        allianceRejectee: player,
        ...parseReceipt(receipt),
      });
    }
  );
};

export const grantRole = async (mud: MUD, player: Entity, role: EAllianceRole) => {
  const currentRole = components.PlayerAlliance.get(player)?.role ?? EAllianceRole.Member;

  execute(
    mud,
    () => account.worldContract.write.grantRole([player as Hex, role]),
    {
      id: hashEntities(role < currentRole ? TransactionQueueType.Promote : TransactionQueueType.Demote, player),
      delegate: true,
    },
    (receipt) => {
      ampli.systemGrantRole({
        allianceName: getAllianceNameFromPlayer(player),
        allianceRole: EAllianceRole[role],
        allianceMember: player,
        ...parseReceipt(receipt),
      });
    }
  );
};

export const acceptJoinRequest = async (mud: MUD, target: Entity) => {
  execute(
    mud,
    () => account.worldContract.write.acceptRequestToJoin([target as Hex]),
    {
      id: hashEntities(TransactionQueueType.AcceptRequest, target),
      delegate: true,
    },
    (receipt) => {
      ampli.systemAcceptJoinRequest({
        allianceName: getAllianceNameFromPlayer(target),
        allianceAcceptee: target,
        ...parseReceipt(receipt),
      });
    }
  );
};

export const rejectJoinRequest = async (mud: MUD, target: Entity) => {
  execute(
    mud,
    () => account.worldContract.write.rejectRequestToJoin([target as Hex]),
    {
      id: hashEntities(TransactionQueueType.RejectRequest, target),
      delegate: true,
    },
    (receipt) => {
      ampli.systemRejectJoinRequest({
        allianceName: getAllianceNameFromPlayer(target),
        allianceRejectee: target,
        ...parseReceipt(receipt),
      });
    }
  );
};

export const invite = async (mud: MUD, target: Entity) => {
  execute(
    mud,
    () => account.worldContract.write.invite([target as Hex]),
    {
      id: hashEntities(TransactionQueueType.Invite, target),
      delegate: true,
    },
    (receipt) => {
      ampli.systemInvite({
        allianceName: getAllianceNameFromPlayer(target),
        allianceAcceptee: target,
        ...parseReceipt(receipt),
      });
    }
  );
};
