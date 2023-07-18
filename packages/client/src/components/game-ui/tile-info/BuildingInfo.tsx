import { useComponentValue } from "@latticexyz/react";
import { EntityID, EntityIndex } from "@latticexyz/recs";
import React from "react";
import { ImageButton } from "src/components/shared/ImageButton";
import { useMud } from "src/context/MudContext";
import { BackgroundImage, BlockIdToKey } from "src/util/constants";
import { getBuildingMaxHealth } from "src/util/health";
import { useAccount } from "wagmi";
import Header from "./Header";

const BuildingInfo: React.FC<{
  building: EntityIndex;
}> = ({ building }) => {
  const { components } = useMud();
  const { address } = useAccount();
  const buildingType = useComponentValue(components.BuildingType, building)
    ?.value as EntityID | undefined;
  const health = useComponentValue(components.Health, building)?.value;

  const owner = useComponentValue(components.OwnedBy, building)?.value as
    | EntityID
    | undefined;
  if (!buildingType || !owner) return null;
  const ownerName =
    owner == address ? "you" : owner.toString().slice(0, 8) + "...";
  const percentHealth =
    (health ?? getBuildingMaxHealth(buildingType)) /
    getBuildingMaxHealth(buildingType);

  return (
    <>
      <Header content={`${ownerName}`} />
      <div className="flex flex-col items-center space-y-6">
        <div className="relative border-4 border-t-yellow-400 border-x-yellow-500 border-b-yellow-600 ring-4 ring-slate-900/90 w-fit crt">
          <img
            src={BackgroundImage.get(buildingType)}
            className="w-16 h-16 pixel-images"
          />
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
              {BlockIdToKey[buildingType]
                .replace(/([A-Z]+)/g, " $1")
                .replace(/([A-Z][a-z])/g, " $1")}
            </b>
          </p>
        </div>
        <div className="relative">
          <ImageButton
            className="w-36 h-12 text-green-100 border-2 border-cyan-600"
            image="/img/buttons/rectangle/blue/up.png"
            activeImage="/img/buttons/rectangle/blue/down.png"
          >
            <p className="-translate-y-[2px] active:translate-y-0 font-bold leading-none h-full flex justify-center items-center crt">
              Upgrade
            </p>
          </ImageButton>
        </div>
      </div>
    </>
  );
};

export default BuildingInfo;
