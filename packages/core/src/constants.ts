import CallWithSignatureAbi from "@latticexyz/world-modules/out/Unstable_CallWithSignatureSystem.sol/Unstable_CallWithSignatureSystem.abi.json";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { Abi } from "viem";

export const WorldAbi = [...IWorldAbi, ...CallWithSignatureAbi] satisfies Abi;
