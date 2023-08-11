import { EntityID } from "@latticexyz/recs";
import React, { useMemo, useState } from "react";

import { useMud } from "src/hooks/useMud";
import { BackgroundImage, BlockIdToKey, BlockType } from "src/util/constants";
import Header from "./Header";
import UpgradeButton from "src/components/action/UpgradeButton";
import { useAccount } from "src/hooks/useAccount";
import { GameButton } from "src/components/shared/GameButton";
import { demolishBuilding, demolishPath } from "src/util/web3";
import PortalModal from "src/components/shared/PortalModal";
import {
  Level,
  BuildingType,
  OwnedBy,
  Position,
} from "src/network/components/chainComponents";
import { clampedIndex, toRomanNumeral } from "src/util/common";

export const BuildingInfo: React.FC<{
  building: EntityID;
}> = ({ building }) => {
  const network = useMud();
  const { address } = useAccount();
  const [showDestroyModal, setShowDestroyModal] = useState(false);

  const buildingType = BuildingType.use(building, {
    value: "-1" as EntityID,
  })?.value;
  const owner = OwnedBy.use(building)?.value;

  const currLevel = Level.use(building)?.value;

  const isOwner = owner === address.toLowerCase();

  const ownerName = isOwner
    ? "You"
    : owner
    ? owner.toString().slice(0, 5) + "..." + owner.toString().slice(-4)
    : "Unknown";
  const coord = Position.use(building);

  const buildingName = useMemo(() => {
    if (!buildingType) return;

    const key = BlockIdToKey[buildingType];

    if (!key) return;

    return key.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
  }, [buildingType]);

  const imageURI = useMemo(() => {
    if (!buildingType) return undefined;

    if (!BackgroundImage.has(buildingType)) return undefined;

    const imageIndex = parseInt(currLevel ? currLevel.toString() : "1") - 1;

    return BackgroundImage.get(buildingType)![
      clampedIndex(imageIndex, BackgroundImage.get(buildingType)!.length)
    ];
  }, [buildingType, currLevel]);

  if (!buildingName || !buildingType || !coord || owner == undefined)
    return null;
  return (
    <>
      <Header content={`${ownerName}`} />
      <div className="flex flex-col items-center space-y-6">
        <div className="relative border-4 border-t-yellow-400 border-x-yellow-500 border-b-yellow-600 ring-4 ring-slate-900/90 w-fit crt">
          <img src={imageURI} className="w-16 h-16 pixel-images" />

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
              coord={coord}
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
        <div className="space-y-8 p-5">
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
