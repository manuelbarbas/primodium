import { AbiParametersToPrimitiveTypes, ExtractAbiFunction } from "abitype";
import { Abi, EncodeFunctionDataParameters, Hex, type ContractFunctionName } from "viem";
import { encodeFunctionData } from "./encodeFunctionData";
import { Components } from "@/lib/types";
import { WorldAbi } from "@/worldAbi";

export type SystemCall<abi extends Abi, functionName extends ContractFunctionName<abi>> = EncodeFunctionDataParameters<
  abi,
  functionName
> & {
  readonly systemId: Hex;
};

/** Encode a system call to be passed as arguments into `World.call` */
export function encodeSystemCall<abi extends Abi, functionName extends ContractFunctionName<abi>>({
  components,
  abi,
  systemId,
  functionName,
  args,
}: SystemCall<abi, functionName> & { components: Components }): AbiParametersToPrimitiveTypes<
  ExtractAbiFunction<typeof WorldAbi, "call">["inputs"]
> {
  return [
    systemId,
    encodeFunctionData<abi, functionName>(components, {
      abi,
      functionName,
      args,
    } as EncodeFunctionDataParameters<abi, functionName>),
  ];
}
