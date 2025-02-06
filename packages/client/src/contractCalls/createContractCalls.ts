import { Address } from "viem";

import { AccountClient, Core, createExecute } from "@primodiumxyz/core";
import { createAccessCalls } from "@/contractCalls/contractCalls/access";
import { createAllianceCalls } from "@/contractCalls/contractCalls/alliance";
import { createAttack } from "@/contractCalls/contractCalls/attack";
import { createBuildingCalls } from "@/contractCalls/contractCalls/building";
import { createClaimObjective } from "@/contractCalls/contractCalls/claimObjective";
import { createClaimPointsCalls } from "@/contractCalls/contractCalls/claimPrimodium";
import { createClaimUnits } from "@/contractCalls/contractCalls/claimUnits";
import { createColonySlotsCalls } from "@/contractCalls/contractCalls/colonySlot";
import { createDevCalls } from "@/contractCalls/contractCalls/dev";
import { createFleetCalls } from "@/contractCalls/contractCalls/fleet";
import { createForfeitCalls } from "@/contractCalls/contractCalls/forfeit";
import { createIncrement } from "@/contractCalls/contractCalls/increment";
import { createSpawn } from "@/contractCalls/contractCalls/spawn";
import { createSwapCalls } from "@/contractCalls/contractCalls/swap";
import { createTrainCalls } from "@/contractCalls/contractCalls/train";
import { createTransferCalls } from "@/contractCalls/contractCalls/transfer";
import { createUpgrade } from "@/contractCalls/contractCalls/upgrade";
import { createWormholeDeposit } from "@/contractCalls/contractCalls/wormholeDeposit";

export type ContractCalls = ReturnType<typeof createContractCalls>;

export const createContractCalls = (
  core: Core,
  accountClient: AccountClient,
  requestDrip?: (address: Address) => void,
) => {
  const execute = createExecute(core, accountClient);

  const accessCalls = createAccessCalls(core, accountClient, execute, requestDrip);
  const allianceCalls = createAllianceCalls(core, accountClient, execute);
  const attack = createAttack(core, accountClient, execute);
  const buildingCalls = createBuildingCalls(core, execute);
  const claimObjective = createClaimObjective(core, execute);
  const claimPoints = createClaimPointsCalls(core, accountClient, execute);
  const claimUnits = createClaimUnits(core, execute);
  const payForColonySlot = createColonySlotsCalls(core, execute);
  const devCalls = createDevCalls(execute);
  const fleetCalls = createFleetCalls(core, accountClient, execute);
  const forfeitCalls = createForfeitCalls(core, accountClient, execute);
  const increment = createIncrement(core, execute);
  const spawn = createSpawn(execute);
  const swap = createSwapCalls(core, accountClient, execute);
  const train = createTrainCalls(core, execute);
  const transfer = createTransferCalls(core, accountClient, execute);
  const upgrade = createUpgrade(core, accountClient, execute);
  const wormholeDeposit = createWormholeDeposit(core, accountClient, execute);

  return {
    ...execute,
    ...accessCalls,
    spawn,
    increment,
    ...forfeitCalls,
    ...allianceCalls,
    attack,
    ...buildingCalls,
    ...devCalls,
    wormholeDeposit,
    ...upgrade,
    claimObjective,
    ...claimPoints,
    claimUnits,
    swap,
    payForColonySlot,
    train,
    ...fleetCalls,
    transfer,
  };
};
