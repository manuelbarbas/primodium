import { Abi, ContractFunctionName, encodeFunctionData, Hex, TransactionReceipt } from "viem";

import { AccountClient, Core, WorldAbiType } from "@/lib/types";
import { WorldAbi } from "@/lib/WorldAbi";
import { TxQueueOptions } from "@/tables/types";
import { _execute } from "@/txExecute/_execute";
import { encodeSystemCall, encodeSystemCallFrom, SystemCall } from "@/txExecute/encodeSystemCall";
import { functionSystemIds } from "@/txExecute/functionSystemIds";

import { sendTransaction } from "../skaleTransaction/sendTransaction";

export type ExecuteCallOptions<abi extends Abi, functionName extends ContractFunctionName<abi>> = Omit<
  SystemCall<abi, functionName>,
  "abi" | "systemId"
> & {
  abi?: abi;
  withSession?: boolean;
  options?: { gas?: bigint };
  txQueueOptions?: TxQueueOptions;
  onComplete?: (receipt: TransactionReceipt | undefined) => void | undefined;
};
export function execute<functionName extends ContractFunctionName<WorldAbiType>>({
  core,
  accountClient: { playerAccount, sessionAccount },
  withSession,
  functionName,
  args,
  options: callOptions,
  txQueueOptions,
  onComplete,
}: ExecuteCallOptions<WorldAbiType, functionName> & {
  core: Core;
  accountClient: AccountClient;
}) {
  const account = withSession ? (sessionAccount ?? playerAccount) : playerAccount;
  const authorizing = account == sessionAccount;

  console.info(
    `[Tx] Executing ${functionName} with address ${account.address.slice(0, 6)} ${
      authorizing ? "(with session acct)" : ""
    }`,
  );

  const run = async () => {
    let tx: Promise<Hex>;

    const systemId = functionSystemIds[functionName as ContractFunctionName<WorldAbiType>];

    let params_;

    let isCallFrom = false;

    if (!systemId || !args) throw new Error(`System ID not found for function ${functionName}`);
    if (authorizing && sessionAccount) {
      const params = encodeSystemCallFrom(core.tables, {
        abi: WorldAbi,
        from: playerAccount.address,
        systemId,
        functionName,
        args: args as any,
      });
      params_ = params;
      isCallFrom = true;
    } else {
      const params = encodeSystemCall(core.tables, {
        abi: WorldAbi,
        systemId,
        functionName,
        args: args as any,
      });
      params_ = params;
    }

    let isBiteProtected = false;

    if (core.config.chain.id == 1289306510) {
      isBiteProtected = true;
    }

    const receipt = await sendTransaction(isBiteProtected, core, playerAccount, params_);

    console.log("RECEIPT", receipt);

    onComplete?.(receipt);
  };

  if (txQueueOptions) core.tables.TransactionQueue.enqueue(run, txQueueOptions);
  else {
    run();
  }
}
