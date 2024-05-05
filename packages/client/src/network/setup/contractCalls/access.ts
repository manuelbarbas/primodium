import { createBurnerAccount } from "@/network/setup/createBurnerAccount";
import { _execute } from "@/network/txExecute/_execute";
import { signCall } from "@/network/txExecute/txExecuteWithSignature";
import { WorldAbi } from "@/network/world";
import { Has, runQuery } from "@latticexyz/recs";
import { decodeEntity, singletonEntity } from "@latticexyz/store-sync/recs";
import { components } from "src/network/components";
import { execute } from "src/network/txExecute/txExecute";
import { executeBatch } from "src/network/txExecute/txExecuteBatch";
import { MUD } from "src/network/types";
import { TransactionQueueType, UNLIMITED_DELEGATION } from "src/util/constants";
import { getSystemId } from "src/util/encode";
import { Address, encodeFunctionData, Hex } from "viem";

export const grantAccessWithSignature = async (mud: MUD, privateKey: Hex) => {
  const tempSessionAccount = await createBurnerAccount(privateKey, false);
  const delegateCallData = encodeFunctionData({
    abi: WorldAbi,
    functionName: "registerDelegation",
    args: [tempSessionAccount.address, UNLIMITED_DELEGATION, "0x"],
  });

  const signature = await signCall({
    userAccountClient: mud.playerAccount.walletClient,
    worldAddress: mud.playerAccount.worldContract.address,
    systemId: getSystemId("Registration", "CORE"),
    callData: delegateCallData,
  });

  console.log({ delegateCallData, signature });

  const tx = tempSessionAccount.worldContract.write.callWithSignature([
    mud.playerAccount.address,
    getSystemId("Registration", "CORE"),
    delegateCallData,
    signature,
  ]);
  await _execute(mud, tx);
};

export const grantAccess = async (mud: MUD, address: Address) => {
  await execute(
    {
      mud,
      systemId: getSystemId("Registration", "CORE"),
      functionName: "registerDelegation",
      args: [address, UNLIMITED_DELEGATION, "0x0"],
      withSession: false,
    },
    {
      id: singletonEntity,
      type: TransactionQueueType.Access,
    }
  );
};

export const revokeAccess = async (mud: MUD, address: Address) => {
  await execute(
    { mud, systemId: getSystemId("Registration", "CORE"), functionName: "unregisterDelegation", args: [address] },
    {
      id: singletonEntity,
      type: TransactionQueueType.Access,
    }
  );
};

export const revokeAllAccess = async (mud: MUD) => {
  const allAuthorized = [...runQuery([Has(components.UserDelegationControl)])].reduce((prev, entity) => {
    const key = decodeEntity(components.UserDelegationControl.metadata.keySchema, entity) as {
      delegator: Address;
      delegatee: Address;
    };
    if (key.delegator !== mud.playerAccount.address) return prev;
    return [...prev, key.delegatee];
  }, [] as Address[]);

  const systemCalls = allAuthorized.map((authorized) => ({
    systemId: getSystemId("Registration", "CORE"),
    functionName: "unregisterDelegation",
    args: [authorized],
  })) as {
    systemId: Hex;
    functionName: "unregisterDelegation";
    args: [Hex];
  }[];

  await executeBatch(
    { mud, systemCalls },
    {
      id: singletonEntity,
      type: TransactionQueueType.Access,
    }
  );
};
