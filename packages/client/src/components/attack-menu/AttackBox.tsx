import { primodium } from "@game/api";
import { removeComponent, setComponent } from "@latticexyz/recs";
import { useCallback, useEffect } from "react";
import { singletonIndex } from "src/network/world";
import { useMud } from "../../context/MudContext";
import { Action } from "../../util/constants";
import BuildingContentBox from "../building-menu/BuildingBox";
import ChooseMunitions from "./ChooseMunitions";

function AttackBox() {
  const network = useMud();

  const {
    offChainComponents: { SelectedAction },
  } = network;
  const selectedAttackTiles = primodium.hooks.useSelectedAttack(network);

  useEffect(() => {
    // show selected path tiles on mount

    setComponent(SelectedAction, singletonIndex, {
      value: Action.SelectAttack,
    });
  }, []);

  const clearPath = useCallback(() => {
    primodium.components.selectedAttack(network).remove();
    removeComponent(SelectedAction, singletonIndex);
  }, [network]);

  return (
    <BuildingContentBox>
      <p className="text-lg font-bold mb-3">Attack Enemy Buildings</p>
      <div className="mr-4">
        {!selectedAttackTiles.origin && (
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
        {selectedAttackTiles.origin && !selectedAttackTiles.target && (
          <>
            <p>Click on a building to lock an attack target.</p>
          </>
        )}
        {selectedAttackTiles.target && (
          <>
            <p>Select a munition to launch attack.</p>
            <ChooseMunitions />
          </>
        )}
      </div>

      {selectedAttackTiles.origin && (
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
