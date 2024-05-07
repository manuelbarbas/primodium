import { _execute } from "@/network/txExecute/_execute";
import { WorldAbi } from "@/network/world";
import { Abi, ContractFunctionName, Hex, TransactionReceipt } from "viem";
import { components } from "../components";
import { MetadataTypes, TxQueueOptions } from "../components/customComponents/TransactionQueueComponent";
import { encodeSystemCall, encodeSystemCallFrom, SystemCall } from "../setup/encodeSystemCall";
import { MUD } from "../types";

// Function that takes in a transaction promise that resolves to a completed transaction
// Alerts the user if the transaction failed
// Providers renamed to client: https://viem.sh/docs/ethers-migration.html

type ExecuteCallOptions<abi extends Abi, functionName extends ContractFunctionName<abi>> = Omit<
  SystemCall<abi, functionName>,
  "abi"
> & {
  abi?: abi;
  mud: MUD;
  withSession?: boolean;
  options?: { gas?: bigint };
};

export async function execute<
  T extends keyof MetadataTypes,
  abi extends Abi,
  functionName extends ContractFunctionName<abi>
>(
  { mud, systemId, functionName, args, withSession, options: callOptions }: ExecuteCallOptions<abi, functionName>,
  txQueueOptions?: TxQueueOptions<T>,
  onComplete?: (receipt: TransactionReceipt | undefined) => void
) {
  const account = withSession ? mud.sessionAccount ?? mud.playerAccount : mud.playerAccount;
  const authorizing = account == mud.sessionAccount;
  console.info(
    `[Tx] Executing ${functionName} with address ${account.address.slice(0, 6)} ${
      authorizing ? "(with session acct)" : ""
    }`
  );

  const run = async () => {
    let tx: Promise<Hex>;
    if (authorizing && mud.sessionAccount) {
      const params = encodeSystemCallFrom({
        abi: WorldAbi,
        from: mud.playerAccount.address,
        systemId,
        functionName,
        args,
      });
      tx = mud.sessionAccount.worldContract.write.callFrom(params, callOptions);
    } else {
      const params = encodeSystemCall({
        abi: WorldAbi as typeof WorldAbi,
        systemId,
        functionName,
        args,
      });
      console.log("params:", params);
      tx = mud.playerAccount.worldContract.write.call(params, callOptions);
    }
    const receipt = await _execute(mud, tx);
    onComplete?.(receipt);
  };

  if (txQueueOptions) components.TransactionQueue.enqueue(run, txQueueOptions);
  else {
    run();
  }
}
