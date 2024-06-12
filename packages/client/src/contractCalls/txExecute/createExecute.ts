import { Abi, ContractFunctionName, Hex, TransactionReceipt } from "viem";
import { components } from "../../network/components";
import { MetadataTypes, TxQueueOptions } from "../../network/components/customComponents/TransactionQueueComponent";
import {
  encodeSystemCall,
  encodeSystemCallFrom,
  encodeSystemCallsFrom,
  encodeSystemCalls,
  SystemCall,
  SystemCallFrom,
} from "../../network/setup/encodeSystemCall";
import { AccountClient, Core, WorldAbi, WorldAbiType } from "@primodiumxyz/core";
import { _execute } from "@/network/txExecute/_execute";

// Function that takes in a transaction promise that resolves to a completed transaction
// Alerts the user if the transaction failed
// Providers renamed to client: https://viem.sh/docs/ethers-migration.html

type ExecuteCallOptions<abi extends Abi, functionName extends ContractFunctionName<abi>> = Omit<
  SystemCall<abi, functionName>,
  "abi"
> & {
  abi?: abi;
  withSession?: boolean;
  options?: { gas?: bigint };
};

export type ExecuteFunctions = {
  execute: <T extends keyof MetadataTypes, functionName extends ContractFunctionName<WorldAbiType>>(
    options: ExecuteCallOptions<WorldAbiType, functionName>,
    txQueueOptions?: TxQueueOptions<T>,
    onComplete?: (receipt: TransactionReceipt | undefined) => void
  ) => Promise<void>;
  executeBatch: <T extends keyof MetadataTypes, functionName extends ContractFunctionName<WorldAbiType>>(
    options: {
      systemCalls: readonly Omit<SystemCallFrom<WorldAbiType, functionName>, "abi" | "from">[];
      withSession?: boolean;
    },
    txQueueOptions?: TxQueueOptions<T>,
    onComplete?: (receipt: TransactionReceipt | undefined) => void
  ) => Promise<void>;
};

export function createExecute(core: Core, { playerAccount, sessionAccount }: AccountClient): ExecuteFunctions {
  async function execute<T extends keyof MetadataTypes, functionName extends ContractFunctionName<WorldAbiType>>(
    { withSession, systemId, functionName, args, options: callOptions }: ExecuteCallOptions<WorldAbiType, functionName>,
    txQueueOptions?: TxQueueOptions<T>,
    onComplete?: (receipt: TransactionReceipt | undefined) => void
  ) {
    const account = withSession ? sessionAccount ?? playerAccount : playerAccount;
    const authorizing = account == sessionAccount;

    console.info(
      `[Tx] Executing ${functionName} with address ${account.address.slice(0, 6)} ${
        authorizing ? "(with session acct)" : ""
      }`
    );

    const run = async () => {
      let tx: Promise<Hex>;
      if (authorizing && sessionAccount) {
        const params = encodeSystemCallFrom({
          abi: WorldAbi,
          from: playerAccount.address,
          systemId,
          functionName,
          args,
        });
        tx = sessionAccount.worldContract.write.callFrom(params, callOptions);
      } else {
        const params = encodeSystemCall({
          abi: WorldAbi,
          systemId,
          functionName,
          args,
        });
        tx = playerAccount.worldContract.write.call(params, callOptions);
      }
      const receipt = await _execute(core, tx);
      onComplete?.(receipt);
    };

    if (txQueueOptions) components.TransactionQueue.enqueue(run, txQueueOptions);
    else {
      run();
    }
  }

  async function executeBatch<T extends keyof MetadataTypes, functionName extends ContractFunctionName<WorldAbiType>>(
    {
      systemCalls,
      withSession,
    }: {
      systemCalls: readonly Omit<SystemCallFrom<WorldAbiType, functionName>, "abi" | "from">[];
      withSession?: boolean;
    },
    txQueueOptions?: TxQueueOptions<T>,
    onComplete?: (receipt: TransactionReceipt | undefined) => void
  ) {
    const account = withSession ? sessionAccount ?? playerAccount : playerAccount;
    const authorizing = account !== playerAccount;

    console.log(
      `[Tx] Executing batch:${systemCalls.map(
        (system) => ` ${system.functionName}`
      )} with address ${account.address.slice(0, 6)} ${authorizing ? "(using session account)" : ""}`
    );

    const queuedTx = async () => {
      if (authorizing && sessionAccount) {
        const params = encodeSystemCallsFrom(WorldAbi, sessionAccount.entity as Hex, systemCalls).map(
          ([systemId, callData]) => ({ from: playerAccount.address, systemId, callData })
        );
        const tx = await sessionAccount.worldContract.write.batchCallFrom([params]);
        return tx;
      }
      const params = encodeSystemCalls(WorldAbi, systemCalls).map(([systemId, callData]) => ({ systemId, callData }));
      const tx = await playerAccount.worldContract.write.batchCall([params]);
      return tx;
    };

    if (txQueueOptions)
      components.TransactionQueue.enqueue(async () => {
        const txPromise = queuedTx();
        const receipt = await _execute(core, txPromise);
        onComplete?.(receipt);
      }, txQueueOptions);
    else {
      const txPromise = queuedTx();
      const receipt = await _execute(core, txPromise);
      onComplete?.(receipt);
    }
  }

  return { executeBatch, execute };
}
