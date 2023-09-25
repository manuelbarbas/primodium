import {
  BackgroundImage,
  BlockType,
  ResourceImage,
  ResourceType,
} from "src/util/constants";
import { getBlockTypeName } from "src/util/common";
import { useEffect, useMemo, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { EntityID } from "@latticexyz/recs";
import { train } from "src/util/web3";
import { useMud } from "src/hooks";
import { getUnitStats, useTrainableUnits } from "src/util/trainUnits";
import {
  Level,
  MaxUtility,
  OccupiedUtilityResource,
  P_RequiredResources,
  P_RequiredUtility,
} from "src/network/components/chainComponents";
import { hashKeyEntity } from "src/util/encode";
import ResourceIconTooltip from "../../../shared/ResourceIconTooltip";
import { Account } from "src/network/components/clientComponents";
import { useGameStore } from "src/store/GameStore";
import { NumberInput } from "src/components/shared/NumberInput";
import { useHasEnoughResources } from "src/hooks/useHasEnoughResources";
import { SingletonID } from "@latticexyz/network";
import { getRecipe } from "src/util/resource";
import { Navigator } from "src/components/core/Navigator";
import { SecondaryCard } from "src/components/core/Card";
import { Badge } from "src/components/core/Badge";

export const BuildDrone: React.FC<{
  building: EntityID;
}> = ({ building }) => {
  const network = useMud();
  const [selectedUnit, setSelectedUnit] = useState<EntityID>();
  const [count, setCount] = useState(1);
  const transactionLoading = useGameStore((state) => state.transactionLoading);
  const account = Account.use(undefined, { value: "0" as EntityID }).value;

  useEffect(() => {
    setCount(1);
  }, [selectedUnit]);

  const playerResourceEntity = hashKeyEntity(BlockType.Housing, account);

  const totalUnits = OccupiedUtilityResource.use(playerResourceEntity, {
    value: 0,
  }).value;
  const maximum = MaxUtility.use(playerResourceEntity, { value: 0 }).value;
  const trainableUnits = useTrainableUnits(building);

  const unitLevelEntity = useMemo(() => {
    if (!selectedUnit) return undefined;
    const playerUnitEntity = hashKeyEntity(selectedUnit, account);
    const level = Level.get(playerUnitEntity, { value: 0 }).value;
    return hashKeyEntity(selectedUnit, level);
  }, [selectedUnit]);

  const requiredHousing = useMemo(() => {
    if (!unitLevelEntity) return 0;
    const raw = P_RequiredUtility.get(unitLevelEntity);
    if (!raw) return 0;
    const amountIndex = raw.resourceIDs.indexOf(BlockType.Housing);
    return amountIndex == -1 ? 0 : raw.requiredAmounts[amountIndex];
  }, [unitLevelEntity]);

  const requiredResources = useMemo(() => {
    if (!unitLevelEntity) return null;
    const raw = P_RequiredResources.get(unitLevelEntity);
    if (!raw) return null;
    return raw.resources.map((resource, i) => {
      return {
        resource,
        amount: raw.values[i],
      };
    });
  }, [unitLevelEntity]);

  const unitsTaken = useMemo(() => {
    return totalUnits + count * (requiredHousing ?? 0);
  }, [count, requiredHousing, totalUnits]);

  const hasEnough = useHasEnoughResources(
    getRecipe(unitLevelEntity ?? SingletonID),
    count
  );

  useEffect(() => {
    if (trainableUnits.length == 0) return;

    setSelectedUnit(trainableUnits[0]);
  }, [trainableUnits]);

  if (trainableUnits.length == 0 || maximum == 0) return null;

  return (
    <Navigator.Screen
      title="BuildDrone"
      className="relative flex flex-col  items-center text-white w-96"
    >
      <SecondaryCard className="pixel-images w-full pointer-events-auto">
        <div className="flex flex-col items-center space-y-3">
          <div className="flex flex-wrap gap-2 items-center justify-center">
            {trainableUnits.map((unit, index) => {
              return (
                <button
                  key={index}
                  className="relative flex flex-col items-center group hover:scale-110 transition-transform hover:z-50"
                  onClick={() =>
                    selectedUnit == unit
                      ? setSelectedUnit(undefined)
                      : setSelectedUnit(unit)
                  }
                >
                  <img
                    src={
                      BackgroundImage.get(unit)?.at(0) ??
                      "/img/icons/debugicon.png"
                    }
                    className={`border w-[64px] h-[64px] group-hover:opacity-50 rounded-xl ${
                      selectedUnit == unit
                        ? "border-2 border-accent"
                        : "border-secondary/75"
                    }`}
                  />
                  <p className="opacity-0 absolute -bottom-4 text-xs bg-error rounded-box px-1 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                    {getBlockTypeName(unit)}
                  </p>
                </button>
              );
            })}
          </div>
          <hr className="border-t border-cyan-600 w-full" />
          {!unitLevelEntity || !selectedUnit ? (
            <p className="opacity-50 text-xs italic mb-2 flex gap-2 z-10">
              <FaInfoCircle size={16} /> Select a unit to start building drones.
            </p>
          ) : (
            <>
              <p className="uppercase font-bold">
                {getBlockTypeName(selectedUnit)}
              </p>

              <div className="grid grid-cols-5 gap-2 border-y border-cyan-400/30">
                {Object.entries(getUnitStats(selectedUnit)).map(
                  ([name, value]) => (
                    <div key={name} className="flex flex-col items-center">
                      <p className="text-xs opacity-50">{name}</p>
                      <p>{value}</p>
                    </div>
                  )
                )}
              </div>

              <p className="text-sm leading-none opacity-75">COST</p>

              {requiredResources && (
                <div className="flex justify-center items-center gap-1">
                  {requiredResources.map((resource, i) => (
                    <Badge key={`resource-${i}`}>
                      <ResourceIconTooltip
                        image={ResourceImage.get(resource.resource)!}
                        resourceId={resource.resource}
                        name={getBlockTypeName(resource.resource)}
                        amount={resource.amount * count}
                        fontSize="sm"
                        validate
                      />
                    </Badge>
                  ))}
                  {requiredHousing > 0 && (
                    <Badge>
                      <ResourceIconTooltip
                        image={ResourceImage.get(BlockType.Housing) ?? ""}
                        scale={1}
                        resourceId={BlockType.Housing}
                        name={getBlockTypeName(BlockType.Housing)}
                        amount={requiredHousing * count}
                        resourceType={ResourceType.Utility}
                        fontSize="sm"
                        validate
                      />
                    </Badge>
                  )}
                </div>
              )}

              <hr className="border-t border-cyan-600 w-full" />

              <NumberInput
                min={1}
                max={Math.floor((maximum - totalUnits) / requiredHousing)}
                onChange={(val) => setCount(val)}
              />

              <div className="flex gap-2">
                <Navigator.BackButton
                  className="btn-sm btn-secondary"
                  disabled={
                    maximum - unitsTaken < 0 ||
                    transactionLoading ||
                    !hasEnough ||
                    count < 1
                  }
                  onClick={() => {
                    train(building, selectedUnit, count, network);
                  }}
                >
                  Train
                </Navigator.BackButton>
                <Navigator.BackButton className="btn-sm border-secondary" />
              </div>
            </>
          )}
          <p className="opacity-50 text-xs">
            {Math.max(maximum - unitsTaken, 0)} housing left
          </p>
        </div>
      </SecondaryCard>
    </Navigator.Screen>
  );
};
