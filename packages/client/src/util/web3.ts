import { EntityID, EntityIndex } from "@latticexyz/recs";
import { Coord, uuid } from "@latticexyz/utils";
import { BigNumber } from "ethers";
import { randomBytes } from "ethers/lib/utils";

import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";
import { Network } from "src/network/layer";
import { execute } from "src/network/actions";

// Component overrides
export const addTileOverride = (
  pos: Coord,
  blockType: EntityID,
  address: string,
  network: Network
) => {
  const { components, providers } = network;
  const tempPositionId = uuid();
  const tempEntityIndex = BigNumber.from(
    randomBytes(32)
  ) as unknown as EntityIndex;

  components.Position.addOverride(tempPositionId, {
    entity: tempEntityIndex,
    value: pos,
  });
  components.Tile.addOverride(tempPositionId, {
    entity: tempEntityIndex,
    value: { value: blockType as unknown as number },
  });
  components.OwnedBy.addOverride(tempPositionId, {
    entity: tempEntityIndex,
    value: { value: address as unknown as number },
  });
  components.LastBuiltAt.addOverride(tempPositionId, {
    entity: tempEntityIndex,
    value: { value: providers.get().ws?.blockNumber || 0 },
  });
  components.LastClaimedAt.addOverride(tempPositionId, {
    entity: tempEntityIndex,
    value: { value: providers.get().ws?.blockNumber || 0 },
  });

  return { tempPositionId, tempEntityIndex };
};

export const removeTileOverride = (
  tempPositionId: string,
  network: Network
) => {
  const { components } = network;

  components.Position.removeOverride(tempPositionId);
  components.Tile.removeOverride(tempPositionId);
  components.OwnedBy.removeOverride(tempPositionId);
  components.LastBuiltAt.removeOverride(tempPositionId);
  components.LastClaimedAt.removeOverride(tempPositionId);
};

export const buildBuilding = async (
  pos: Coord,
  blockType: EntityID,
  address: string,
  network: Network
) => {
  const { providers, systems } = network;
  const { tempPositionId } = addTileOverride(pos, blockType, address, network);
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  try {
    setTransactionLoading(true);
    await execute(
      systems["system.Build"].executeTyped(BigNumber.from(blockType), pos, {
        gasLimit: 1_800_000,
      }),
      providers,
      setNotification
    );
  } finally {
    removeTileOverride(tempPositionId, network);
  }

  setTransactionLoading(false);
};

export const buildPath = async (start: Coord, end: Coord, network: Network) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  setTransactionLoading(true);
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
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  setTransactionLoading(true);
  await execute(
    systems["system.Destroy"].executeTyped(pos, {
      gasLimit: 2_000_000,
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
