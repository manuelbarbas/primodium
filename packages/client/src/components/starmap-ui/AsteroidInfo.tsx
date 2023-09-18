import { BlockNumber, Hangar } from "src/network/components/clientComponents";
import { UnitBreakdown } from "./UnitBreakdown";
import {
  AsteroidType,
  IsMineableAt,
  LastClaimedAt,
  Level,
  MainBase,
  Motherlode,
  MotherlodeResource,
  OwnedBy,
  P_MotherlodeResource,
  P_WorldSpeed,
  Position,
} from "src/network/components/chainComponents";
import {
  MotherlodeSizeNames,
  MotherlodeTypeNames,
  RESOURCE_SCALE,
  SPEED_SCALE,
} from "src/util/constants";
import { EntityID } from "@latticexyz/recs";
import { hashKeyEntity } from "src/util/encode";
import { ESpaceRockType } from "src/util/web3/types";
import { AnimatePresence, motion } from "framer-motion";
import { getAsteroidImage } from "src/util/asteroid";
import { useState } from "react";
import { shortenAddress } from "src/util/common";
import { GameButton } from "../shared/GameButton";
import { FaCircleLeft } from "react-icons/fa6";
import { FaUserAstronaut } from "react-icons/fa";
import { HostileFleets } from "../asteroid-ui/hostile-fleets/HostileFleets";
import { getUnitStats } from "src/util/trainUnits";
import { SingletonID } from "@latticexyz/network";

type PaneState = "units" | "arrivals" | "home";
export const AsteroidInfo: React.FC<{ asteroid: EntityID; title?: string }> = ({
  asteroid,
  title,
}) => {
  const [paneState, setPaneState] = useState<PaneState>("home");

  const type = AsteroidType.use(asteroid, {
    value: ESpaceRockType.Asteroid,
  }).value as ESpaceRockType;

  return (
    <AnimatePresence>
      <motion.div layout key="target-info">
        <div className="flex flex-col bg-slate-900/90 border rounded-md overflow-none ring ring-cyan-700 border-cyan-400 font-bold w-96">
          {title && (
            <div className="p-1 border items-center border-t-0 border-r-0 border-l-0 border-cyan-400 flex justify-between">
              {title}
              {paneState !== "home" ? (
                <GameButton
                  id="units"
                  color="bg-blue-500"
                  onClick={() => setPaneState("home")}
                  depth={1}
                >
                  <div className="flex m-1 items-center gap-2 px-1">
                    <FaCircleLeft size={12} />
                  </div>
                </GameButton>
              ) : (
                <div className="flex gap-1">
                  <GameButton
                    id="units"
                    color="bg-green-500"
                    onClick={() => setPaneState("units")}
                    depth={1}
                  >
                    <div className="flex m-1 items-center gap-2 px-1">
                      <FaUserAstronaut size={12} />
                    </div>
                  </GameButton>
                </div>
              )}
            </div>
          )}
          {type == ESpaceRockType.Asteroid && (
            <AsteroidTargetInfo target={asteroid} paneState={paneState} />
          )}
          {type == ESpaceRockType.Motherlode && (
            <MotherlodeTargetInfo target={asteroid} paneState={paneState} />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const AsteroidTargetInfo: React.FC<{
  target: EntityID;
  paneState: PaneState;
}> = ({ target, paneState }) => {
  const owner = OwnedBy.get(target)?.value;
  const mainBase = MainBase.get(owner)?.value;
  const mainBaseLevel = Level.use(mainBase, { value: 0 }).value;
  const position = Position.use(target, {
    x: 0,
    y: 0,
    parent: "0" as EntityID,
  });

  if (!mainBase) return null;

  const image = getAsteroidImage(target);
  if (paneState == "units") return <UnitBreakdown asteroid={target} />;
  if (paneState == "arrivals")
    return <HostileFleets spacerock={target} small />;
  return (
    <div className="relative flex pixel-images h-32">
      <img src={image} className="h-32 w-32 object-cover p-1" />
      <p className="absolute bottom-1 left-1 bg-slate-900/90 text-xs">
        [{position.x}, {position.y}]
      </p>
      <div className="border-l border-cyan-400 w-full text-xs grid grid-rows-3">
        <div className="bg-slate-800/70 w-full h-full flex flex-col justify-center px-2">
          <b className="opacity-70">NAME</b>
          <p>Asteroid</p>
        </div>
        <div className="w-full h-full flex flex-col justify-center px-2">
          <b className="opacity-70">OWNER</b>

          <p>{owner ? shortenAddress(owner) : "Neutral"}</p>
        </div>
        <div className="bg-slate-800/70 w-full h-full flex flex-col justify-center px-2">
          <b className="opacity-70">LEVEL</b>
          <p>{mainBaseLevel}</p>
        </div>
      </div>
    </div>
  );
};

const MotherlodeTargetInfo: React.FC<{
  target: EntityID;
  paneState: PaneState;
}> = ({ target, paneState }) => {
  const owner = OwnedBy.use(target)?.value;
  const position = Position.use(target, {
    x: 0,
    y: 0,
    parent: "0" as EntityID,
  });
  const blockNumber = BlockNumber.use(undefined, {
    value: 0,
    avgBlockTime: 1,
  }).value;

  const motherlodeData = Motherlode.get(target);
  if (!motherlodeData) return null;

  const { maxAmount } = P_MotherlodeResource.get(
    hashKeyEntity(motherlodeData?.motherlodeType, motherlodeData.size),
    { resource: "0" as EntityID, maxAmount: 0 }
  );
  const resourceMined = MotherlodeResource.get(target, { value: 0 }).value;

  const mineableAt = Number(IsMineableAt.get(target, { value: "0" }).value);
  let production = 0;
  const hangar = Hangar.get(target);
  if (hangar) {
    const worldSpeed = P_WorldSpeed.get(SingletonID)?.value ?? SPEED_SCALE;
    const lastClaimedAt = LastClaimedAt.get(target)?.value ?? 0;
    for (let i = 0; i < hangar.units.length; i++) {
      production += getUnitStats(hangar.units[i]).MIN * hangar.counts[i];
    }

    production *= ((blockNumber - lastClaimedAt) * SPEED_SCALE) / worldSpeed;
    if (production + resourceMined > maxAmount)
      production = maxAmount - resourceMined;
  }

  const blocksLeft = mineableAt - blockNumber;
  const resourceLeft = maxAmount - (resourceMined + production);
  const resourceName = MotherlodeTypeNames[motherlodeData.motherlodeType];
  const resourceSize = MotherlodeSizeNames[motherlodeData.size];
  const image = getAsteroidImage(target);

  if (paneState == "units") return <UnitBreakdown asteroid={target} />;
  if (paneState == "arrivals")
    return <HostileFleets spacerock={target} small />;

  return (
    <div className="relative flex pixel-images h-32 w-full">
      {blocksLeft > 0 && (
        <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center">
          <div className="text-red-500 text-4xl font-bold z-[1009]">
            <b>COOLING DOWN</b>
            <br />
            <b className="text-3xl">{blocksLeft} Blocks Left</b>
          </div>
        </div>
      )}
      <img
        src={image}
        className="border-r border-cyan-400 h-32 w-32 object-cover p-1"
      />
      <p className="absolute bottom-1 left-1 bg-slate-900/90 text-xs">
        [{position.x}, {position.y}]
      </p>
      <div className="text-xs grid grid-rows-3 w-full">
        <div className="bg-slate-800/70 w-full h-full flex flex-col justify-center px-2 capitalize">
          <b className="opacity-70">NAME</b>
          <p>
            {resourceSize} {resourceName} Motherlode
          </p>
        </div>
        <div className="w-full h-full flex flex-col justify-center px-2">
          <b className="opacity-70">OWNER</b>
          <p>{owner ? shortenAddress(owner) : "Neutral"}</p>
        </div>
        <div className="bg-slate-800/70 w-full h-full flex flex-col justify-center px-2 capitalize">
          <b className="opacity-70">QTY</b>
          <p>
            {resourceLeft * RESOURCE_SCALE} / {maxAmount * RESOURCE_SCALE}{" "}
            {resourceName}
          </p>
        </div>
      </div>
    </div>
  );
};
