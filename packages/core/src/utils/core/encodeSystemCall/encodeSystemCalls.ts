import { AbiParametersToPrimitiveTypes, ExtractAbiFunction } from "abitype";
import { Abi, ContractFunctionName } from "viem";
import { SystemCall, encodeSystemCall } from "./encodeSystemCall";
import { Components } from "@/types";
import { WorldAbi } from "@/worldAbi";

/** Encode system calls to be passed as arguments into `World.batchCall` */
export function encodeSystemCalls<abi extends Abi, functionName extends ContractFunctionName<abi>>(
  abi: abi,
  components: Components,
  systemCalls: readonly Omit<SystemCall<abi, functionName>, "abi">[]
): AbiParametersToPrimitiveTypes<ExtractAbiFunction<typeof WorldAbi, "call">["inputs"]>[] {
  return systemCalls.map((systemCall) =>
    encodeSystemCall({ ...systemCall, components, abi } as SystemCall<abi, functionName> & { components: Components })
  );
}
