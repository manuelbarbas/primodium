import {
  BlockNumber,
  SelectedAsteroid,
} from "src/network/components/clientComponents";
import { UnitBreakdown } from "./UnitBreakdown";
import {
  AsteroidType,
  IsMineableAt,
  Level,
  MainBase,
  Motherlode,
  MotherlodeResource,
  OwnedBy,
  P_MotherlodeResource,
  Position,
} from "src/network/components/chainComponents";
import { MotherlodeSizeNames, MotherlodeTypeNames } from "src/util/constants";
import { EntityID } from "@latticexyz/recs";
import { hashKeyEntity } from "src/util/encode";
import { ESpaceRockType } from "src/util/web3/types";
import { AnimatePresence, motion } from "framer-motion";
import { getAsteroidImage } from "src/util/asteroid";

export const TargetInfo: React.FC = () => {
  const target = SelectedAsteroid.use()?.value;
  const type = AsteroidType.use(target, { value: ESpaceRockType.Asteroid })
    .value as ESpaceRockType;

  if (!target) return null;

  return (
    <AnimatePresence>
      <motion.div
        layout
        key="target-info"
        className="absolute top-0 left-0 pointer-events-auto"
      >
        {type == ESpaceRockType.Asteroid && (
          <AsteroidTargetInfo target={target} />
        )}
        {type == ESpaceRockType.Motherlode && (
          <MotherlodeTargetInfo target={target} />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

const AsteroidTargetInfo: React.FC<{ target: EntityID }> = ({ target }) => {
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

  return (
    <>
      <div className="relative flex pixel-images h-32 w-fit bg-slate-900/90">
        <div className="relative">
          <img
            src={image}
            className="border border-r-0 border-cyan-400 h-full w-auto object-cover"
          />
          <p className="absolute bottom-1 right-1 bg-slate-900/90 text-xs">
            [{position.x}, {position.y}]
          </p>
        </div>
        <div className="border border-cyan-400 text-xs grid grid-rows-3">
          <div className="bg-slate-800/70 w-full h-full flex flex-col justify-center px-2">
            <b className="opacity-70">NAME</b>
            <p>Asteroid</p>
          </div>
          <div className="w-full h-full flex flex-col justify-center px-2">
            <b className="opacity-70">OWNER</b>

            <p>{owner ? owner : "Neutral"}</p>
          </div>
          <div className="bg-slate-800/70 w-full h-full flex flex-col justify-center px-2">
            <b className="opacity-70">LEVEL</b>
            <p>{mainBaseLevel}</p>
          </div>
        </div>
      </div>
      <UnitBreakdown />
    </>
  );
};

const MotherlodeTargetInfo: React.FC<{ target: EntityID }> = ({ target }) => {
  const owner = OwnedBy.use(target)?.value;
  const position = Position.use(target, {
    x: 0,
    y: 0,
    parent: "0" as EntityID,
  });
  const blockNumber = BlockNumber.use(undefined, { value: 0 }).value;

  const motherlodeData = Motherlode.get(target);
  if (!motherlodeData) return null;

  const { resource, maxAmount } = P_MotherlodeResource.get(
    hashKeyEntity(motherlodeData?.motherlodeType, motherlodeData.size),
    { resource: "0" as EntityID, maxAmount: 0 }
  );
  const resourceMined = MotherlodeResource.get(
    hashKeyEntity(resource, target),
    { value: 0 }
  ).value;

  const mineableAt = Number(IsMineableAt.get(target, { value: "0" }).value);

  const blocksLeft = mineableAt - blockNumber;
  const resourceLeft = maxAmount - resourceMined;
  const resourceName = MotherlodeTypeNames[motherlodeData.motherlodeType];
  const resourceSize = MotherlodeSizeNames[motherlodeData.size];
  const image = getAsteroidImage(target);

  return (
    <>
      <div className="relative flex pixel-images h-32 w-fit bg-slate-900/90">
        {blocksLeft > 0 && (
          <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center">
            <div className="text-red-500 text-4xl font-bold z-[1009]">
              <b>COOLING DOWN</b>
              <br />
              <b className="text-3xl">{blocksLeft} Blocks Left</b>
            </div>
          </div>
        )}
        <div className="relative">
          <img
            src={image}
            className="border border-r-0 border-cyan-400 h-full w-auto object-cover"
          />
          <p className="absolute bottom-1 right-1 bg-slate-900/90 text-xs">
            [{position.x}, {position.y}]
          </p>
        </div>
        <div className="border border-cyan-400 text-xs grid grid-rows-3">
          <div className="bg-slate-800/70 w-full h-full flex flex-col justify-center px-2 capitalize">
            <b className="opacity-70">NAME</b>
            <p>
              {resourceSize} {resourceName} Motherlode
            </p>
          </div>
          <div className="w-full h-full flex flex-col justify-center px-2">
            <b className="opacity-70">OWNER</b>
            <p>{owner ? owner : "Neutral"}</p>
          </div>
          <div className="bg-slate-800/70 w-full h-full flex flex-col justify-center px-2 capitalize">
            <b className="opacity-70">QTY</b>
            <p>
              {resourceLeft} / {maxAmount} {resourceName}
            </p>
          </div>
        </div>
      </div>
      <UnitBreakdown />
    </>
  );
};
