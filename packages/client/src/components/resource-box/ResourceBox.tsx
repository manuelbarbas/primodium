import { useState } from "react";
import { EntityID } from "@latticexyz/recs";
import { useComponentValue } from "@latticexyz/react";

import { FaMinusSquare } from "react-icons/fa";
import { FaPlusSquare } from "react-icons/fa";

import { useMud } from "../../context/MudContext";
import { BlockType } from "../../util/constants";
import { useAccount } from "../../hooks/useAccount";

import ResourceLabel from "./ResourceLabel";
import StarterPackButton from "../StarterPackButton";

function ResourceBox() {
  const [minimized, setMinimize] = useState(true);
  const minimizeBox = () => {
    if (minimized) {
      setMinimize(false);
    } else {
      setMinimize(true);
    }
  };

  // Check if user has claimed starter pack
  const { components, world, singletonIndex } = useMud();
  const { address } = useAccount();

  const claimedStarterPack = useComponentValue(
    components.StarterPackInitialized,
    address
      ? world.entityToIndex.get(address.toString().toLowerCase() as EntityID)
      : singletonIndex
  );

  if (!minimized) {
    return (
      <div className="z-[1000] fixed top-4 right-4 h-64 w-64 flex flex-col bg-gray-700 text-white shadow-xl font-mono rounded">
        <div className=" mt-4 ml-5 flex flex-col h-56">
          <button onClick={minimizeBox} className="fixed right-9">
            <LinkIcon icon={<FaMinusSquare size="18" />} />
          </button>
          <p className="text-lg font-bold mb-3">Resources</p>
          <div className="h-64 overflow-y-scroll scrollbar">
            <>
              <ResourceLabel name={"Iron"} resourceId={BlockType.Iron} />
              <ResourceLabel name={"Copper"} resourceId={BlockType.Copper} />
              <ResourceLabel
                name={"Bolutite"}
                resourceId={BlockType.Bolutite}
              />
              <ResourceLabel name={"Iridium"} resourceId={BlockType.Iridium} />
              <ResourceLabel
                name={"Kimberlite"}
                resourceId={BlockType.Kimberlite}
              />
              <ResourceLabel name={"Lithium"} resourceId={BlockType.Lithium} />
              <ResourceLabel name={"Osmium"} resourceId={BlockType.Osmium} />
              <ResourceLabel
                name={"Titanium"}
                resourceId={BlockType.Titanium}
              />
              <ResourceLabel
                name={"Tungsten"}
                resourceId={BlockType.Tungsten}
              />
              <ResourceLabel
                name={"Uraninite"}
                resourceId={BlockType.Uraninite}
              />
              <ResourceLabel
                name={"Bullet"}
                resourceId={BlockType.BulletCrafted}
              />
              <ResourceLabel
                name={"Iron Plate"}
                resourceId={BlockType.IronPlateCrafted}
              />
              <ResourceLabel
                name={"Basic Power Source"}
                resourceId={BlockType.BasicPowerSourceCrafted}
              />
              <ResourceLabel
                name={"Kinetic Missile"}
                resourceId={BlockType.KineticMissileCrafted}
              />
              <ResourceLabel
                name={"Refined Osmium"}
                resourceId={BlockType.RefinedOsmiumCrafted}
              />
              <ResourceLabel
                name={"Advanced Power Source"}
                resourceId={BlockType.AdvancedPowerSourceCrafted}
              />
              <ResourceLabel
                name={"Penetrating Warhead"}
                resourceId={BlockType.PenetratingWarheadCrafted}
              />
              <ResourceLabel
                name={"Penetrating Missile"}
                resourceId={BlockType.PenetratingMissileCrafted}
              />
              <ResourceLabel
                name={"Tungsten Rods"}
                resourceId={BlockType.TungstenRodsCrafted}
              />
              <ResourceLabel
                name={"Iridium Crystal"}
                resourceId={BlockType.IridiumCrystalCrafted}
              />
              <ResourceLabel
                name={"Iridium Drillbit"}
                resourceId={BlockType.IridiumDrillbitCrafted}
              />
              <ResourceLabel
                name={"Laser Power Source"}
                resourceId={BlockType.LaserPowerSourceCrafted}
              />
              <ResourceLabel
                name={"Thermobaric Warhead"}
                resourceId={BlockType.ThermobaricWarheadCrafted}
              />
              <ResourceLabel
                name={"Thermobaric Missile"}
                resourceId={BlockType.ThermobaricMissileCrafted}
              />
              <ResourceLabel
                name={"Kimberlite Crystal Catalyst"}
                resourceId={BlockType.KimberliteCrystalCatalystCrafted}
              />
            </>
            <p className="text-sm mb-3 mt-3">
              Close and re-open this box to refresh resources.
            </p>
            {!claimedStarterPack ? <StarterPackButton /> : <></>}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="z-[1000] fixed top-4 right-4 h-14 w-64 flex flex-col bg-gray-700 text-white shadow-xl font-mono rounded">
        <div className=" mt-4 ml-5 flex flex-col h-56">
          <button onClick={minimizeBox} className="fixed right-9">
            <LinkIcon icon={<FaPlusSquare size="18" />} />
          </button>
          <p className="text-lg font-bold mb-3">Resources</p>
        </div>
      </div>
    );
  }
}

const LinkIcon = ({ icon }: { icon: any }) => (
  <div className="link-icon inline-block my-auto align-middle">{icon}</div>
);

export default ResourceBox;
