import { TxQueueOptions } from "@/network/components/customComponents/TransactionQueueComponent";
import { createBurnerAccount } from "@/network/setup/createBurnerAccount";
import { _execute } from "@/network/txExecute/_execute";
import { signCall } from "@/network/txExecute/signCall";
import { WorldAbi } from "@/network/world";
import { Has, runQuery } from "@latticexyz/recs";
import { decodeEntity, singletonEntity } from "@latticexyz/store-sync/recs";
import { toast } from "react-toastify";
import { components } from "src/network/components";
import { execute } from "src/network/txExecute/txExecute";
import { executeBatch } from "src/network/txExecute/txExecuteBatch";
import { MUD } from "src/network/types";
import { minEth, TransactionQueueType, UNLIMITED_DELEGATION } from "src/util/constants";
import { getSystemId } from "src/util/encode";
import { Address, encodeFunctionData, Hex } from "viem";

export const grantAccessWithSignature = async (
  mud: MUD,
  privateKey?: Hex,
  txQueueOptions?: TxQueueOptions<TransactionQueueType.Access>
) => {
  const dripBeforeCall = async () => {
    const tempSessionAccount = await createBurnerAccount(privateKey, false);
    // Initial request for ETH
    mud.requestDrip(tempSessionAccount.address);

    // Poll the address balance to check if it has ETH
    const hasEth = async () => {
      const balance = await tempSessionAccount.publicClient.getBalance({ address: tempSessionAccount.address });
      return balance > minEth;
    };

    // Helper function to wait for a condition within a timeout
    const waitForEth = async (timeoutMs: number) => {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        if (await hasEth()) {
          return true;
        }
        // Wait for a short period before polling again
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      return false;
    };

    // Wait for ETH with a 10-second timeout
    const success = await waitForEth(10000);
    if (!success) {
      toast.error("Timeout: ETH not received within 10 seconds. Please try again.");
      throw new Error("Timeout: ETH not received within 10 seconds. Please try again.");
    }
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

    return await tempSessionAccount.worldContract.write.callWithSignature([
      mud.playerAccount.address,
      getSystemId("Registration", "CORE"),
      delegateCallData,
      signature,
    ]);
  };
  const run = async () => {
    const tx = dripBeforeCall();
    await _execute(mud, tx);
  };

  if (txQueueOptions) components.TransactionQueue.enqueue(run, txQueueOptions);
  else run();
};

export const grantAccess = async (mud: MUD, address: Hex) => {
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
    {
      mud,
      systemId: getSystemId("Registration", "CORE"),
      functionName: "unregisterDelegation",
      args: [address],
      withSession: true,
    },
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
