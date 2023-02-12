import { useCallback } from "react";

import { EntityID } from "@latticexyz/recs";
import { BigNumber } from "ethers";

import MinerButton from "./building-icons/Miner";
import ConveyerButton from "./building-icons/Conveyer";

import { MudComponentTileProps } from "../util/types";
import { BlockType, DisplayTile } from "../util/constants";
import DestroyTileButton from "./DestroyTileButton";

function BuildingBox({ systems, selectedTile }: MudComponentTileProps) {
  // Place action
  const buildTile = useCallback(
    ({ x, y }: DisplayTile, blockType: EntityID) => {
      systems["system.Build"].executeTyped(
        BigNumber.from(blockType),
        {
          x: x,
          y: y,
        },
        {
          gasLimit: 1_000_000,
        }
      );
    },
    []
  );

  const destroyTile = useCallback(({ x, y }: DisplayTile) => {
    systems["system.Destroy"].executeTyped(
      {
        x: x,
        y: y,
      },
      {
        gasLimit: 1_000_000,
      }
    );
  }, []);

  // Helpers
  const buildMinerHelper = useCallback(() => {
    buildTile(selectedTile, BlockType.LithiumMiner);
  }, []);

  const buildConveyerHelper = useCallback(() => {
    buildTile(selectedTile, BlockType.Conveyer);
  }, []);

  const destroyTileHelper = useCallback(() => {
    destroyTile(selectedTile);
  }, []);

  function BuildingPage() {
    return (
      <div className="grid grid-cols-5 gap-1.5 h-36 overflow-y-scroll scrollbar">
        <MinerButton action={buildMinerHelper} />
        <ConveyerButton action={buildConveyerHelper} />
      </div>
    );
  }

  return (
    <div className="z-[1000] fixed bottom-4 left-4 h-72 w-96 flex flex-col bg-gray-700 text-white drop-shadow-xl font-mono rounded">
      <div className=" mt-4 ml-5 flex flex-col h-72">
        <p className="text-lg font-bold mb-3">Construct Buildings</p>
        <BuildingPage />
        <DestroyTileButton action={destroyTileHelper} />
      </div>
    </div>
  );
}

export default BuildingBox;
