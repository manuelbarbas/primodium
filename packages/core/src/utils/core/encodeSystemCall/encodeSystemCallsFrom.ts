import type { AbiParametersToPrimitiveTypes, ExtractAbiFunction } from "abitype";
import IWorldCallAbi from "@latticexyz/world/out/IWorldKernel.sol/IWorldCall.abi.json";
import { Abi, Address, type ContractFunctionName } from "viem";
import { SystemCallFrom, encodeSystemCallFrom } from "./encodeSystemCallFrom";
import { Components } from "@/types";

/** Encode system calls to be passed as arguments into `World.batchCallFrom` */
export function encodeSystemCallsFrom<abi extends Abi, functionName extends ContractFunctionName<abi>>(
  abi: abi,
  components: Components,
  from: Address,
  systemCalls: readonly Omit<SystemCallFrom<abi, functionName>, "abi" | "from">[]
): AbiParametersToPrimitiveTypes<ExtractAbiFunction<typeof IWorldCallAbi, "callFrom">["inputs"]>[] {
  return systemCalls.map((systemCall) =>
    encodeSystemCallFrom({ ...systemCall, components, abi, from } as SystemCallFrom<abi, functionName> & {
      components: Components;
    })
  );
}
