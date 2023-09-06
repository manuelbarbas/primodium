import { EntityID } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { BigNumber } from "ethers";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { BuildingType, Level } from "src/network/components/chainComponents";
import { SelectedBuilding } from "src/network/components/clientComponents";
import { Network } from "src/network/setupNetworkOld";
import { useGameStore } from "src/store/GameStore";
import { parseReceipt } from "../analytics/parseReceipt";
import { BlockIdToKey } from "../constants";

export const demolishBuilding = async (coord: Coord, network: Network) => {
  const { providers, systems } = network;
  const setTransactionLoading = useGameStore.getState().setTransactionLoading;
  setTransactionLoading(true);

  const building = SelectedBuilding.get()?.value;
  const buildingType = BuildingType.get(building, {
    value: "-1" as EntityID,
  })?.value;
  const currLevel = Level.get(building)?.value || 0;

  const activeAsteroid = HomeAsteroid.get()?.value;
  if (!activeAsteroid) return;

  const position = { ...coord, parent: activeAsteroid };

  const receipt = await execute(
    systems["system.Destroy"].executeTyped(position, {
      gasLimit: 8_000_000,
    }),
    providers
  );

  ampli.systemDestroy({
    asteroidCoord: BigNumber.from(activeAsteroid).toString(),
    buildingType: BlockIdToKey[buildingType],
    coord: [coord.x, coord.y],
    currLevel: currLevel,
    ...parseReceipt(receipt),
  });

  setTransactionLoading(false);
};
