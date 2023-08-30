import { EntityID } from "@latticexyz/recs";
import React, { useMemo, useState } from "react";

import { useMud } from "src/hooks/useMud";
import { BackgroundImage, BlockIdToKey, BlockType } from "src/util/constants";
import UpgradeBuildingButton from "src/components/action/UpgradeBuildingButton";
import { useAccount } from "src/hooks/useAccount";
import { GameButton } from "src/components/shared/GameButton";
import { demolishBuilding } from "src/util/web3";
import PortalModal from "src/components/shared/PortalModal";
import {
  Level,
  BuildingType,
  OwnedBy,
  Position,
} from "src/network/components/chainComponents";
import { clampedIndex, toRomanNumeral } from "src/util/common";
import { FaTrash } from "react-icons/fa";
import { TrainUnits } from "./TrainUnits";

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
    <div className="flex flex-col w-fit items-center gap-3">
      {/* <Header content={`${ownerName}`} /> */}
      <div className="relative flex flex-col justify-center items-center border border-yellow-400 ring ring-yellow-700/20 rounded-md bg-slate-900 p-2">
        <div className="relative flex items-center gap-2">
          <div
            className={`relative flex flex-col text-sm items-center cursor-pointer w-16 h-12 border rounded border-cyan-400`}
          >
            <img
              src={imageURI}
              className={`absolute bottom-0 w-14 pixel-images rounded-md`}
            />
          </div>
          <p className="flex items-center text-center border border-cyan-700 bg-slate-700 rounded-md p-1 text-sm ">
            <b>
              {buildingName} {toRomanNumeral(currLevel ?? 1)}
            </b>
          </p>
        </div>

        {isOwner && (
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
            <GameButton
              className="bg-rose-700 text-xs"
              depth={2}
              onClick={() => setShowDestroyModal(true)}
            >
              <p className="flex w-full h-full items-center justify-center font-bold gap-2 py-1 px-2">
                <FaTrash />
              </p>
            </GameButton>
          </div>
        )}
      </div>

      <TrainUnits buildingEntity={building} />

      {isOwner && (
        <div className="relative">
          <UpgradeBuildingButton
            id="upgrade-building"
            builtTile={buildingType ?? BlockType.Air}
            buildingEntity={building}
            coords={coord}
          />
        </div>
      )}

      <PortalModal
        show={showDestroyModal}
        onClose={() => setShowDestroyModal(false)}
      >
        <div className="space-y-8 p-5">
          <h1>
            Demolish <b>{buildingName}</b> at
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
          </div>
        </div>
      </PortalModal>
    </div>
  );
};
