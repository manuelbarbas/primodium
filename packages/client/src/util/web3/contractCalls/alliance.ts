import { Entity } from "@latticexyz/recs";
import { EAllianceInviteMode, EAllianceRole } from "contracts/config/enums";
import { execute } from "src/network/actions";
import { SetupNetworkResult } from "src/network/types";
import { TransactionQueueType, toHex32 } from "src/util/constants";
import { Hex } from "viem";
import { uuid } from "@latticexyz/utils";
import { hashEntities } from "src/util/encode";
import { components } from "src/network/components";

export const createAlliance = async (name: string, inviteOnly: boolean, network: SetupNetworkResult) => {
  await execute(
    () =>
      network.worldContract.write.create([
        toHex32(name.substring(0, 6).toUpperCase()),
        inviteOnly ? EAllianceInviteMode.Closed : EAllianceInviteMode.Open,
      ]),
    network,
    {
      id: uuid() as Entity,
    }
  );
};

export const leaveAlliance = async (network: SetupNetworkResult) => {
  const tx = await network.worldContract.write.leave();
  await network.waitForTransaction(tx);

  execute(() => network.worldContract.write.leave(), network, {
    id: uuid() as Entity,
  });
};

export const joinAlliance = async (alliance: Entity, network: SetupNetworkResult) => {
  execute(() => network.worldContract.write.join([alliance as Hex]), network, {
    id: hashEntities(TransactionQueueType.JoinAlliance, alliance),
  });
};

export const declineInvite = async (inviter: Entity, network: SetupNetworkResult) => {
  execute(() => network.worldContract.write.declineInvite([inviter as Hex]), network, {
    id: hashEntities(TransactionQueueType.DeclineInvite, inviter),
  });
};

export const requestToJoin = async (alliance: Entity, network: SetupNetworkResult) => {
  execute(() => network.worldContract.write.requestToJoin([alliance as Hex]), network, {
    id: hashEntities(TransactionQueueType.JoinAlliance, alliance),
  });
};

export const kickPlayer = async (player: Entity, network: SetupNetworkResult) => {
  execute(() => network.worldContract.write.kick([player as Hex]), network, {
    id: hashEntities(TransactionQueueType.KickPlayer, player),
  });
};

export const grantRole = async (player: Entity, role: EAllianceRole, network: SetupNetworkResult) => {
  const currentRole = components.PlayerAlliance.get(player)?.role ?? EAllianceRole.Member;

  execute(() => network.worldContract.write.grantRole([player as Hex, role]), network, {
    id: hashEntities(role < currentRole ? TransactionQueueType.Promote : TransactionQueueType.Demote, player),
  });
};

export const acceptJoinRequest = async (target: Entity, network: SetupNetworkResult) => {
  execute(() => network.worldContract.write.acceptRequestToJoin([target as Hex]), network, {
    id: hashEntities(TransactionQueueType.AcceptRequest, target),
  });
};

export const rejectJoinRequest = async (target: Entity, network: SetupNetworkResult) => {
  execute(() => network.worldContract.write.rejectRequestToJoin([target as Hex]), network, {
    id: hashEntities(TransactionQueueType.RejectRequest, target),
  });
};

export const invite = async (target: Entity, network: SetupNetworkResult) => {
  execute(() => network.worldContract.write.invite([target as Hex]), network, {
    id: hashEntities(TransactionQueueType.Invite, target),
  });
};
