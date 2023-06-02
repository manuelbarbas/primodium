import { useCallback, useEffect } from "react";
import { useGameStore } from "../../store/GameStore";
import ChooseMunitions from "./ChooseMunitions";
import BuildingContentBox from "../building-menu/BuildingBox";
import { BlockType } from "../../util/constants";

function AttackBox() {
  // TODO: pass in previous switch state function and close menu!!!1
  const [
    selectedAttackTiles,
    setShowSelectedAttackTiles,
    setStartSelectedAttackTile,
    setEndSelectedAttackTile,
    setSelectedBlock,
    lockedAttackTarget,
  ] = useGameStore((state) => [
    state.selectedAttackTiles,
    state.setShowSelectedAttackTiles,
    state.setStartSelectedAttackTile,
    state.setEndSelectedAttackTile,
    state.setSelectedBlock,
    state.lockedAttackTarget,
  ]);

  useEffect(() => {
    // show selected path tiles on mount
    setShowSelectedAttackTiles(true);
    setSelectedBlock(BlockType.SelectAttack);
  }, []);

  const clearPath = useCallback(() => {
    setStartSelectedAttackTile(null);
    setEndSelectedAttackTile(null);
  }, [setStartSelectedAttackTile, setEndSelectedAttackTile]);

  return (
    <BuildingContentBox>
      <p className="text-lg font-bold mb-3">Attack Enemy Buildings</p>
      <div className="mr-4">
        {selectedAttackTiles.start === null && (
          <p>
            Click on a <b>missile silo</b>.
          </p>
        )}
        {selectedAttackTiles.start !== null && !lockedAttackTarget && (
          <>
            <p>Click on a building to lock an attack target.</p>
          </>
        )}
        {selectedAttackTiles.end !== null && lockedAttackTarget && (
          <>
            <p>Select a munition to attack.</p>
            <ChooseMunitions />
          </>
        )}
      </div>

      {selectedAttackTiles.start !== null && (
        <div className="absolute bottom-4 right-4 space-x-2">
          <button
            onClick={clearPath}
            className="text-center h-10 w-36 bg-red-600 hover:bg-red-700 font-bold rounded text-sm"
          >
            <p className="inline-block">Clear</p>
          </button>
        </div>
      )}
    </BuildingContentBox>
  );

  // return (
  //   <div>
  //     {/* 1. If the user doesn't have a launcher tile selected, display the following: */}
  //     {/* <div>Select a launcher to open the attack menu.</div> */}
  //     {/* 2. Show the following screen if the user has the launcher tile selected: */}
  //     <AttackActivated />
  //     {/* 3. The following shows up after users click "next" in the AttackActivated screen */}
  //     <ChooseMunitions />
  //   </div>
  // );
}

export default AttackBox;
