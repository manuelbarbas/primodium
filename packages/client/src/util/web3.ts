import { EntityID, EntityIndex } from "@latticexyz/recs";
import { Coord, uuid } from "@latticexyz/utils";
import { BigNumber } from "ethers";

import { execute } from "src/network/actions";
import {
  BuildingType,
  LastBuiltAt,
  LastClaimedAt,
  OwnedBy,
} from "src/network/components/chainComponents";
import { BlockNumber, Position } from "src/network/components/clientComponents";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";

// Component overrides
export const addTileOverride = (
  pos: Coord,
  blockType: EntityID,
  player: EntityID
) => {
  const tempPositionId = uuid();
  const blockNumber = BlockNumber.get(undefined, { value: 0 }).value;
  const tempEntityIndex = 34567543456 as EntityIndex;
  Position.addOverride(tempPositionId, {
    entity: tempEntityIndex,
    value: pos,
  });
  BuildingType.addOverride(tempPositionId, {
    entity: tempEntityIndex,
    value: { value: blockType },
  });
  OwnedBy.addOverride(tempPositionId, {
    entity: tempEntityIndex,
    value: { value: player },
  });
  LastBuiltAt.addOverride(tempPositionId, {
    entity: tempEntityIndex,
    value: { value: blockNumber },
  });
  LastClaimedAt.addOverride(tempPositionId, {
    entity: tempEntityIndex,
    value: { value: blockNumber },
  });

  return { tempPositionId, tempEntityIndex };
};

export const removeTileOverride = (tempPositionId: string) => {
  Position.removeOverride(tempPositionId);
  BuildingType.removeOverride(tempPositionId);
  OwnedBy.removeOverride(tempPositionId);
  LastBuiltAt.removeOverride(tempPositionId);
  LastClaimedAt.removeOverride(tempPositionId);
};

export const buildBuilding = async (
  pos: Coord,
  blockType: EntityID,
  address: EntityID,
  network: Network
) => {
  const { providers, systems } = network;
  const { tempPositionId } = addTileOverride(pos, blockType, address);
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  try {
    setTransactionLoading(true);
    console.log("building ", pos);
    await execute(
      systems["system.Build"].executeTyped(BigNumber.from(blockType), pos, {
        gasLimit: 5_000_000,
      }),
      providers,
      setNotification
    );
  } finally {
    removeTileOverride(tempPositionId);
  }

  setTransactionLoading(false);
};

export const buildPath = async (start: Coord, end: Coord, network: Network) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  setTransactionLoading(true);
  console.log("building path", start, end);
  await execute(
    systems["system.BuildPath"].executeTyped(start, end, {
      gasLimit: 1_500_000,
    }),
    providers,
    setNotification
  );
  setTransactionLoading(false);
};

export const demolishBuilding = async (pos: Coord, network: Network) => {
  console.log("demolishing", pos);
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  setTransactionLoading(true);
  await execute(
    systems["system.Destroy"].executeTyped(pos, {
      gasLimit: 3_000_000,
    }),
    providers,
    setNotification
  );
  setTransactionLoading(false);
};

export const demolishPath = async (pos: Coord, network: Network) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  setTransactionLoading(true);
  await execute(
    systems["system.DestroyPath"].executeTyped(pos, {
      gasLimit: 2_000_000,
    }),
    providers,
    setNotification
  );
  setTransactionLoading(false);
};

export const attackBuilding = async (
  origin: Coord,
  target: Coord,
  weaponKey: EntityID,
  network: Network
) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  setTransactionLoading(true);
  await execute(
    systems["system.Attack"].executeTyped(origin, target, weaponKey, {
      gasLimit: 1_000_000,
    }),
    providers,
    setNotification
  );
  setTransactionLoading(false);
};

export const researchBuilding = async (
  researchId: EntityID,
  network: Network
) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  setTransactionLoading(true);
  await execute(
    systems["system.Research"].executeTyped(BigNumber.from(researchId), {
      gasLimit: 1_000_000,
    }),
    providers,
    setNotification
  );
  setTransactionLoading(false);
};

export const debugAcquireResources = async (
  resourceId: EntityID,
  amount: number,
  network: Network
) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  setTransactionLoading(true);
  await execute(
    systems["system.DebugAcquireResources"].executeTyped(resourceId, amount, {
      gasLimit: 1_000_000,
    }),
    providers,
    setNotification
  );
  setTransactionLoading(false);
};

export const debugAcquireResourcesBasedOnRequirement = async (
  entity: EntityID,
  network: Network
) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  setTransactionLoading(true);
  await execute(
    systems["system.DebugAcquireResourcesBasedOnRequirement"].executeTyped(
      entity,
      {
        gasLimit: 1_000_000,
      }
    ),
    providers,
    setNotification
  );
  setTransactionLoading(false);
};

export const debugAcquireStorageForAllResources = async (network: Network) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  setTransactionLoading(true);
  await execute(
    systems["system.DebugAcquireStorageForAllResources"].executeTyped({
      gasLimit: 1_000_000,
    }),
    providers,
    setNotification
  );
  setTransactionLoading(false);
};

export const debugRemoveBuildLimit = async (network: Network) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  setTransactionLoading(true);
  await execute(
    systems["system.DebugRemoveBuildLimit"].executeTyped({
      gasLimit: 1_000_000,
    }),
    providers,
    setNotification
  );
  setTransactionLoading(false);
};

export const debugRemoveUpgradeRequirements = async (
  buildingId: EntityID,
  network: Network
) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  setTransactionLoading(true);
  await execute(
    systems["system.DebugRemoveUpgradeRequirements"].executeTyped(buildingId, {
      gasLimit: 1_000_000,
    }),
    providers,
    setNotification
  );
  setTransactionLoading(false);
};

export const debugRemoveBuildingRequirements = async (
  buildingId: EntityID,
  network: Network
) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  setTransactionLoading(true);
  await execute(
    systems["system.DebugRemoveBuildingRequirements"].executeTyped(buildingId, {
      gasLimit: 1_000_000,
    }),
    providers,
    setNotification
  );
  setTransactionLoading(false);
};

export const debugIgnoreBuildLimitForBuilding = async (
  buildingId: EntityID,
  network: Network
) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  setTransactionLoading(true);
  await execute(
    systems["system.DebugIgnoreBuildLimitForBuilding"].executeTyped(
      buildingId,
      {
        gasLimit: 1_000_000,
      }
    ),
    providers,
    setNotification
  );
  setTransactionLoading(false);
};
