import { useCallback, useMemo } from "react";
import { EntityID, getComponentValue } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { useComponentValue } from "@latticexyz/react";
import { useAccount } from "../../hooks/useAccount";
import { useMud } from "../../context/MudContext";
import { execute } from "../../network/actions";
import { useGameStore } from "../../store/GameStore";
import Spinner from "../Spinner";
import { useNotificationStore } from "../../store/NotificationStore";
import {
  encodeCoordEntity,
  hashKeyEntity,
  hashKeyEntityAndTrim,
} from "src/util/encode";
import { BlockType } from "src/util/constants";
import { getBuildingResearchRequirement } from "../../util/research";

export default function UpgradeButton({
  id,
  coords: { x, y },
  builtTile,
}: {
  id: string;
  coords: Coord;
  builtTile: EntityID;
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

  const claimAction = useCallback(async () => {
    setTransactionLoading(true);
    await execute(
      systems["system.Upgrade"].executeTyped(
        {
          x: x,
          y: y,
        },
        {
          gasLimit: 30_000_000,
        }
      ),
      providers,
      setNotification
    );
    setTransactionLoading(false);
  }, []);

  const upgradeText = useMemo(() => {
    return "Upgrade Building";
  }, [builtTile]);
  const buildingEntity = encodeCoordEntity(
    { x: x, y: y },
    BlockType.BuildingKey
  );

  const currLevel = useComponentValue(
    components.Building,
    address
      ? world.entityToIndex.get(buildingEntity as EntityID)
      : singletonIndex
  );

  const buildingId = useComponentValue(
    components.Tile,
    address
      ? world.entityToIndex.get(buildingEntity as EntityID)
      : singletonIndex
  );

  const buildingLevelId = hashKeyEntity(
    buildingId?.toString() as EntityID,
    currLevel?.toString() as EntityID
  );

  const maxLevel = useComponentValue(
    components.MaxLevel,
    world.entityToIndex.get(buildingId?.value as unknown as EntityID)
  );

  const upgradeLocked = useMemo(() => {
    const researchRequirement = getBuildingResearchRequirement(
      buildingLevelId as unknown as EntityID,
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
  }, []);

  const colorCode = useMemo(() => {
    return "bg-yellow-800 hover:bg-yellow-900";
  }, [builtTile]);

  if (!maxLevel || (currLevel?.value as Number) >= (maxLevel.value as Number))
    return;

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
  } else if (!upgradeLocked) {
    return (
      <div className="absolute inset-x-4 bottom-">
        <button
          id={id}
          className={`h-10 ${colorCode} text-sm rounded font-bold w-full`}
          onClick={claimAction}
        >
          {upgradeText}
        </button>
      </div>
    );
  } else {
    return (
      <div className="absolute inset-x-4 bottom-">
        <p className="h-10 text-sm rounded font-bold w-full">{upgradeText}</p>
      </div>
    );
  }
}
