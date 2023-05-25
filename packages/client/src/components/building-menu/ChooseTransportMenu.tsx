import { useCallback, useEffect } from "react";
import { useMud } from "../../context/MudContext";
// import { useSelectedTile } from "../../context/SelectedTileContext";
import PathActionIconButton from "./building-icons/PathActionIconButton";
import BuildingIconButton from "./building-icons/BuildingIconButton";
import { BlockType } from "../../util/constants";
import { execute } from "../../network/actions";
// import { useTransactionLoading } from "../../context/TransactionLoadingContext";
import BuildingContentBox from "./BuildingBox";
import { useGameStore } from "../../store/GameStore";

function ChooseTransportMenu({
  title,
  setMenuOpenIndex,
}: {
  title: string;
  setMenuOpenIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { systems, providers } = useMud();

  // Set start and end paths for conveyors
  // const {
  //   // selectedTile,
  //   selectedStartPathTile,
  //   selectedEndPathTile,
  //   setSelectedStartPathTile,
  //   setSelectedEndPathTile,
  //   // setShowSelectedPathTiles,
  // } = useSelectedTile();

  const [
    setTransactionLoading,
    selectedTile,
    selectedPathTiles,
    setShowSelectedPathTiles,
    setStartSelectedPathTile,
    setEndSelectedPathTile,
    selectedBlock,
    setSelectedBlock,
  ] = useGameStore((state) => [
    state.setTransactionLoading,
    state.selectedTile,
    state.selectedPathTiles,
    state.setShowSelectedPathTiles,
    state.setStartSelectedPathTile,
    state.setEndSelectedPathTile,
    state.selectedBlock,
    state.setSelectedBlock,
  ]);

  useEffect(() => {
    // show selected path tiles on mount
    setShowSelectedPathTiles(true);
  }, []);

  const closeMenuHelper = useCallback(() => {
    setMenuOpenIndex(-1);
    setShowSelectedPathTiles(false);
    setSelectedBlock(null);
  }, []);

  const startPath = useCallback(() => {
    // setSelectedStartPathTile(selectedTile);
    setStartSelectedPathTile(selectedTile);
  }, [selectedTile]);

  const endPath = useCallback(() => {
    // setSelectedEndPathTile(selectedTile);
    setEndSelectedPathTile(selectedTile);
  }, [selectedTile]);

  // const { setTransactionLoading } = useTransactionLoading();

  // Select tile to end path, executeTyped
  const createPath = useCallback(async () => {
    if (selectedPathTiles.start !== null && selectedPathTiles.end !== null) {
      setTransactionLoading(true);
      await execute(
        systems["system.BuildPath"].executeTyped(
          selectedPathTiles.start,
          selectedPathTiles.end,
          {
            gasLimit: 500_000,
          }
        ),
        providers
      );
      setTransactionLoading(false);
    }
  }, [selectedPathTiles]);

  // delete path
  const destroyPath = useCallback(async () => {
    if (selectedPathTiles.start !== null && selectedPathTiles.end !== null) {
      setTransactionLoading(true);
      await execute(
        systems["system.DestroyPath"].executeTyped(selectedPathTiles.start, {
          gasLimit: 500_000,
        }),
        providers
      );
      setTransactionLoading(false);
    }
  }, [selectedPathTiles]);

  const clearPath = useCallback(() => {
    setStartSelectedPathTile(null);
    setEndSelectedPathTile(null);
  }, [setStartSelectedPathTile, setEndSelectedPathTile]);

  return (
    <BuildingContentBox>
      <p className="text-lg font-bold mb-3">{title}</p>
      <div className="grid grid-cols-4 h-40 gap-y-3 overflow-y-scroll scrollbar">
        {(selectedBlock === BlockType.Conveyor ||
          (selectedPathTiles.start !== null &&
            selectedPathTiles.end !== null)) && (
          <>
            {/* <PathActionIconButton
              backgroundColor="#dd9871"
              text="Start"
              action={startPath}
            />
            <PathActionIconButton
              backgroundColor="#77c899"
              text="End"
              action={endPath}
            /> */}
            <PathActionIconButton
              backgroundColor="#479dd6"
              text="Create"
              action={createPath}
            />
            <PathActionIconButton
              backgroundColor="#dd9871"
              text="Clear"
              action={clearPath}
            />
          </>
        )}
        {selectedBlock !== BlockType.Conveyor &&
          selectedPathTiles.start === null && (
            <>
              <BuildingIconButton label="Node" blockType={BlockType.Node} />
              <BuildingIconButton
                label="Conveyor"
                blockType={BlockType.Conveyor}
              />
              <PathActionIconButton
                backgroundColor="#ad6b85"
                text="Destroy"
                action={destroyPath}
              />
            </>
          )}
      </div>
      <button
        onClick={closeMenuHelper}
        className="absolute bottom-4 text-center right-4 h-10 w-36 bg-teal-600 hover:bg-teal-700 font-bold rounded text-sm"
      >
        <p className="inline-block">Other Buildings</p>
      </button>
    </BuildingContentBox>
  );
}

export default ChooseTransportMenu;
