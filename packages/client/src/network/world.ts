import { createWorld } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import CallWithSignatureAbi from "@latticexyz/world-modules/out/Unstable_CallWithSignatureSystem.sol/Unstable_CallWithSignatureSystem.abi.json";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { Abi } from "viem";

// The world contains references to all entities, all components and disposers.
export const world = createWorld();
export const singletonIndex = world.registerEntity({ id: singletonEntity });

export const WorldAbi = [...IWorldAbi, ...CallWithSignatureAbi] satisfies Abi;
