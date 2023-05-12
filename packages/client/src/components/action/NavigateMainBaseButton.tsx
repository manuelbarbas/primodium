import { useCallback } from "react";
import { EntityID } from "@latticexyz/recs";
import { useComponentValue } from "@latticexyz/react";
import { useMud } from "../../context/MudContext";
import { useAccount } from "../../hooks/useAccount";
import { useSelectedTile } from "../../context/SelectedTileContext";
import { useTransactionLoading } from "../../context/TransactionLoadingContext";
import { execute } from "../../network/actions";
import { BigNumber } from "ethers";
import { BlockType } from "../../util/constants";

export default function NavigateMainBaseButton() {
  const { world, components, singletonIndex } = useMud();
  const { address } = useAccount();

  const { setSelectedTile, setNavigateToTile } = useSelectedTile();

  // if provide an entityId, use as owner
  // else try to use wallet, otherwise use default index
  const resourceKey = address
    ? world.entityToIndex.get(address.toString().toLowerCase() as EntityID)!
    : singletonIndex;

  // fetch the main base of the user based on address
  const mainBaseCoord = useComponentValue(
    components.MainBaseInitialized,
    resourceKey
  );

  // Navigate to Main Base if it exists for this wallet
  const navigateMainBase = useCallback(() => {
    if (mainBaseCoord) {
      setSelectedTile(mainBaseCoord);
      setNavigateToTile(true);
    }
  }, [mainBaseCoord]);

  // Otherwise build a main base
  const { systems, providers } = useMud();
  const { selectedTile } = useSelectedTile();
  const { setTransactionLoading } = useTransactionLoading();
  const buildMainBase = useCallback(async () => {
    setTransactionLoading(true);
    await execute(
      systems["system.Build"].executeTyped(
        BigNumber.from(BlockType.MainBase),
        selectedTile,
        {
          gasLimit: 1_500_000,
        }
      ),
      providers
    );
    setTransactionLoading(false);
  }, [selectedTile]);

  if (mainBaseCoord) {
    return (
      <button
        onClick={navigateMainBase}
        className="absolute inset-x-4 bottom-4 h-10 bg-orange-600 hover:bg-amber-700 text-sm rounded font-bold"
      >
        Visit Base ({mainBaseCoord.x},{mainBaseCoord.y})
      </button>
    );
  } else {
    return (
      <button
        onClick={buildMainBase}
        className="absolute inset-x-4 bottom-4 h-10 bg-orange-600 hover:bg-amber-700 text-sm rounded font-bold"
      >
        Build a Main Base
      </button>
    );
  }
}
