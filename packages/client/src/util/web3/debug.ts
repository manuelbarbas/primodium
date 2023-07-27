import { EntityID } from "@latticexyz/recs";
import { execute } from "src/network/actions";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";

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
