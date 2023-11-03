import { Entity } from "@latticexyz/recs";
import { EAllianceInviteMode, EAllianceRole } from "contracts/config/enums";
import { execute } from "src/network/actions";
import { SetupNetworkResult } from "src/network/types";
import { TransactionQueueType, toHex32 } from "src/util/constants";
import { Hex } from "viem";
import { hashEntities } from "src/util/encode";
import { components } from "src/network/components";
import { randomEntity } from "src/util/common";
import { ampli } from "src/ampli";
import { parseReceipt } from "../../analytics/parseReceipt";

export const createAlliance = async (name: string, inviteOnly: boolean, network: SetupNetworkResult) => {
  await execute(
    () =>
      network.worldContract.write.create([
        toHex32(name.substring(0, 6).toUpperCase()),
        inviteOnly ? EAllianceInviteMode.Closed : EAllianceInviteMode.Open,
      ]),
    network,
    {
      id: randomEntity(),
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

export const leaveAlliance = async (network: SetupNetworkResult) => {
  execute(
    () => network.worldContract.write.leave(),
    network,
    {
      id: randomEntity(),
    },
    (receipt) => {
      const allianceName = components.PlayerAlliance.get(network.playerEntity)?.alliance as Entity;

      ampli.systemLeave({
        allianceName: allianceName!,
        ...parseReceipt(receipt),
      });
    }
  );
};

export const joinAlliance = async (alliance: Entity, network: SetupNetworkResult) => {
  execute(
    () => network.worldContract.write.join([alliance as Hex]),
    network,
    {
      id: hashEntities(TransactionQueueType.JoinAlliance, alliance),
    },
    (receipt) => {
      ampli.systemJoin({
        allianceName: alliance,
        ...parseReceipt(receipt),
      });
    }
  );
};

export const declineInvite = async (inviter: Entity, network: SetupNetworkResult) => {
  execute(
    () => network.worldContract.write.declineInvite([inviter as Hex]),
    network,
    {
      id: hashEntities(TransactionQueueType.DeclineInvite, inviter),
    },
    (receipt) => {
      const inviterAllianceName = components.PlayerAlliance.get(inviter)?.alliance as Entity;

      ampli.systemDeclineInvite({
        allianceName: inviterAllianceName,
        allianceInviter: inviter,
        ...parseReceipt(receipt),
      });
    }
  );
};

export const requestToJoin = async (alliance: Entity, network: SetupNetworkResult) => {
  execute(
    () => network.worldContract.write.requestToJoin([alliance as Hex]),
    network,
    {
      id: hashEntities(TransactionQueueType.JoinAlliance, alliance),
    },
    (receipt) => {
      ampli.systemRequestToJoin({
        allianceName: alliance,
        ...parseReceipt(receipt),
      });
    }
  );
};

export const kickPlayer = async (player: Entity, network: SetupNetworkResult) => {
  // Fetch alliance name before kicking
  const allianceName = components.PlayerAlliance.get(player)?.alliance as Entity;

  execute(
    () => network.worldContract.write.kick([player as Hex]),
    network,
    {
      id: hashEntities(TransactionQueueType.KickPlayer, player),
    },
    (receipt) => {
      ampli.systemKick({
        allianceName: allianceName!,
        allianceRejectee: player,
        ...parseReceipt(receipt),
      });
    }
  );
};

export const grantRole = async (player: Entity, role: EAllianceRole, network: SetupNetworkResult) => {
  const currentRole = components.PlayerAlliance.get(player)?.role ?? EAllianceRole.Member;

  execute(
    () => network.worldContract.write.grantRole([player as Hex, role]),
    network,
    {
      id: hashEntities(role < currentRole ? TransactionQueueType.Promote : TransactionQueueType.Demote, player),
    },
    (receipt) => {
      const allianceName = components.PlayerAlliance.get(player)?.alliance as Entity;

      ampli.systemGrantRole({
        allianceName: allianceName!,
        allianceRole: EAllianceRole[role],
        allianceMember: player,
        ...parseReceipt(receipt),
      });
    }
  );
};

export const acceptJoinRequest = async (target: Entity, network: SetupNetworkResult) => {
  execute(
    () => network.worldContract.write.acceptRequestToJoin([target as Hex]),
    network,
    {
      id: hashEntities(TransactionQueueType.AcceptRequest, target),
    },
    (receipt) => {
      const allianceName = components.PlayerAlliance.get(target)?.alliance as Entity;

      ampli.systemAcceptJoinRequest({
        allianceName: allianceName!,
        allianceAcceptee: target,
        ...parseReceipt(receipt),
      });
    }
  );
};

export const rejectJoinRequest = async (target: Entity, network: SetupNetworkResult) => {
  execute(
    () => network.worldContract.write.rejectRequestToJoin([target as Hex]),
    network,
    {
      id: hashEntities(TransactionQueueType.RejectRequest, target),
    },
    (receipt) => {
      const allianceName = components.PlayerAlliance.get(target)?.alliance as Entity;

      ampli.systemRejectJoinRequest({
        allianceName: allianceName!,
        allianceRejectee: target,
        ...parseReceipt(receipt),
      });
    }
  );
};

export const invite = async (target: Entity, network: SetupNetworkResult) => {
  execute(
    () => network.worldContract.write.invite([target as Hex]),
    network,
    {
      id: hashEntities(TransactionQueueType.Invite, target),
    },
    (receipt) => {
      const allianceName = components.PlayerAlliance.get(network.playerEntity)?.alliance as Entity;

      ampli.systemInvite({
        allianceName: allianceName!,
        allianceAcceptee: target,
        ...parseReceipt(receipt),
      });
    }
  );
};
