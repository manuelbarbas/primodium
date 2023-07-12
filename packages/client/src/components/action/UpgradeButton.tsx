import { useComponentValue } from "src/hooks/useComponentValue";
import { EntityID, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { hashKeyEntity, hashKeyEntityAndTrim } from "src/util/encode";
import { useMud } from "../../context/MudContext";
import { useAccount } from "../../hooks/useAccount";
import { execute } from "../../network/actions";
import { useGameStore } from "../../store/GameStore";
import { useNotificationStore } from "../../store/NotificationStore";
import { getBuildingResearchRequirement } from "../../util/research";
import Spinner from "../Spinner";
import { useMemo } from "react";

export default function UpgradeButton({
  id,
  coords,
  builtTile,
  buildingEntity,
}: {
  id: string;
  coords: Coord;
  builtTile: EntityID;
  buildingEntity: EntityID;
}) {
  const { systems, providers, components, world, singletonIndex } = useMud();
  const { address } = useAccount();
  const [transactionLoading, setTransactionLoading] = useGameStore((state) => [
    state.transactionLoading,
    state.setTransactionLoading,
  ]);
  const [setNotification] = useNotificationStore((state) => [
    state.setNotification,
  ]);

  const currLevel = useComponentValue(
    components.BuildingLevel,
    world.entityToIndex.get(buildingEntity) as EntityIndex
  );
  const maxLevel = useComponentValue(
    components.MaxLevel,
    world.entityToIndex.get(builtTile) as EntityIndex
  );

  const buildingTypeLevel = useMemo(() => {
    return hashKeyEntity(
      builtTile as unknown as EntityID,
      currLevel?.value as unknown as EntityID
    );
  }, [currLevel]);

  const upgradeLocked = () => {
    const researchRequirement = getBuildingResearchRequirement(
      buildingTypeLevel,
      world,
      components
    );

    if (!researchRequirement) {
      return false;
    }
    const researchOwner = address
      ? world.entityToIndex.get(
          hashKeyEntityAndTrim(
            researchRequirement,
            address.toString().toLowerCase()
          ) as EntityID
        )!
      : singletonIndex;
    const isResearched = getComponentValue(components.Research, researchOwner);

    return !(isResearched && isResearched.value);
  };

  const claimAction = async () => {
    setTransactionLoading(true);
    await execute(
      systems["system.Upgrade"].executeTyped(coords, {
        gasLimit: 30_000_000,
      }),
      providers,
      setNotification
    );
    setTransactionLoading(false);
  };
  const upgradedLevel = useMemo(() => {
    return parseInt(currLevel?.value.toString() ?? "0") + 1;
  }, [currLevel]);

  const levelCondition = useMemo(() => {
    return (currLevel?.value ?? 0) < (maxLevel?.value ?? 0);
  }, [currLevel, maxLevel]);

  const upgradeText = useMemo(() => {
    return levelCondition
      ? "Upgrade Building to Level " + upgradedLevel.toString()
      : "Max Level Reached";
  }, [upgradedLevel]);

  const colorCode = useMemo(() => {
    return "bg-yellow-800 hover:bg-yellow-900";
  }, []);
  console.log("reached rendering upgrade button");
  if (transactionLoading) {
    return (
      <div className="absolute inset-x-3 bottom-3">
        <button
          id={id}
          className={`h-10 ${colorCode} text-sm rounded font-bold w-full`}
        >
          <Spinner />
        </button>
      </div>
    );
  } else {
    return (
      <div className="absolute inset-x-4 bottom-">
        <button
          disabled={upgradeLocked() || !levelCondition}
          id={id}
          className={`h-10 ${colorCode} text-sm rounded font-bold w-full`}
          onClick={claimAction}
        >
          {upgradeText}
        </button>
      </div>
    );
  }
}
