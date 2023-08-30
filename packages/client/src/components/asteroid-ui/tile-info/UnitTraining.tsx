import {
  BackgroundImage,
  BlockIdToKey,
  BlockType,
  ResourceImage,
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
import ResourceIconTooltip from "../../shared/ResourceIconTooltip";
import { Account } from "src/network/components/clientComponents";
import { useGameStore } from "src/store/GameStore";
import { NumberInput } from "src/components/shared/NumberInput";

export const UnitTraining: React.FC<{
  buildingEntity: EntityID;
  onClose: () => void;
}> = ({ buildingEntity }) => {
  const network = useMud();
  const [selectedUnit, setSelectedUnit] = useState<EntityID>();
  const [count, setCount] = useState(0);
  const transactionLoading = useGameStore((state) => state.transactionLoading);
  const account = Account.use(undefined, { value: "0" as EntityID }).value;

  useEffect(() => {
    setCount(0);
  }, [selectedUnit]);

  const playerResourceEntity = hashKeyEntity(
    BlockType.HousingUtilityResource,
    account
  );

  const totalUnits = OccupiedUtilityResource.use(playerResourceEntity, {
    value: 0,
  }).value;
  const maximum = MaxUtility.use(playerResourceEntity, { value: 0 }).value;
  const trainableUnits = useTrainableUnits(buildingEntity);

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
    const amountIndex = raw.resourceIDs.indexOf(
      BlockType.HousingUtilityResource
    );
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

  if (trainableUnits.length == 0 || maximum == 0) return null;
  return (
    <div className="relative flex flex-col  items-center text-white w-96">
      <div className="bg-slate-800 pixel-images border border-cyan-400 p-3 w-80 rounded-md">
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
                    className={`border border-cyan-400 w-[64px] h-[64px] group-hover:opacity-50 rounded-xl ${
                      selectedUnit == unit ? "border-2 border-white" : ""
                    }`}
                  />
                  <p className="opacity-0 absolute -bottom-4 text-xs bg-pink-900 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                    {getBlockTypeName(unit)}
                  </p>
                </button>
              );
            })}
          </div>
          <hr className="border-t border-cyan-600 w-full" />
          {!unitLevelEntity || !selectedUnit ? (
            <p className="opacity-50 text-xs italic mb-2 flex gap-2 z-10">
              <FaInfoCircle size={16} /> Select a unit to train it.
            </p>
          ) : (
            <>
              <p>{getBlockTypeName(selectedUnit)}</p>
              {requiredHousing > 0 && (
                <div className="flex justify-center items-center gap-2">
                  <p className="text-sm font-bold leading-none">HOUSING</p>
                  <ResourceIconTooltip
                    image={
                      ResourceImage.get(BlockType.HousingUtilityResource) ?? ""
                    }
                    scale={1}
                    resourceId={BlockType.HousingUtilityResource}
                    name={BlockIdToKey[BlockType.HousingUtilityResource]}
                    amount={requiredHousing}
                  />
                </div>
              )}
              {requiredResources && (
                <div className="flex justify-center items-center gap-2">
                  <p className="text-sm font-bold leading-none">RESOURCES</p>
                  {requiredResources.map((resource, i) => (
                    <ResourceIconTooltip
                      key={`resource-${i}`}
                      image={ResourceImage.get(resource.resource)!}
                      resourceId={resource.resource}
                      name={getBlockTypeName(resource.resource)}
                      amount={resource.amount}
                    />
                  ))}
                </div>
              )}
              <div className="grid grid-cols-5 gap-2 border-y py-2 my-2 border-cyan-400/30">
                {Object.entries(getUnitStats(selectedUnit)).map(
                  ([name, value]) => (
                    <div key={name} className="flex flex-col items-center">
                      <p className="text-xs opacity-50">{name}</p>
                      <p>{value}</p>
                    </div>
                  )
                )}
              </div>

              <NumberInput
                min={0}
                max={(maximum - totalUnits) / requiredHousing}
                onChange={(val) => setCount(val)}
              />

              <button
                className="bg-cyan-600 px-2 border-cyan-400 mt-4 font-bold disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:scale-105"
                disabled={maximum - unitsTaken < 0 || transactionLoading}
                onClick={() => {
                  train(buildingEntity, selectedUnit, count, network);
                }}
              >
                Train
              </button>
            </>
          )}
          <p className="opacity-50 text-xs">
            {Math.max(maximum - unitsTaken, 0)} housing left
          </p>
        </div>
      </div>
    </div>
  );
};
