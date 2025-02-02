import { toast } from "react-toastify";
import { Address, encodeFunctionData, Hex } from "viem";

import {
  _execute,
  AccountClient,
  Core,
  createLocalAccount,
  ExecuteFunctions,
  getSystemId,
  minEth,
  signCall,
  TxQueueOptions,
  UNLIMITED_DELEGATION,
  WorldAbi,
} from "@primodiumxyz/core";
import { defaultEntity, query } from "@primodiumxyz/reactive-tables";
import { decodeEntity } from "@primodiumxyz/reactive-tables/utils";

export const createAccessCalls = (
  core: Core,
  accountClient: AccountClient,
  { execute, executeBatch }: ExecuteFunctions,
  requestDrip?: (address: Address) => void,
) => {
  const { tables } = core;
  const grantAccessWithSignature = async (privateKey?: Hex, txQueueOptions?: TxQueueOptions) => {
    const dripBeforeCall = async () => {
      if (!requestDrip) {
        console.warn("No requestDrip function provided. Skipping drip check.");
        return;
      }
      const tempSessionAccount = createLocalAccount(core.config, privateKey, false);
      // Initial request for ETH
      requestDrip(tempSessionAccount.address);

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
        core,
        userAccountClient: accountClient.playerAccount.walletClient,
        worldAddress: accountClient.playerAccount.worldContract.address,
        systemId: getSystemId("Registration", "CORE"),

        callData: delegateCallData,
      });

      return await tempSessionAccount.worldContract.write.callWithSignature([
        accountClient.playerAccount.address,
        getSystemId("Registration", "CORE"),
        delegateCallData,
        signature,
      ]);
    };
    const run = async () => {
      const tx = dripBeforeCall();
      await _execute(core, tx);
    };

    if (txQueueOptions) core.tables.TransactionQueue.enqueue(run, txQueueOptions);
    else run();
  };

  const grantAccess = async (address: Hex) => {
    await execute({
      functionName: "registerDelegation",
      args: [address, UNLIMITED_DELEGATION, "0x0"],
      withSession: false,
      txQueueOptions: {
        id: defaultEntity,
      },
    });
  };

  const revokeAccess = async (address: Address) => {
    await execute({
      functionName: "unregisterDelegation",
      args: [address],
      withSession: true,
      txQueueOptions: {
        id: defaultEntity,
      },
    });
  };

  const revokeAllAccess = async () => {
    const allAuthorized = query({ with: [tables.UserDelegationControl] }).reduce((prev, entity) => {
      const key = decodeEntity(tables.UserDelegationControl.metadata.abiKeySchema, entity);
      if (key.delegator !== accountClient.playerAccount.address) return prev;
      return [...prev, key.delegatee];
    }, [] as Address[]);

    const systemCalls = allAuthorized.map((authorized) => ({
      functionName: "unregisterDelegation",
      args: [authorized],
    })) as {
      systemId: Hex;
      functionName: "unregisterDelegation";
      args: [Hex];
    }[];

    await executeBatch({
      systemCalls,
      txQueueOptions: {
        id: defaultEntity,
      },
    });
  };

  return {
    grantAccess,
    revokeAccess,
    revokeAllAccess,
    grantAccessWithSignature,
  };
};
