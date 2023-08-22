import { EntityID } from "@latticexyz/recs";
import { execute } from "src/network/actions";
import { Network } from "src/network/layer";
import { useGameStore } from "src/store/GameStore";
import { useNotificationStore } from "src/store/NotificationStore";
import { ActiveAsteroid } from "src/network/components/clientComponents";
import { ArrivalUnitStruct } from "../../../../contracts/types/ethers-contracts/SendUnitsSystem";
import { Position } from "src/network/components/chainComponents";

export const invadeAsteroid = async (
  destinationAsteroid: EntityID,
  arrivalUnits: ArrivalUnitStruct[],
  network: Network
) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  // todo: find a cleaner way to extract this value in all web3 functions
  const originAsteroid = ActiveAsteroid.get()?.value;
  if (!originAsteroid) return;

  const to = Position.get(destinationAsteroid)?.parent;

  if (!to) return;

  setTransactionLoading(true);

  await execute(
    systems["system.SendUnits"].executeTyped(
      arrivalUnits,
      0,
      originAsteroid,
      destinationAsteroid,
      to,
      {
        gasLimit: 8_000_000,
      }
    ),
    providers,
    setNotification
  );

  setTransactionLoading(false);
};

export const reinforceAsteroid = async (
  destinationAsteroid: EntityID,
  arrivalUnits: ArrivalUnitStruct[],
  network: Network
) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  const setNotification = useNotificationStore.getState().setNotification;

  // todo: find a cleaner way to extract this value in all web3 functions
  const originAsteroid = ActiveAsteroid.get()?.value;
  if (!originAsteroid) return;

  const to = Position.get(destinationAsteroid)?.parent;

  if (!to) return;

  setTransactionLoading(true);

  await execute(
    systems["system.SendUnits"].executeTyped(
      arrivalUnits,
      1,
      originAsteroid,
      destinationAsteroid,
      to,
      {
        gasLimit: 8_000_000,
      }
    ),
    providers,
    setNotification
  );

  setTransactionLoading(false);
};
