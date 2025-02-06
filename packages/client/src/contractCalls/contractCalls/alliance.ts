import { EAllianceInviteMode, EAllianceRole } from "contracts/config/enums";

import { AccountClient, Core, entityToAddress, ExecuteFunctions, toHex32 } from "@primodiumxyz/core";
import { Entity } from "@primodiumxyz/reactive-tables";
import { ampli } from "@/ampli";
import { parseReceipt } from "@/contractCalls/parseReceipt";

export const createAllianceCalls = (
  { tables, utils }: Core,
  { playerAccount }: AccountClient,
  { execute }: ExecuteFunctions,
) => {
  const createAlliance = async (name: string, inviteOnly: boolean) => {
    await execute({
      functionName: "Pri_11__create",
      args: [
        toHex32(name.substring(0, 6).toUpperCase()),
        inviteOnly ? EAllianceInviteMode.Closed : EAllianceInviteMode.Open,
      ],
      withSession: true,
      txQueueOptions: {
        id: `create-${playerAccount.entity}`,
      },
      onComplete: (receipt) => {
        ampli.systemCreate({
          allianceName: name,
          allianceInviteOnly: inviteOnly,
          ...parseReceipt(receipt),
        });
      },
    });
  };

  const updateAllianceName = async (allianceEntity: Entity, name: string) => {
    await execute({
      functionName: "Pri_11__setAllianceName",
      args: [allianceEntity, toHex32(name.substring(0, 6).toUpperCase())],
      withSession: true,
      txQueueOptions: {
        id: `update-${playerAccount.entity}`,
      },
      onComplete: (receipt) => {
        ampli.systemAllianceSystemPrimodiumSetAllianceName({
          allianceName: name,
          ...parseReceipt(receipt),
        });
      },
    });
  };

  const updateAllianceAccess = async (allianceEntity: Entity, inviteOnly: boolean) => {
    await execute({
      functionName: "Pri_11__setAllianceInviteMode",
      args: [allianceEntity, inviteOnly ? EAllianceInviteMode.Closed : EAllianceInviteMode.Open],
      withSession: true,
      txQueueOptions: {
        id: `updateAccess-${playerAccount.entity}`,
      },
      onComplete: (receipt) => {
        ampli.systemAllianceSystemPrimodiumSetAllianceInviteMode({
          allianceName: utils.getAllianceName(allianceEntity),
          allianceInviteOnly: inviteOnly,
          ...parseReceipt(receipt),
        });
      },
    });
  };

  const leaveAlliance = async () => {
    execute({
      functionName: "Pri_11__leave",

      withSession: true,
      args: [],
      txQueueOptions: {
        id: `leave-${playerAccount.entity}`,
      },
      onComplete: (receipt) => {
        ampli.systemLeave({
          allianceName: utils.getAllianceNameFromPlayer(playerAccount.entity),
          ...parseReceipt(receipt),
        });
      },
    });
  };

  const joinAlliance = async (alliance: Entity) => {
    execute({
      functionName: "Pri_11__join",

      args: [alliance],
      withSession: true,
      txQueueOptions: {
        id: `join-${alliance}`,
      },
      onComplete: (receipt) => {
        ampli.systemJoin({
          allianceName: utils.getAllianceName(alliance),
          ...parseReceipt(receipt),
        });
      },
    });
  };

  const declineInvite = async (inviter: Entity) => {
    execute({
      functionName: "Pri_11__declineInvite",

      args: [entityToAddress(inviter)],
      withSession: true,
      txQueueOptions: {
        id: `decline-${inviter}`,
      },
      onComplete: (receipt) => {
        ampli.systemDeclineInvite({
          allianceName: utils.getAllianceName(inviter),
          allianceInviter: inviter,
          ...parseReceipt(receipt),
        });
      },
    });
  };

  const requestToJoin = async (alliance: Entity) => {
    execute({
      functionName: "Pri_11__requestToJoin",

      args: [alliance],
      withSession: true,
      txQueueOptions: {
        id: `join-${alliance}`,
      },
      onComplete: (receipt) => {
        ampli.systemRequestToJoin({
          allianceName: utils.getAllianceName(alliance),
          ...parseReceipt(receipt),
        });
      },
    });
  };

  const kickPlayer = async (player: Entity) => {
    // Fetch alliance name before kicking
    const allianceName = utils.getAllianceNameFromPlayer(player);

    execute({
      functionName: "Pri_11__kick",

      args: [entityToAddress(player)],
      withSession: true,
      txQueueOptions: {
        id: `kick-${player}`,
      },
      onComplete: (receipt) => {
        ampli.systemKick({
          allianceName: allianceName,
          allianceRejectee: player,
          ...parseReceipt(receipt),
        });
      },
    });
  };

  const grantRole = async (player: Entity, role: EAllianceRole) => {
    const currentRole = tables.PlayerAlliance.get(player)?.role ?? EAllianceRole.Member;

    execute({
      functionName: "Pri_11__grantRole",

      args: [entityToAddress(player), role],
      withSession: true,
      txQueueOptions: {
        id: `${role < currentRole ? "promote" : "demote"}-${player}`,
      },
      onComplete: (receipt) => {
        ampli.systemGrantRole({
          allianceName: utils.getAllianceNameFromPlayer(player),
          allianceRole: EAllianceRole[role],
          allianceMember: player,
          ...parseReceipt(receipt),
        });
      },
    });
  };

  const acceptJoinRequest = async (target: Entity) => {
    execute({
      functionName: "Pri_11__acceptRequestToJoin",

      args: [entityToAddress(target)],
      withSession: true,
      txQueueOptions: {
        id: `accept-${target}`,
      },
      onComplete: (receipt) => {
        ampli.systemAcceptJoinRequest({
          allianceName: utils.getAllianceNameFromPlayer(target),
          allianceAcceptee: target,
          ...parseReceipt(receipt),
        });
      },
    });
  };

  const rejectJoinRequest = async (target: Entity) => {
    execute({
      functionName: "Pri_11__rejectRequestToJoin",

      args: [entityToAddress(target)],
      withSession: true,
      txQueueOptions: {
        id: `reject-${target}`,
      },
      onComplete: (receipt) => {
        ampli.systemRejectJoinRequest({
          allianceName: utils.getAllianceNameFromPlayer(target),
          allianceRejectee: target,
          ...parseReceipt(receipt),
        });
      },
    });
  };

  const invite = async (target: Entity) => {
    execute({
      functionName: "Pri_11__invite",

      args: [entityToAddress(target)],
      withSession: true,
      txQueueOptions: {
        id: "invite",
      },
      onComplete: (receipt) => {
        ampli.systemInvite({
          allianceName: utils.getAllianceNameFromPlayer(target),
          allianceAcceptee: target,
          ...parseReceipt(receipt),
        });
      },
    });
  };

  const revokeInvite = async (target: Entity) => {
    execute({
      functionName: "Pri_11__revokeInvite",

      args: [entityToAddress(target)],
      withSession: true,
      txQueueOptions: {
        id: `revoke-${target}`,
      },
      onComplete: (receipt) => {
        ampli.systemAllianceSystemPrimodiumRevokeInvite({
          allianceRejectee: target,
          ...parseReceipt(receipt),
        });
      },
    });
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
