import { components } from "src/network/components";
import {
  Abi,
  AbiFunctionNotFoundErrorType,
  AbiItem,
  ConcatHexErrorType,
  EncodeAbiParametersErrorType,
  GetAbiItemErrorType,
  GetAbiItemParameters,
  GetFunctionArgs,
  GetFunctionSelectorErrorType,
  Hex,
  InferFunctionName,
  concatHex,
  encodeAbiParameters,
  getAbiItem,
  getFunctionSelector,
} from "viem";
import { formatAbiItem } from "viem/utils/abi/formatAbiItem";

export type EncodeFunctionDataParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string | undefined = string,
  _FunctionName = InferFunctionName<TAbi, TFunctionName>
> = {
  functionName?: _FunctionName;
} & (TFunctionName extends string
  ? { abi: TAbi } & GetFunctionArgs<TAbi, TFunctionName>
  : _FunctionName extends string
  ? { abi: [TAbi[number]] } & GetFunctionArgs<TAbi, _FunctionName>
  : never);

export type EncodeFunctionDataErrorType =
  | AbiFunctionNotFoundErrorType
  | ConcatHexErrorType
  | EncodeAbiParametersErrorType
  | GetAbiItemErrorType
  | GetFunctionSelectorErrorType;

export function encodeFunctionData<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string | undefined = undefined
>({ abi, args, functionName }: EncodeFunctionDataParameters<TAbi, TFunctionName>) {
  let abiItem = abi[0] as AbiItem;
  if (functionName) {
    abiItem = getAbiItem({
      abi,
      args,
      name: functionName,
    } as GetAbiItemParameters);
    if (!abiItem) throw new Error("AbiFunctionNotFoundError");
  }

  if (abiItem.type !== "function") throw new Error("AbiFunctionNotFoundError");

  const definition = formatAbiItem(abiItem);
  const rawSignature = getFunctionSelector(definition);
  const signature = components.FunctionSelectors.getWithKeys({ functionSelector: rawSignature })
    ?.systemFunctionSelector as Hex;
  if (!signature) throw new Error("System Function Selector Not Found");
  const data =
    "inputs" in abiItem && abiItem.inputs
      ? encodeAbiParameters(abiItem.inputs, (args ?? []) as readonly unknown[])
      : undefined;
  return concatHex([signature, data ?? "0x"]);
}
