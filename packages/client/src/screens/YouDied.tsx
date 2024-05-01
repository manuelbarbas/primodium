import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { BattleReports } from "@/components/hud/widgets/battle-reports/BattleReports";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { spawn } from "@/network/setup/contractCalls/spawn";
import { hydrateBattleReports } from "@/network/sync/indexer";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useMud } from "src/hooks";
import { components } from "src/network/components";

export const YouDied = () => {
  const mud = useMud();
  const [showBattles, setShowBattles] = useState(false);
  const {
    playerAccount: { entity: playerEntity },
  } = mud;
  const battles = components.Battle.useAllPlayerBattles(playerEntity).sort((a, b) =>
    Number(components.Battle.get(b)?.timestamp! - components.Battle.get(a)?.timestamp!)
  );

  useEffect(() => {
    hydrateBattleReports(playerEntity, mud);
  }, [playerEntity, mud]);
  const BaseContent = () => (
    <div className="flex flex-col gap-6 px-8">
      <h1 className="font-bold text-error">Ashes to ashes, dust to dust</h1>
      <p className="text-xl">All your asteroids have been captured. Will you reclaim your glory?</p>
      {battles.length > 0 && !showBattles && (
        <div className="w-full grid place-items-center">
          <Button variant="neutral" size="content" onClick={() => setShowBattles(true)} className="!w-56">
            <img src={InterfaceIcons.Reports} alt="reports" className="w-8" />
            <p className="text-xs">View Battle Reports</p>
          </Button>
        </div>
      )}
      {showBattles && <BattleReports />}
      <div className="w-full grid place-items-center">
        <TransactionQueueMask queueItemId={singletonEntity}>
          <Button variant="secondary" size="md" onClick={() => spawn(mud)} className="!w-56">
            Respawn
          </Button>
        </TransactionQueueMask>
      </div>
    </div>
  );

  const BattleContent = () => (
    <div className="flex justify-between h-full items-center flex-col">
      <BattleReports />
      <Button variant="secondary" size="sm" className="w-fit" onClick={() => setShowBattles(false)}>
        Back
      </Button>
    </div>
  );

  return (
    <AnimatePresence key="animate-3">
      <div className="w-screen h-screen absolute top-0 left-0 flex justify-center items-center">
        <div key="bg" className="fixed w-full h-full bg-black" />
        <div key="star" className="fixed w-full h-full star-background opacity-30" />

        <motion.div
          key="play"
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0, transition: { delay: 0.25, duration: 0.5 } }}
        >
          <Card className="w-[40rem] h-[30rem]">
            <div className="w-full h-full flex text-center justify-center items-center">
              {showBattles ? <BattleContent /> : <BaseContent />}
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
