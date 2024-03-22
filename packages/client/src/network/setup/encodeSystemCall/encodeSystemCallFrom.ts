import IWorldCallAbi from "@latticexyz/world/out/IWorldKernel.sol/IWorldCall.abi.json";
import { AbiParametersToPrimitiveTypes, ExtractAbiFunction } from "abitype";
import { Abi, Address, ContractFunctionName, EncodeFunctionDataParameters } from "viem";
import { encodeFunctionData } from "./encodeFunctionData";
import { SystemCall } from "./encodeSystemCall";

export type SystemCallFrom<abi extends Abi, functionName extends ContractFunctionName<abi>> = SystemCall<
  abi,
  functionName
> & {
  readonly from: Address;
};
/** Encode a system call to be passed as arguments into `World.callFrom` */
export function encodeSystemCallFrom<abi extends Abi, functionName extends ContractFunctionName<abi>>({
  abi,
  from,
  systemId,
  functionName,
  args,
}: SystemCallFrom<abi, functionName>): AbiParametersToPrimitiveTypes<
  ExtractAbiFunction<typeof IWorldCallAbi, "callFrom">["inputs"]
> {
  return [
    from,
    systemId,
    encodeFunctionData<abi, functionName>({
      abi,
      functionName,
      args,
    } as unknown as EncodeFunctionDataParameters<abi, functionName>),
  ];
}
