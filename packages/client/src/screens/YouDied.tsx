import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { spawn } from "@/network/setup/contractCalls/spawn";
import { hydrateBattleReports } from "@/network/sync/indexer";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { useEffect } from "react";
import { useMud } from "src/hooks";
import { components } from "src/network/components";

export const YouDied = () => {
  const mud = useMud();
  const {
    playerAccount: { entity: playerEntity },
  } = mud;
  const battles = components.Battle.useAllPlayerBattles(playerEntity).sort((a, b) =>
    Number(components.Battle.get(b)?.timestamp! - components.Battle.get(a)?.timestamp!)
  );

  useEffect(() => {
    hydrateBattleReports(playerEntity, mud);
  }, [playerEntity, mud]);

  return (
    <div className="w-screen h-screen absolute top-0 left-0 flex justify-center items-center">
      <div key="bg" className="fixed w-full h-full bg-black" />
      <div key="star" className="fixed w-full h-full star-background opacity-30" />

      <div>
        <Card className="w-[30rem] text-center">
          <div className="flex flex-col gap-6">
            <h1 className="font-bold text-error">Ashes to ashes, dust to dust</h1>
            <p className="text-xl">All your asteroids have been captured. Will you reclaim your glory?</p>
            {battles.length > 0 && (
              <Button variant="neutral" size="content">
                <img src={InterfaceIcons.Reports} alt="reports" className="w-8" />
                <p className="text-xs">View Final Battle Report</p>
              </Button>
            )}
            <TransactionQueueMask queueItemId={singletonEntity}>
              <Button variant="secondary" size="md" onClick={() => spawn(mud)}>
                Respawn
              </Button>
            </TransactionQueueMask>
          </div>
        </Card>
      </div>
    </div>
  );
};
