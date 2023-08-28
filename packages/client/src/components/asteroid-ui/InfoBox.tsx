import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { EntityID } from "@latticexyz/recs";
import { BlockType } from "src/util/constants";
import { hashAndTrimKeyCoord } from "src/util/encode";
import { useMainBaseCoord } from "src/hooks/useMainBase";
import { useGameStore } from "src/store/GameStore";
import { GameButton } from "../shared/GameButton";
import { IoFlaskSharp, IoSettings } from "react-icons/io5";
import Modal from "../shared/Modal";
import ResearchPage from "./research-menu/ResearchPage";
import { MainMenu } from "./MainMenu";
import { Level } from "src/network/components/chainComponents";
import { Starmap } from "./user-panel/panes/starmap/Starmap";
import { TileInfo } from "./tile-info/TileInfo";
import { primodium } from "@game/api";
import { BeltMap } from "@game/constants";
import { FullStarmap } from "./user-panel/panes/starmap/FullStarmap";
import { Leaderboard } from "./Leaderboard";
import { SelectedAsteroid } from "src/network/components/clientComponents";
import { FaFileAlt } from "react-icons/fa";
import { Fleets } from "./fleets/Fleets";

export const InfoBox = () => {
  const crtEffect = useGameStore((state) => state.crtEffect);
  const [minimized] = useState<boolean>(false);
  const mainBaseCoord = useMainBaseCoord();
  const [showResearchModal, setShowResearchModal] = useState<boolean>(false);
  const [showMenuModal, setShowMenuModal] = useState<boolean>(false);
  const [showFullStarmap, setShowFullStarmap] = useState<boolean>(false);
  const [showFleets, setShowFleets] = useState<boolean>(false);
  const { setTarget } = primodium.api(BeltMap.KEY)!.game;
  const [notify, setNotify] = useState<boolean>(false);
  const { pan, getPosition } = primodium.api(BeltMap.KEY)!.camera;

  const coordEntity = hashAndTrimKeyCoord(BlockType.BuildingKey, {
    x: mainBaseCoord?.x ?? 0,
    y: mainBaseCoord?.y ?? 0,
    parent: mainBaseCoord?.parent ?? ("0" as EntityID),
  });
  const mainBaseLevel = Level.use(coordEntity, {
    value: 0,
  }).value;

  useEffect(() => {
    if (mainBaseLevel === undefined) return;

    if (mainBaseLevel === undefined || mainBaseLevel <= 1) return;

    if (notify) return;

    setNotify(true);
  }, [mainBaseLevel]);

  return (
    <div>
      <div className="flex fixed top-8 left-8 items-center font-mono text-white crt ">
        <motion.div
          initial={{ opacity: 0, scale: 0, x: -200 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0, x: -200 }}
        >
          <div
            className={`flex gap-2 items-start ${
              crtEffect ? "skew-x-1 skew-y-1" : ""
            }`}
          >
            {!minimized && (
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                exit={{ scale: 0 }}
                className="relative bg-gray-900 z-[999] w-80 h-56 rounded-md border-2 border-cyan-400 ring ring-cyan-900  overflow-hidden"
              >
                <Starmap id="starmap" />
                <FullStarmap
                  show={showFullStarmap}
                  onClose={() => {
                    SelectedAsteroid.remove();
                    setShowFullStarmap(false);
                    setTarget("starmap");
                    const position = getPosition();
                    pan(position, 0);
                  }}
                />
                <button
                  className="absolute bottom-1 right-1 text-xs border rounded-md p-1 bg-slate-700 border-cyan-700 outline-none bg-gradient-to-b from-transparent to-slate-900/20"
                  onClick={() => {
                    setShowFullStarmap(true);
                    const position = getPosition();
                    requestAnimationFrame(() => pan(position, 0));
                  }}
                >
                  Open Starmap
                </button>
              </motion.div>
            )}

            <div className="flex flex-col items-start justify-start h-full">
              <div className="relative">
                <GameButton
                  id="research"
                  className="mt-2 ml-1 text-sm"
                  onClick={() => {
                    setShowResearchModal(true);
                    setNotify(false);
                  }}
                  depth={4}
                >
                  <div className="flex m-1 items-center gap-2 px-1">
                    <IoFlaskSharp size={18} />
                  </div>
                </GameButton>
                {notify && (
                  <div className="absolute bg-rose-500 top-0 -right-2 text-xs px-1 border-2 border-black w-4 h-4 animate-pulse rounded-full" />
                )}
              </div>
              <div className="relative">
                <GameButton
                  id="battle-reports"
                  color="bg-orange-500"
                  className="mt-2 ml-1 text-sm"
                  onClick={() => {
                    setShowFleets(true);
                  }}
                  depth={4}
                >
                  <div className="flex m-1 items-center gap-2 px-1">
                    <FaFileAlt size={18} />
                  </div>
                </GameButton>
              </div>
              <div className="relative">
                <GameButton
                  id="research"
                  className="mt-2 ml-1 text-sm"
                  onClick={() => setShowMenuModal(true)}
                  color="bg-gray-700"
                  depth={4}
                >
                  <div className="flex m-1 items-center gap-2 px-1 h-4">
                    <IoSettings size={18} />
                  </div>
                </GameButton>
              </div>
            </div>
          </div>

          <TileInfo />
          <Leaderboard />
        </motion.div>
      </div>
      <Modal
        title="Menu"
        show={showMenuModal}
        onClose={() => setShowMenuModal(!showMenuModal)}
      >
        <MainMenu />
      </Modal>
      <Modal
        title="Research"
        show={showResearchModal}
        onClose={() => setShowResearchModal(!showResearchModal)}
      >
        <ResearchPage />
      </Modal>
      <Modal
        title="Fleets"
        show={showFleets}
        onClose={() => setShowFleets(!showFleets)}
      >
        <Fleets />
      </Modal>
    </div>
  );
};
