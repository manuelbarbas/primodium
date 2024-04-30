import { Button } from "@/components/core/Button";
import { Modal } from "@/components/core/Modal";
import { hydrateBattleReports } from "@/network/sync/indexer";
import { useEntityQuery } from "@latticexyz/react";
import { Has, HasValue } from "@latticexyz/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { useEffect } from "react";
import { useMud } from "src/hooks";
import { components } from "src/network/components";

export const YouDied = () => {
  const mud = useMud();
  const {
    playerAccount: { entity: playerEntity },
  } = mud;
  const playerSpawned = components.Spawned.use(playerEntity)?.value;
  const query = [HasValue(components.OwnedBy, { value: playerEntity }), Has(components.Asteroid)];
  const asteroids = useEntityQuery(query);

  const battles = components.Battle.useAllPlayerBattles(playerEntity).sort((a, b) =>
    Number(components.Battle.get(b)?.timestamp! - components.Battle.get(a)?.timestamp!)
  );

  useEffect(() => {
    hydrateBattleReports(playerEntity, mud);
  }, [playerEntity, mud]);

  return (
    <Modal title="You Died" startOpen={playerSpawned && asteroids.length === 0}>
      <Modal.Content className="w-[30rem]" noClose>
        <div className="text-center flex flex-col justify-center items-center gap-6 p-6">
          <h1 className="font-bold text-error">Ashes to ashes, dust to dust</h1>
          <p className="text-xl">All your asteroids have been captured. Will you reclaim your glory?</p>
          {battles.length > 0 && (
            <Button variant="neutral" size="content">
              <img src={InterfaceIcons.Reports} alt="reports" className="w-8" />
              <p className="text-xs">View Final Battle Report</p>
            </Button>
          )}
          <Button variant="secondary" size="md" className="w-full">
            Respawn
          </Button>
        </div>
      </Modal.Content>
    </Modal>
  );
};
