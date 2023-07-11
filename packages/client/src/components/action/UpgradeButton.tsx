import { useComponentValue } from "src/hooks/useComponentValue";
import { EntityID, EntityIndex, getComponentValue } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { BlockType } from "src/util/constants";
import {
  encodeCoordEntity,
  hashKeyEntity,
  hashKeyEntityAndTrim,
} from "src/util/encode";
import { useMud } from "../../context/MudContext";
import { useAccount } from "../../hooks/useAccount";
import { execute } from "../../network/actions";
import { useGameStore } from "../../store/GameStore";
import { useNotificationStore } from "../../store/NotificationStore";
import { getBuildingResearchRequirement } from "../../util/research";
import Spinner from "../Spinner";

export default function UpgradeButton({
  id,
  coords,
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

  const buildingEntity = encodeCoordEntity(coords, BlockType.BuildingKey);
  const buildingId = world.entityToIndex.get(buildingEntity);

  const currLevel = useComponentValue(
    components.BuildingLevel,
    buildingId
  )?.value;

  const buildingType = useComponentValue(components.Tile, buildingId, {
    value: 0,
  }).value as EntityIndex;

  if (!buildingId || !buildingType || currLevel == undefined) return null;

  const maxLevel = getComponentValue(components.MaxLevel, buildingType);

  const buildingTypeLevel = hashKeyEntity(buildingType, currLevel);

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

  const upgradeText = "Upgrade Building";

  const colorCode = "bg-yellow-800 hover:bg-yellow-900";

  if (!maxLevel || currLevel >= (maxLevel?.value || 0)) return;

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
