import { Entity } from "@latticexyz/recs";
import { EAllianceInviteMode, EAllianceRole } from "contracts/config/enums";
import { ampli } from "src/ampli";
import { components } from "src/network/components";
import { execute } from "src/network/txExecute";
import { MUD } from "src/network/types";
import { getAllianceName, getAllianceNameFromPlayer } from "src/util/alliance";
import { entityToAddress } from "src/util/common";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId, hashEntities, toHex32 } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const createAlliance = async (mud: MUD, name: string, inviteOnly: boolean) => {
  await execute(
    {
      mud,
      functionName: "Primodium__create",
      systemId: getSystemId("AllianceSystem"),
      args: [
        toHex32(name.substring(0, 6).toUpperCase()),
        inviteOnly ? EAllianceInviteMode.Closed : EAllianceInviteMode.Open,
      ],
      withSession: true,
    },
    {
      id: hashEntities(TransactionQueueType.CreateAlliance, mud.playerAccount.entity),
    }
  );
};

export const updateAllianceName = async (mud: MUD, allianceEntity: Entity, name: string) => {
  await execute(
    {
      mud,
      functionName: "Primodium__setAllianceName",
      systemId: getSystemId("AllianceSystem"),
      args: [allianceEntity as Hex, toHex32(name.substring(0, 6).toUpperCase())],
      withSession: true,
    },
    {
      id: hashEntities(TransactionQueueType.UpdateAllianceName, mud.playerAccount.entity),
    }
  );
};

export const updateAllianceAccess = async (mud: MUD, allianceEntity: Entity, inviteOnly: boolean) => {
  await execute(
    {
      mud,
      functionName: "Primodium__setAllianceInviteMode",
      systemId: getSystemId("AllianceSystem"),
      args: [allianceEntity as Hex, inviteOnly ? EAllianceInviteMode.Closed : EAllianceInviteMode.Open],
      withSession: true,
    },
    {
      id: hashEntities(TransactionQueueType.UpdateAllianceAccess, mud.playerAccount.entity),
    }
  );
};

export const leaveAlliance = async (mud: MUD) => {
  execute(
    {
      mud,
      functionName: "Primodium__leave",
      systemId: getSystemId("AllianceSystem"),
      withSession: true,
    },
    {
      id: hashEntities(TransactionQueueType.LeaveAlliance, mud.playerAccount.entity),
    },
    (receipt) => {
      ampli.systemLeave({
        allianceName: getAllianceNameFromPlayer(mud.playerAccount.entity),
        ...parseReceipt(receipt),
      });
    }
  );
};

export const joinAlliance = async (mud: MUD, alliance: Entity) => {
  execute(
    {
      mud,
      functionName: "Primodium__join",
      systemId: getSystemId("AllianceSystem"),
      args: [alliance as Hex],
      withSession: true,
    },
    {
      id: hashEntities(TransactionQueueType.JoinAlliance, alliance),
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
    {
      mud,
      functionName: "Primodium__declineInvite",
      systemId: getSystemId("AllianceSystem"),
      args: [entityToAddress(inviter as Hex)],
      withSession: true,
    },
    {
      id: hashEntities(TransactionQueueType.DeclineInvite, inviter),
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
    {
      mud,
      functionName: "Primodium__requestToJoin",
      systemId: getSystemId("AllianceSystem"),
      args: [alliance as Hex],
      withSession: true,
    },
    {
      id: hashEntities(TransactionQueueType.JoinAlliance, alliance),
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
    {
      mud,
      functionName: "Primodium__kick",
      systemId: getSystemId("AllianceSystem"),
      args: [entityToAddress(player as Hex)],
      withSession: true,
    },
    {
      id: hashEntities(TransactionQueueType.KickPlayer, player),
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
    {
      mud,
      functionName: "Primodium__grantRole",
      systemId: getSystemId("AllianceSystem"),
      args: [entityToAddress(player as Hex), role],
      withSession: true,
    },
    {
      id: hashEntities(role < currentRole ? TransactionQueueType.Promote : TransactionQueueType.Demote, player),
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
    {
      mud,
      functionName: "Primodium__acceptRequestToJoin",
      systemId: getSystemId("AllianceSystem"),
      args: [entityToAddress(target as Hex)],
      withSession: true,
    },
    {
      id: hashEntities(TransactionQueueType.AcceptRequest, target),
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
    {
      mud,
      functionName: "Primodium__rejectRequestToJoin",
      systemId: getSystemId("AllianceSystem"),
      args: [entityToAddress(target as Hex)],
      withSession: true,
    },
    {
      id: hashEntities(TransactionQueueType.RejectRequest, target),
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
    {
      mud,
      functionName: "Primodium__invite",
      systemId: getSystemId("AllianceSystem"),
      args: [entityToAddress(target as Hex)],
      withSession: true,
    },
    {
      id: "invite" as Entity,
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

export const revokeInvite = async (mud: MUD, target: Entity) => {
  execute(
    {
      mud,
      functionName: "Primodium__revokeInvite",
      systemId: getSystemId("AllianceSystem"),
      args: [entityToAddress(target as Hex)],
      withSession: true,
    },
    {
      id: hashEntities(TransactionQueueType.RevokeInvite, target),
    }
    // TODO: add ampli tracker
    // (receipt) => {
    //   ampli.systemRevokeInvite({
    //     allianceName: getAllianceNameFromPlayer(target),
    //     allianceRejectee: target,
    //     ...parseReceipt(receipt),
    //   });
    // }
  );
};
