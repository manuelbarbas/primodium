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
              <ResourceLabel
                name={"Iron"}
                resourceComponent={components.IronResource}
                resourceId={BlockType.Iron}
              />
              <ResourceLabel
                name={"Copper"}
                resourceComponent={components.CopperResource}
                resourceId={BlockType.Copper}
              />
              <ResourceLabel
                name={"Bolutite"}
                resourceComponent={components.BolutiteResource}
                resourceId={BlockType.Bolutite}
              />
              <ResourceLabel
                name={"Iridium"}
                resourceComponent={components.IridiumResource}
                resourceId={BlockType.Iridium}
              />
              <ResourceLabel
                name={"Kimberlite"}
                resourceComponent={components.KimberliteResource}
                resourceId={BlockType.Kimberlite}
              />
              <ResourceLabel
                name={"Lithium"}
                resourceComponent={components.LithiumResource}
                resourceId={BlockType.Lithium}
              />
              <ResourceLabel
                name={"Osmium"}
                resourceComponent={components.OsmiumResource}
                resourceId={BlockType.Osmium}
              />
              <ResourceLabel
                name={"Titanium"}
                resourceComponent={components.TitaniumResource}
                resourceId={BlockType.Titanium}
              />
              <ResourceLabel
                name={"Tungsten"}
                resourceComponent={components.TungstenResource}
                resourceId={BlockType.Tungsten}
              />
              <ResourceLabel
                name={"Uraninite"}
                resourceComponent={components.UraniniteResource}
                resourceId={BlockType.Uraninite}
              />
              <ResourceLabel
                name={"Bullet"}
                resourceComponent={components.BulletCrafted}
                resourceId={BlockType.BulletCrafted}
              />
              <ResourceLabel
                name={"Iron Plate"}
                resourceComponent={components.IronPlateCrafted}
                resourceId={BlockType.IronPlateCrafted}
              />
              <ResourceLabel
                name={"Basic Power Source"}
                resourceComponent={components.BasicPowerSourceCrafted}
                resourceId={BlockType.BasicPowerSourceCrafted}
              />
              <ResourceLabel
                name={"Kinetic Missile"}
                resourceComponent={components.KineticMissileCrafted}
                resourceId={BlockType.KineticMissileCrafted}
              />
              <ResourceLabel
                name={"Refined Osmium"}
                resourceComponent={components.RefinedOsmiumCrafted}
                resourceId={BlockType.RefinedOsmiumCrafted}
              />
              <ResourceLabel
                name={"Advanced Power Source"}
                resourceComponent={components.AdvancedPowerSourceCrafted}
                resourceId={BlockType.AdvancedPowerSourceCrafted}
              />
              <ResourceLabel
                name={"Penetrating Warhead"}
                resourceComponent={components.PenetratingWarheadCrafted}
                resourceId={BlockType.PenetratingWarheadCrafted}
              />
              <ResourceLabel
                name={"Penetrating Missile"}
                resourceComponent={components.PenetratingMissileCrafted}
                resourceId={BlockType.PenetratingMissileCrafted}
              />
              <ResourceLabel
                name={"Tungsten Rods"}
                resourceComponent={components.TungstenRodsCrafted}
                resourceId={BlockType.TungstenRodsCrafted}
              />
              <ResourceLabel
                name={"Iridium Crystal"}
                resourceComponent={components.IridiumCrystalCrafted}
                resourceId={BlockType.IridiumCrystalCrafted}
              />
              <ResourceLabel
                name={"Iridium Drillbit"}
                resourceComponent={components.IridiumDrillbitCrafted}
                resourceId={BlockType.IridiumDrillbitCrafted}
              />
              <ResourceLabel
                name={"Laser Power Source"}
                resourceComponent={components.LaserPowerSourceCrafted}
                resourceId={BlockType.LaserPowerSourceCrafted}
              />
              <ResourceLabel
                name={"Thermobaric Warhead"}
                resourceComponent={components.ThermobaricWarheadCrafted}
                resourceId={BlockType.ThermobaricWarheadCrafted}
              />
              <ResourceLabel
                name={"Thermobaric Missile"}
                resourceComponent={components.ThermobaricMissileCrafted}
                resourceId={BlockType.ThermobaricMissileCrafted}
              />
              <ResourceLabel
                name={"Kimberlite Crystal Catalyst"}
                resourceComponent={components.KimberliteCrystalCatalystCrafted}
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
