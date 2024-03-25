import { AbiParametersToPrimitiveTypes, ExtractAbiFunction } from "abitype";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { Abi, ContractFunctionName } from "viem";
import { SystemCall, encodeSystemCall } from "./encodeSystemCall";

/** Encode system calls to be passed as arguments into `World.batchCall` */
export function encodeSystemCalls<abi extends Abi, functionName extends ContractFunctionName<abi>>(
  abi: abi,
  systemCalls: readonly Omit<SystemCall<abi, functionName>, "abi">[]
): AbiParametersToPrimitiveTypes<ExtractAbiFunction<typeof IWorldAbi, "call">["inputs"]>[] {
  return systemCalls.map((systemCall) => encodeSystemCall({ ...systemCall, abi } as SystemCall<abi, functionName>));
}
