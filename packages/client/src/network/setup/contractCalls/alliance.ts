import { Entity } from "@latticexyz/recs";
import { EAllianceInviteMode, EAllianceRole } from "contracts/config/enums";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { AnyAccount, SetupNetworkResult } from "src/network/types";
import { world } from "src/network/world";
import { getAllianceName, getAllianceNameFromPlayer } from "src/util/alliance";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities, toHex32 } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const createAlliance = async (
  network: SetupNetworkResult,
  account: AnyAccount,
  name: string,
  inviteOnly: boolean
) => {
  await execute(
    () =>
      account.worldContract.write.create([
        toHex32(name.substring(0, 6).toUpperCase()),
        inviteOnly ? EAllianceInviteMode.Closed : EAllianceInviteMode.Open,
      ]),
    network,
    {
      id: world.registerEntity(),
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

export const leaveAlliance = async (network: SetupNetworkResult, account: AnyAccount) => {
  // Fetch alliance name before leaving
  const allianceName = getAllianceNameFromPlayer(account.entity);

  execute(
    () => account.worldContract.write.leave(),
    network,
    {
      id: world.registerEntity(),
    },
    (receipt) => {
      ampli.systemLeave({
        allianceName: allianceName,
        ...parseReceipt(receipt),
      });
    }
  );
};

export const joinAlliance = async (network: SetupNetworkResult, account: AnyAccount, alliance: Entity) => {
  execute(
    () => account.worldContract.write.join([alliance as Hex]),
    network,
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

export const declineInvite = async (network: SetupNetworkResult, account: AnyAccount, inviter: Entity) => {
  execute(
    () => account.worldContract.write.declineInvite([inviter as Hex]),
    network,
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

export const requestToJoin = async (network: SetupNetworkResult, account: AnyAccount, alliance: Entity) => {
  execute(
    () => account.worldContract.write.requestToJoin([alliance as Hex]),
    network,
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

export const kickPlayer = async (network: SetupNetworkResult, account: AnyAccount, player: Entity) => {
  // Fetch alliance name before kicking
  const allianceName = getAllianceNameFromPlayer(player);

  execute(
    () => account.worldContract.write.kick([player as Hex]),
    network,
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

export const grantRole = async (
  network: SetupNetworkResult,
  account: AnyAccount,
  player: Entity,
  role: EAllianceRole
) => {
  const currentRole = components.PlayerAlliance.get(player)?.role ?? EAllianceRole.Member;

  execute(
    () => account.worldContract.write.grantRole([player as Hex, role]),
    network,
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

export const acceptJoinRequest = async (network: SetupNetworkResult, account: AnyAccount, target: Entity) => {
  execute(
    () => account.worldContract.write.acceptRequestToJoin([target as Hex]),
    network,
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

export const rejectJoinRequest = async (network: SetupNetworkResult, account: AnyAccount, target: Entity) => {
  execute(
    () => account.worldContract.write.rejectRequestToJoin([target as Hex]),
    network,
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

export const invite = async (network: SetupNetworkResult, account: AnyAccount, target: Entity) => {
  execute(
    () => account.worldContract.write.invite([target as Hex]),
    network,
    {
      id: hashEntities(TransactionQueueType.Invite, target),
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
