import { useMud } from "src/hooks";
import { Hex } from "viem";
import { FaGift, FaMapPin } from "react-icons/fa";
import { useEffect, useMemo, useState } from "react";
import { components } from "src/network/components";
import { Modal } from "../core/Modal";
import { Objectives } from "./modals/Objectives";
import { ObjectiveEntityLookup, TransactionQueueType } from "src/util/constants";
import { EObjectives } from "contracts/config/enums";
import { getBlockTypeName } from "src/util/common";
import { ObjectiveDescriptions } from "src/util/objectiveDescriptions";
import { getCanClaimObjective } from "src/util/objectives";
import { TransactionQueueMask } from "../shared/TransactionQueueMask";
import { hashEntities } from "src/util/encode";
import { claimObjective } from "src/util/web3/contractCalls/claimObjective";
import { Button } from "../core/Button";
import { Card } from "../core/Card";

const tutorialObjectives = [
  EObjectives.BuildIronMine,
  EObjectives.BuildCopperMine,
  EObjectives.BuildGarage,
  EObjectives.BuildWorkshop,
];

export const CurrenObjective = () => {
  const { network } = useMud();
  const playerEntity = components.Account.use()?.value ?? singletonEntity;
  const [currentStep, setCurrentStep] = useState(0);
  const objectiveEntity = ObjectiveEntityLookup[tutorialObjectives[currentStep]];
  const claimed =
    components.CompletedObjective.useWithKeys({ entity: playerEntity as Hex, objective: objectiveEntity as Hex })
      ?.value ?? false;

  const blockNumber = components.BlockNumber.use()?.value;
  const levelRequirement = components.Level.use(objectiveEntity);
  const objectiveClaimedRequirement = components.CompletedObjective.use(objectiveEntity);

  const hasBuiltBuildingRequirement = components.P_HasBuiltBuildings.use(objectiveEntity);
  const raidRequirement = components.P_RaidedResources.use(objectiveEntity);

  const resourceRequirement = components.P_RequiredResources.use(objectiveEntity);
  const unitRequirement = components.P_ProducedUnits.use(objectiveEntity);

  const canClaim = useMemo(() => {
    return getCanClaimObjective(objectiveEntity, playerEntity);
  }, [
    levelRequirement,
    objectiveClaimedRequirement,
    hasBuiltBuildingRequirement,
    raidRequirement,
    resourceRequirement,
    resourceRequirement,
    unitRequirement,
    blockNumber,
    objectiveEntity,
  ]);

  useEffect(() => {
    if (claimed) {
      setCurrentStep(currentStep + 1);
    }
  }, [claimed, currentStep, setCurrentStep]);

  if (currentStep >= tutorialObjectives.length) return <></>;

  return (
    <div className="flex flex-col items-center">
      <Card className="flex flex-col justify-center border-t-0 border-secondary rounded-t-none mr-2 w-fit p-0">
        <div className="flex flex-col p-1 bg-opacity-50">
          <div className="flex gap-1 items-center p-1">
            <FaMapPin className="text-accent" />
            <p className="font-bold">{getBlockTypeName(objectiveEntity)}</p>
          </div>
          <hr className="border-secondary/50" />
          <div className="flex gap-1 text-right w-full justify-end rounded-b-xl px-2 border-b border-secondary/50 p-1 w-72">
            <p className="text-xs text-success text-left normal-case font-normal">
              {ObjectiveDescriptions.get(tutorialObjectives[0])}
            </p>
          </div>
        </div>
      </Card>
      <TransactionQueueMask
        className="w-fit flex items-center justify-center"
        queueItemId={hashEntities(TransactionQueueType.ClaimObjective, objectiveEntity)}
      >
        <Button
          disabled={!canClaim}
          className={`btn-xs btn-ghost mt-1 flex items-center justify-center gap-1 text-accent`}
          onClick={() => {
            claimObjective(objectiveEntity, network);
          }}
        >
          <FaGift /> {"Claim"}
        </Button>
      </TransactionQueueMask>
    </div>
  );
};
