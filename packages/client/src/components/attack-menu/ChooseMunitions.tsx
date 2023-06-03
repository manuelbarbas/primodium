import { useCallback } from "react";
import { useEntityQuery } from "@latticexyz/react";
import { EntityID, Has, HasValue } from "@latticexyz/recs";

import { useMud } from "../../context/MudContext";
import { execute } from "../../network/actions";
import { useGameStore } from "../../store/GameStore";
import { BlockType } from "../../util/constants";

import MunitionsButton from "./MunitionsButton";

function ChooseMunitions() {
  // executeTyped(Coord memory coord, Coord memory targetCoord, uint256 weaponKey)

  const { components, systems, providers } = useMud();
  const [selectedAttackTiles, setTransactionLoading] = useGameStore((state) => [
    state.selectedAttackTiles,
    state.setTransactionLoading,
  ]);

  const attackAction = useCallback(
    async (weaponKey: EntityID) => {
      if (
        selectedAttackTiles.start !== null &&
        selectedAttackTiles.end !== null
      ) {
        setTransactionLoading(true);
        await execute(
          systems["system.Attack"].executeTyped(
            selectedAttackTiles.start,
            selectedAttackTiles.end,
            weaponKey,
            {
              gasLimit: 1_000_000,
            }
          ),
          providers
        );
        setTransactionLoading(false);
      }
    },
    [selectedAttackTiles]
  );

  // Fetch the entityIndex of the end building being selected
  const tilesAtPosition = useEntityQuery(
    [
      Has(components.Tile),
      HasValue(components.Position, {
        x: selectedAttackTiles.start ? selectedAttackTiles.start.x : 0,
        y: selectedAttackTiles.start ? selectedAttackTiles.start.y : 0,
      }),
    ],
    { updateOnValueChange: true }
  );

  if (!selectedAttackTiles.start || tilesAtPosition.length === 0) {
    return <></>;
  }

  return (
    <div className="pr-4 mt-3">
      <MunitionsButton
        resourceId={BlockType.KineticMissileCrafted}
        entityIndex={tilesAtPosition[0]}
        attackAction={attackAction}
      />
      <MunitionsButton
        resourceId={BlockType.PenetratingMissileCrafted}
        entityIndex={tilesAtPosition[0]}
        attackAction={attackAction}
      />
      <MunitionsButton
        resourceId={BlockType.ThermobaricMissileCrafted}
        entityIndex={tilesAtPosition[0]}
        attackAction={attackAction}
      />
      {import.meta.env.VITE_DEV === "true" && (
        <MunitionsButton
          resourceId={BlockType.BulletCrafted}
          entityIndex={tilesAtPosition[0]}
          attackAction={attackAction}
        />
      )}
    </div>
  );
}

export default ChooseMunitions;
