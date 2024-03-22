import { formatAbiItem, type Abi } from "abitype";

import {
  ContractFunctionName,
  EncodeFunctionDataParameters,
  EncodeFunctionDataReturnType,
  concatHex,
  encodeAbiParameters,
  getAbiItem,
  toFunctionSelector,
} from "viem";

export function encodeFunctionData<
  abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi> | undefined = undefined
>(parameters: EncodeFunctionDataParameters<abi, functionName>): EncodeFunctionDataReturnType {
  const { abi, args, functionName } = parameters as EncodeFunctionDataParameters;

  let abiItem = abi[0];
  if (functionName) {
    const item = getAbiItem({
      abi,
      args,
      name: functionName,
    });
    if (!item) throw new Error("Function not found");
    abiItem = item;
  }

  if (abiItem.type !== "function") throw new Error('Expected abiItem to be of type "function"');

  const definition = formatAbiItem(abiItem);
  const signature = toFunctionSelector(definition);
  const data = "inputs" in abiItem && abiItem.inputs ? encodeAbiParameters(abiItem.inputs, args ?? []) : undefined;
  return concatHex([signature, data ?? "0x"]);
}
