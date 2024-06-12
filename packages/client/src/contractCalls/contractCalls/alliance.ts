import { ampli } from "src/ampli";
import { Hex } from "viem";
import { Core, AccountClient, getSystemId, toHex32, entityToAddress } from "@primodiumxyz/core";
import { EAllianceInviteMode, EAllianceRole } from "contracts/config/enums";
import { parseReceipt } from "@/util/analytics/parseReceipt";
import { Entity } from "@primodiumxyz/reactive-tables";
import { ExecuteFunctions } from "@/contractCalls/txExecute/createExecute";

export const createAllianceCalls = (
  { tables, utils }: Core,
  { playerAccount }: AccountClient,
  { execute }: ExecuteFunctions
) => {
  const createAlliance = async (name: string, inviteOnly: boolean) => {
    await execute(
      {
        functionName: "Pri_11__create",
        systemId: getSystemId("AllianceSystem"),
        args: [
          toHex32(name.substring(0, 6).toUpperCase()),
          inviteOnly ? EAllianceInviteMode.Closed : EAllianceInviteMode.Open,
        ],
        withSession: true,
      },
      {
        id: `create-${playerAccount.entity}`,
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

  const updateAllianceName = async (allianceEntity: Entity, name: string) => {
    await execute(
      {
        functionName: "Pri_11__setAllianceName",
        systemId: getSystemId("AllianceSystem"),
        args: [allianceEntity as Hex, toHex32(name.substring(0, 6).toUpperCase())],
        withSession: true,
      },
      {
        id: `update-${playerAccount.entity}`,
      },
      (receipt) => {
        ampli.systemAllianceSystemPrimodiumSetAllianceName({
          allianceName: name,
          ...parseReceipt(receipt),
        });
      }
    );
  };

  const updateAllianceAccess = async (allianceEntity: Entity, inviteOnly: boolean) => {
    await execute(
      {
        functionName: "Pri_11__setAllianceInviteMode",
        systemId: getSystemId("AllianceSystem"),
        args: [allianceEntity as Hex, inviteOnly ? EAllianceInviteMode.Closed : EAllianceInviteMode.Open],
        withSession: true,
      },
      {
        id: `updateAccess-${playerAccount.entity}`,
      },
      (receipt) => {
        ampli.systemAllianceSystemPrimodiumSetAllianceInviteMode({
          allianceName: utils.getAllianceName(allianceEntity),
          allianceInviteOnly: inviteOnly,
          ...parseReceipt(receipt),
        });
      }
    );
  };

  const leaveAlliance = async () => {
    execute(
      {
        functionName: "Pri_11__leave",
        systemId: getSystemId("AllianceSystem"),
        withSession: true,
        args: [],
      },
      {
        id: `leave-${playerAccount.entity}`,
      },
      (receipt) => {
        ampli.systemLeave({
          allianceName: utils.getAllianceNameFromPlayer(playerAccount.entity),
          ...parseReceipt(receipt),
        });
      }
    );
  };

  const joinAlliance = async (alliance: Entity) => {
    execute(
      {
        functionName: "Pri_11__join",
        systemId: getSystemId("AllianceSystem"),
        args: [alliance as Hex],
        withSession: true,
      },
      {
        id: `join-${alliance}`,
      },
      (receipt) => {
        ampli.systemJoin({
          allianceName: utils.getAllianceName(alliance),
          ...parseReceipt(receipt),
        });
      }
    );
  };

  const declineInvite = async (inviter: Entity) => {
    execute(
      {
        functionName: "Pri_11__declineInvite",
        systemId: getSystemId("AllianceSystem"),
        args: [entityToAddress(inviter as Hex)],
        withSession: true,
      },
      {
        id: `decline-${inviter}`,
      },
      (receipt) => {
        ampli.systemDeclineInvite({
          allianceName: utils.getAllianceName(inviter),
          allianceInviter: inviter,
          ...parseReceipt(receipt),
        });
      }
    );
  };

  const requestToJoin = async (alliance: Entity) => {
    execute(
      {
        functionName: "Pri_11__requestToJoin",
        systemId: getSystemId("AllianceSystem"),
        args: [alliance as Hex],
        withSession: true,
      },
      {
        id: `join-${alliance}`,
      },
      (receipt) => {
        ampli.systemRequestToJoin({
          allianceName: utils.getAllianceName(alliance),
          ...parseReceipt(receipt),
        });
      }
    );
  };

  const kickPlayer = async (player: Entity) => {
    // Fetch alliance name before kicking
    const allianceName = utils.getAllianceNameFromPlayer(player);

    execute(
      {
        functionName: "Pri_11__kick",
        systemId: getSystemId("AllianceSystem"),
        args: [entityToAddress(player as Hex)],
        withSession: true,
      },
      {
        id: `kick-${player}`,
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

  const grantRole = async (player: Entity, role: EAllianceRole) => {
    const currentRole = tables.PlayerAlliance.get(player)?.role ?? EAllianceRole.Member;

    execute(
      {
        functionName: "Pri_11__grantRole",
        systemId: getSystemId("AllianceSystem"),
        args: [entityToAddress(player as Hex), role],
        withSession: true,
      },
      {
        id: `${role < currentRole ? "promote" : "demote"}-${player}`,
      },
      (receipt) => {
        ampli.systemGrantRole({
          allianceName: utils.getAllianceNameFromPlayer(player),
          allianceRole: EAllianceRole[role],
          allianceMember: player,
          ...parseReceipt(receipt),
        });
      }
    );
  };

  const acceptJoinRequest = async (target: Entity) => {
    execute(
      {
        functionName: "Pri_11__acceptRequestToJoin",
        systemId: getSystemId("AllianceSystem"),
        args: [entityToAddress(target as Hex)],
        withSession: true,
      },
      {
        id: `accept-${target}`,
      },
      (receipt) => {
        ampli.systemAcceptJoinRequest({
          allianceName: utils.getAllianceNameFromPlayer(target),
          allianceAcceptee: target,
          ...parseReceipt(receipt),
        });
      }
    );
  };

  const rejectJoinRequest = async (target: Entity) => {
    execute(
      {
        functionName: "Pri_11__rejectRequestToJoin",
        systemId: getSystemId("AllianceSystem"),
        args: [entityToAddress(target as Hex)],
        withSession: true,
      },
      {
        id: `reject-${target}`,
      },
      (receipt) => {
        ampli.systemRejectJoinRequest({
          allianceName: utils.getAllianceNameFromPlayer(target),
          allianceRejectee: target,
          ...parseReceipt(receipt),
        });
      }
    );
  };

  const invite = async (target: Entity) => {
    execute(
      {
        functionName: "Pri_11__invite",
        systemId: getSystemId("AllianceSystem"),
        args: [entityToAddress(target as Hex)],
        withSession: true,
      },
      {
        id: "invite",
      },
      (receipt) => {
        ampli.systemInvite({
          allianceName: utils.getAllianceNameFromPlayer(target),
          allianceAcceptee: target,
          ...parseReceipt(receipt),
        });
      }
    );
  };

  const revokeInvite = async (target: Entity) => {
    execute(
      {
        functionName: "Pri_11__revokeInvite",
        systemId: getSystemId("AllianceSystem"),
        args: [entityToAddress(target as Hex)],
        withSession: true,
      },
      {
        id: `revoke-${target}`,
      },
      (receipt) => {
        ampli.systemAllianceSystemPrimodiumRevokeInvite({
          allianceRejectee: target,
          ...parseReceipt(receipt),
        });
      }
    );
  };

  return {
    createAlliance,
    updateAllianceName,
    updateAllianceAccess,
    leaveAlliance,
    joinAlliance,
    declineInvite,
    requestToJoin,
    kickPlayer,
    grantRole,
    acceptJoinRequest,
    rejectJoinRequest,
    invite,
    revokeInvite,
  };
};
