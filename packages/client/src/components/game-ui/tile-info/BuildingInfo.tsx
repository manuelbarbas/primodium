import { useComponentValue } from "@latticexyz/react";
import { EntityID } from "@latticexyz/recs";
import React, { useMemo, useState } from "react";

import { useMud } from "src/context/MudContext";
import { BackgroundImage, BlockIdToKey, BlockType } from "src/util/constants";
import { getBuildingMaxHealth } from "src/util/health";
import Header from "./Header";
import UpgradeButton from "src/components/action/UpgradeButton";
import { world } from "src/network/world";
import { decodeCoordEntity } from "src/util/encode";
import { useAccount } from "src/hooks/useAccount";
import { GameButton } from "src/components/shared/GameButton";
import { demolishBuilding, demolishPath } from "src/util/web3";
import PortalModal from "src/components/shared/PortalModal";
import { clampedIndex, toRomanNumeral } from "src/util/common";

export const BuildingInfo: React.FC<{
  building: EntityID;
}> = ({ building }) => {
  const network = useMud();
  const { components } = network;
  const { address } = useAccount();
  const [showDestroyModal, setShowDestroyModal] = useState(false);

  const buildingIndex = world.entityToIndex.get(building)!;
  const buildingType = useComponentValue(components.BuildingType, buildingIndex)
    ?.value as EntityID | undefined;
  const health = useComponentValue(components.Health, buildingIndex)?.value;

  const owner = useComponentValue(components.OwnedBy, buildingIndex)?.value as
    | EntityID
    | undefined;

  const currLevel = useComponentValue(
    components.BuildingLevel,
    world.entityToIndex.get(building)
  )?.value;

  const isOwner = owner ?? "" == address.toLowerCase();

  const ownerName =
    isOwner || !owner
      ? "You"
      : owner.toString().slice(0, 5) + "..." + owner.toString().slice(-4);
  const percentHealth =
    (health ?? getBuildingMaxHealth(buildingType ?? BlockType.Air)) /
    getBuildingMaxHealth(buildingType ?? BlockType.Air);

  const coord = decodeCoordEntity(building);

  const buildingName = useMemo(() => {
    if (!buildingType) return undefined;
    return BlockIdToKey[buildingType]
      .replace(/([A-Z]+)/g, " $1")
      .replace(/([A-Z][a-z])/g, " $1");
  }, [buildingType]);

  if (!buildingName || !buildingType) return null;

  const imageIndex = parseInt(currLevel ? currLevel.toString() : "0");

  const imageURI =
    BackgroundImage.get(buildingType)![
      clampedIndex(imageIndex - 1, BackgroundImage.get(buildingType)!.length)
    ];

  console.log(imageIndex, imageURI);

  return (
    <>
      <Header content={`${ownerName}`} />
      <div className="flex flex-col items-center space-y-6">
        <div className="relative border-4 border-t-yellow-400 border-x-yellow-500 border-b-yellow-600 ring-4 ring-slate-900/90 w-fit crt">
          <img src={imageURI} className="w-16 h-16 pixel-images" />
          <div className="absolute flex items-center bottom-0 left-1/2 -translate-x-1/2 w-20 h-2 ring-2 ring-slate-900/90 crt">
            <div
              className="h-full bg-green-500"
              style={{ width: `${percentHealth * 100}%` }}
            />
            <div
              className="h-full bg-gray-900"
              style={{ width: `${(1 - percentHealth) * 100}%` }}
            />
          </div>
          <p className="absolute flex items-center -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 border border-cyan-600 px-1 crt">
            <b>
              {buildingName} {toRomanNumeral(currLevel ?? 1)}
            </b>
          </p>
        </div>
        {isOwner && (
          <div className="relative">
            <UpgradeButton
              id="upgrade"
              builtTile={buildingType ?? BlockType.Air}
              buildingEntity={building}
              coords={coord}
            />
          </div>
        )}
        {isOwner && (
          <div className="absolute top-2 right-10">
            <GameButton
              className="bg-rose-700 text-xs"
              depth={2}
              onClick={() => setShowDestroyModal(true)}
            >
              <p className="flex w-full h-full items-center px-1 justify-center font-bold">
                x
              </p>
            </GameButton>
          </div>
        )}
      </div>
      <PortalModal
        show={showDestroyModal}
        onClose={() => setShowDestroyModal(false)}
      >
        <div className="space-y-8">
          <h1>
            Demolish <b>{buildingName}</b> or <b>Path</b> at{" "}
            <b>
              ({coord.x},{coord.y})
            </b>
            ?
          </h1>
          <div className="flex w-full items-center justify-center gap-3 font-bold">
            <GameButton
              className="text-xs"
              color="bg-rose-700"
              onClick={() => {
                demolishBuilding(coord, network);
                setShowDestroyModal(false);
              }}
            >
              <p className="flex w-full h-full items-center px-1 justify-center p-1">
                Destroy Building
              </p>
            </GameButton>
            <GameButton
              className="text-xs"
              color="bg-orange-700"
              onClick={() => {
                demolishPath(coord, network);
                setShowDestroyModal(false);
              }}
            >
              <p className="flex w-full h-full items-center px-1 justify-center p-1">
                Destroy Path
              </p>
            </GameButton>
          </div>
        </div>
      </PortalModal>
    </>
  );
};
