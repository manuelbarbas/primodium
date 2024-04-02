import type { AbiParametersToPrimitiveTypes, ExtractAbiFunction } from "abitype";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { Abi, Address, type ContractFunctionName } from "viem";
import { SystemCallFrom, encodeSystemCallFrom } from "./encodeSystemCallFrom";

/** Encode system calls to be passed as arguments into `World.batchCallFrom` */
export function encodeSystemCallsFrom<abi extends Abi, functionName extends ContractFunctionName<abi>>(
  abi: abi,
  from: Address,
  systemCalls: readonly Omit<SystemCallFrom<abi, functionName>, "abi" | "from">[]
): AbiParametersToPrimitiveTypes<ExtractAbiFunction<typeof IWorldAbi, "callFrom">["inputs"]>[] {
  return systemCalls.map((systemCall) =>
    encodeSystemCallFrom({ ...systemCall, abi, from } as SystemCallFrom<abi, functionName>)
  );
}
