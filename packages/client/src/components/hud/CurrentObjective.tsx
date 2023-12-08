import { singletonEntity } from "@latticexyz/store-sync/recs";
import { EObjectives } from "contracts/config/enums";
import { useEffect, useMemo, useState } from "react";
import { FaGift, FaMapPin } from "react-icons/fa";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { clampedIndex, getBlockTypeName } from "src/util/common";
import { ObjectiveEntityLookup, TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { ObjectiveDescriptions } from "src/util/objectiveDescriptions";
import { getCanClaimObjective } from "src/util/objectives";
import { claimObjective } from "src/util/web3/contractCalls/claimObjective";
import { Hex } from "viem";
import { Button } from "../core/Button";
import { Card } from "../core/Card";
import { IconLabel } from "../core/IconLabel";
import { Modal } from "../core/Modal";
import { TransactionQueueMask } from "../shared/TransactionQueueMask";
import { Objectives } from "./modals/Objectives";

const tutorialObjectives = [
  EObjectives.BuildIronMine,
  EObjectives.BuildCopperMine,
  EObjectives.BuildGarage,
  EObjectives.BuildWorkshop,
  EObjectives.BuildIronPlateFactory,
];

export const CurrentObjective = () => {
  const { network } = useMud();
  const playerEntity = components.Account.use()?.value ?? singletonEntity;
  const [currentStep, setCurrentStep] = useState(0);
  const objectiveEntity =
    ObjectiveEntityLookup[tutorialObjectives[clampedIndex(currentStep, tutorialObjectives.length)]];
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
    playerEntity,
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
    // Function to find the next unclaimed objective
    const findNextUnclaimedObjective = () => {
      return tutorialObjectives.findIndex((objective) => {
        const objectiveEntity = ObjectiveEntityLookup[objective];
        const isClaimed =
          components.CompletedObjective.getWithKeys({
            entity: playerEntity as Hex,
            objective: objectiveEntity as Hex,
          })?.value ?? false;
        return !isClaimed;
      });
    };

    const nextUnclaimedIndex = findNextUnclaimedObjective();

    setCurrentStep(nextUnclaimedIndex);
  }, [claimed, playerEntity]);

  if (currentStep === -1)
    return (
      <Modal title="objectives">
        <Modal.Button className="border-secondary border-t-0 border-r-0 rounded-t-none rounded-r-none">
          <IconLabel imageUri="img/icons/objectiveicon.png" className="text-sm" text="VIEW OBJECTIVES" />
        </Modal.Button>
        <Modal.Content className="w-[50rem] h-[50rem]">
          <Objectives />
        </Modal.Content>
      </Modal>
    );

  return (
    <div className="flex flex-col items-center">
      <Card className="flex flex-col justify-center border-t-0 border-secondary rounded-t-none mr-2 w-fit p-0">
        <div className="flex flex-col p-1 bg-opacity-50">
          <div className="flex gap-1 items-center p-1">
            <FaMapPin className="text-accent" />
            <p className="font-bold">{getBlockTypeName(objectiveEntity)}</p>
          </div>
          <hr className="border-secondary/50" />
          <div className="flex gap-1 text-right w-full justify-end px-2 border-secondary/50 p-1 w-72">
            <p className="text-xs text-success text-left normal-case font-normal">
              {ObjectiveDescriptions.get(tutorialObjectives[currentStep])}
            </p>
          </div>
        </div>
      </Card>
      <div className="flex justify-between w-full px-5 pt-2">
        <TransactionQueueMask
          className="w-fit flex items-center justify-center"
          queueItemId={hashEntities(TransactionQueueType.ClaimObjective, objectiveEntity)}
        >
          <Button
            disabled={!canClaim}
            className={`btn-xs btn-ghost flex items-center justify-center gap-1 text-accent`}
            onClick={() => {
              claimObjective(objectiveEntity, network);
            }}
          >
            <FaGift /> {"Claim"}
          </Button>
        </TransactionQueueMask>
        <p className="text-xs text-secondary">
          {currentStep + 1} / {tutorialObjectives.length}
        </p>
      </div>
    </div>
  );
};
