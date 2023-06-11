import { useCallback, useEffect } from "react";
import { useGameStore } from "../../store/GameStore";
import ChooseMunitions from "./ChooseMunitions";
import BuildingContentBox from "../building-menu/BuildingBox";
import { BlockType } from "../../util/constants";
import {
  EntityID,
  getComponentValue,
  getEntitiesWithValue,
} from "@latticexyz/recs";
import { useMud } from "../../context/MudContext";
import { getAttackRadius, isValidWeaponStorage } from "../../util/attack";

function AttackBox() {
  const { components } = useMud();

  const [
    selectedAttackTiles,
    setShowSelectedAttackTiles,
    setStartSelectedAttackTile,
    setEndSelectedAttackTile,
    setSelectedBlock,
    lockedAttackTarget,
    setLockedAttackTarget,
  ] = useGameStore((state) => [
    state.selectedAttackTiles,
    state.setShowSelectedAttackTiles,
    state.setStartSelectedAttackTile,
    state.setEndSelectedAttackTile,
    state.setSelectedBlock,
    state.lockedAttackTarget,
    state.setLockedAttackTarget,
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

  // When a start building is selected, check whether it's a valid weapon storage with isValidWeaponStorage
  // If it is, set the start building
  // If it isn't, display an error message
  useEffect(() => {
    if (selectedAttackTiles.start) {
      const entities = getEntitiesWithValue(
        components.Position,
        selectedAttackTiles.start
      );

      if (entities.size === 0) {
        setStartSelectedAttackTile(null);
      } else if (entities.size === 1) {
        const tileEntityID = entities.values().next().value;
        const currentStartTile = getComponentValue(
          components.Tile,
          tileEntityID
        );

        if (
          !(
            currentStartTile &&
            currentStartTile.value &&
            isValidWeaponStorage(currentStartTile.value as unknown as EntityID)
          )
        ) {
          setStartSelectedAttackTile(null);
        }
      }
    }
  }, [selectedAttackTiles.start]);

  // When an end building is selected, check that there is a building
  useEffect(() => {
    if (selectedAttackTiles.end) {
      const entities = getEntitiesWithValue(
        components.Position,
        selectedAttackTiles.end
      );

      if (entities.size === 0) {
        setEndSelectedAttackTile(null);
        return;
      } else if (entities.size === 1) {
        const tileEntityID = entities.values().next().value;
        const currentEndTile = getComponentValue(components.Tile, tileEntityID);

        // If there is no building, clear the end tile
        if (!(currentEndTile && currentEndTile.value)) {
          setEndSelectedAttackTile(null);
          return;
        }
      }
    }

    // If out of range of the getAttackRadius of the start tile, clear the end tile.
    if (selectedAttackTiles.start && selectedAttackTiles.end) {
      const entities = getEntitiesWithValue(
        components.Position,
        selectedAttackTiles.start
      );
      if (entities.size === 1) {
        const tileEntityID = entities.values().next().value;
        const currentStartTile = getComponentValue(
          components.Tile,
          tileEntityID
        );

        if (currentStartTile) {
          const attackRadius = getAttackRadius(
            currentStartTile.value as unknown as EntityID
          );

          // compare x and y values of start and end
          const xDiff = Math.abs(
            selectedAttackTiles.start.x - selectedAttackTiles.end.x
          );
          const yDiff = Math.abs(
            selectedAttackTiles.start.y - selectedAttackTiles.end.y
          );

          if (xDiff > attackRadius || yDiff > attackRadius) {
            setEndSelectedAttackTile(null);
          } else if (xDiff === 0 && yDiff === 0) {
            setEndSelectedAttackTile(null);
          }
        }
      }
    }
  }, [selectedAttackTiles.end]);

  // can't lock target on a null tile
  useEffect(() => {
    if (lockedAttackTarget && selectedAttackTiles.end === null) {
      setLockedAttackTarget(false);
    }
  }, [lockedAttackTarget, selectedAttackTiles.end]);

  console.log(selectedAttackTiles);
  console.log(lockedAttackTarget);

  return (
    <BuildingContentBox>
      <p className="text-lg font-bold mb-3">Attack Enemy Buildings</p>
      <div className="mr-4">
        {selectedAttackTiles.start === null && (
          <p>
            Click on a{" "}
            <img
              className="inline-block mr-2"
              src="/img/building/projectilelauncher.png"
            />
            <i>Projectile Launcher</i> or a{" "}
            <img
              className="inline-block mr-2"
              src="/img/building/missilelaunchcomplex.gif"
            />
            <i>Missile Launch Complex</i>.
          </p>
        )}
        {selectedAttackTiles.start !== null && !lockedAttackTarget && (
          <>
            <p>Click on a building to lock an attack target.</p>
          </>
        )}
        {selectedAttackTiles.end !== null && lockedAttackTarget && (
          <>
            <p>Select a munition to launch attack.</p>
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
            <p className="inline-block">Abort</p>
          </button>
        </div>
      )}
    </BuildingContentBox>
  );
}

export default AttackBox;
