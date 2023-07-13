import { useCallback } from "react";
import { useEntityQuery } from "@latticexyz/react";
import { EntityID, Has, HasValue } from "@latticexyz/recs";

import { useMud } from "../../context/MudContext";
import { execute } from "../../network/actions";
import { useGameStore } from "../../store/GameStore";
import { BlockType } from "../../util/constants";

import MunitionsButton from "./MunitionsButton";
import { useNotificationStore } from "../../store/NotificationStore";
import { primodium } from "@game/api";

function ChooseMunitions() {
  // executeTyped(Coord memory coord, Coord memory targetCoord, uint256 weaponKey)
  const network = useMud();
  const { components, systems, providers } = network;
  const selectedAttackTiles = primodium.hooks.useSelectedAttack(network);
  const [setTransactionLoading] = useGameStore((state) => [
    state.setTransactionLoading,
  ]);
  const [setNotification] = useNotificationStore((state) => [
    state.setNotification,
  ]);

  const attackAction = useCallback(
    async (weaponKey: EntityID) => {
      if (selectedAttackTiles.origin && selectedAttackTiles.target) {
        setTransactionLoading(true);
        await execute(
          systems["system.Attack"].executeTyped(
            selectedAttackTiles.origin,
            selectedAttackTiles.target,
            weaponKey,
            {
              gasLimit: 1_000_000,
            }
          ),
          providers,
          setNotification
        );
        setTransactionLoading(false);
      }
    },
    [selectedAttackTiles]
  );

  // Fetch the entityIndex of the end building being selected
  const tilesAtPosition = useEntityQuery(
    [
      Has(components.BuildingType),
      HasValue(components.Position, {
        x: selectedAttackTiles.origin ? selectedAttackTiles.origin.x : 0,
        y: selectedAttackTiles.origin ? selectedAttackTiles.origin.y : 0,
      }),
    ],
    { updateOnValueChange: true }
  );

  if (!selectedAttackTiles.origin || tilesAtPosition.length === 0) {
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
