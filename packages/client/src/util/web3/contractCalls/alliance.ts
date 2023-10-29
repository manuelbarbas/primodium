import { Entity } from "@latticexyz/recs";
import { EAllianceInviteMode, EAllianceRole } from "contracts/config/enums";
import { SetupNetworkResult } from "src/network/types";
import { toHex32 } from "src/util/constants";
import { Hex } from "viem";

export const createAlliance = async (name: string, inviteOnly: boolean, network: SetupNetworkResult) => {
  const tx = await network.worldContract.write.create([
    toHex32(name.substring(0, 6).toUpperCase()),
    inviteOnly ? EAllianceInviteMode.Closed : EAllianceInviteMode.Open,
  ]);
  await network.waitForTransaction(tx);
};

export const leaveAlliance = async (network: SetupNetworkResult) => {
  const tx = await network.worldContract.write.leave();
  await network.waitForTransaction(tx);
};

export const joinAlliance = async (alliance: Entity, network: SetupNetworkResult) => {
  const tx = await network.worldContract.write.join([alliance as Hex]);
  await network.waitForTransaction(tx);
};

export const requestToJoin = async (alliance: Entity, network: SetupNetworkResult) => {
  const tx = await network.worldContract.write.requestToJoin([alliance as Hex]);
  await network.waitForTransaction(tx);
};

export const kickPlayer = async (player: Entity, network: SetupNetworkResult) => {
  const tx = await network.worldContract.write.kick([player as Hex]);
  await network.waitForTransaction(tx);
};

export const grantRole = async (player: Entity, role: EAllianceRole, network: SetupNetworkResult) => {
  const tx = await network.worldContract.write.grantRole([player as Hex, role]);
  await network.waitForTransaction(tx);
};
