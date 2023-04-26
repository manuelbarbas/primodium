import { useState, useEffect, useMemo, useCallback } from "react";
import { useComponentValue } from "@latticexyz/react";
import { EntityID } from "@latticexyz/recs";
import { BigNumber } from "ethers";

import { useMud } from "../../context/MudContext";
import { ResourceCostData } from "../../util/resource";

import { BlockType } from "../../util/constants";
import { useAccount } from "../../hooks/useAccount";
import { execute } from "../../network/actions";

function TechTreeItem({
  data,
  icon,
  name,
  description,
  resourcecost,
}: {
  data: ResourceCostData;
  icon: any;
  name: any;
  description: string;
  resourcecost: any;
}) {
  // fetch whether research is completed
  const { components, world, singletonIndex, systems, providers } = useMud();
  const { address } = useAccount();

  const researchOwner = useMemo(() => {
    if (address) {
      return world.entityToIndex.get(
        address.toString().toLowerCase() as EntityID
      );
    } else {
      return singletonIndex;
    }
  }, []);

  const [researchComponent, setResearchComponent] = useState(
    components.CopperResearch
  );

  const [isDefaultUnlocked, setIsDefaultUnlocked] = useState(false);
  const isResearched = useComponentValue(researchComponent, researchOwner);

  useEffect(() => {
    // default researched components
    switch (data.id) {
      case BlockType.MainBaseResearch:
        setIsDefaultUnlocked(true);
        break;
      case BlockType.IronResearch:
        setIsDefaultUnlocked(true);
        break;
      case BlockType.BasicMinerResearch:
        setIsDefaultUnlocked(true);
        break;
      case BlockType.ConveyorResearch:
        setIsDefaultUnlocked(true);
        break;
      case BlockType.NodeResearch:
        setIsDefaultUnlocked(true);
        break;
      case BlockType.CopperResearch:
        setResearchComponent(components.CopperResearch);
        break;
      case BlockType.LithiumResearch:
        setResearchComponent(components.LithiumResearch);
        break;
      case BlockType.TitaniumResearch:
        setResearchComponent(components.TitaniumResearch);
        break;
      case BlockType.OsmiumResearch:
        setResearchComponent(components.OsmiumResearch);
        break;
      case BlockType.TungstenResearch:
        setResearchComponent(components.TungstenResearch);
        break;
      case BlockType.IridiumResearch:
        setResearchComponent(components.IridiumResearch);
        break;
      case BlockType.KimberliteResearch:
        setResearchComponent(components.KimberliteResearch);
        break;
      case BlockType.PlatingFactoryResearch:
        setResearchComponent(components.PlatingFactoryResearch);
        break;
      case BlockType.BasicBatteryFactoryResearch:
        setResearchComponent(components.BasicBatteryFactoryResearch);
        break;
      case BlockType.KineticMissileFactoryResearch:
        setResearchComponent(components.KineticMissileFactoryResearch);
        break;
      case BlockType.ProjectileLauncherResearch:
        setResearchComponent(components.ProjectileLauncherResearch);
        break;
      case BlockType.HardenedDrillResearch:
        setResearchComponent(components.HardenedDrillResearch);
        break;
      case BlockType.DenseMetalRefineryResearch:
        setResearchComponent(components.DenseMetalRefineryResearch);
        break;
      case BlockType.AdvancedBatteryFactoryResearch:
        setResearchComponent(components.AdvancedBatteryFactoryResearch);
        break;
      case BlockType.HighTempFoundryResearch:
        setResearchComponent(components.HighTempFoundryResearch);
        break;
      case BlockType.PrecisionMachineryFactoryResearch:
        setResearchComponent(components.PrecisionMachineryFactoryResearch);
        break;
      case BlockType.IridiumDrillbitFactoryResearch:
        setResearchComponent(components.IridiumDrillbitFactoryResearch);
        break;
      case BlockType.PrecisionPneumaticDrillResearch:
        setResearchComponent(components.PrecisionPneumaticDrillResearch);
        break;
      case BlockType.PenetratorFactoryResearch:
        setResearchComponent(components.PenetratorFactoryResearch);
        break;
      case BlockType.PenetratingMissileFactoryResearch:
        setResearchComponent(components.PenetratingMissileFactoryResearch);
        break;
      case BlockType.MissileLaunchComplexResearch:
        setResearchComponent(components.MissileLaunchComplexResearch);
        break;
      case BlockType.HighEnergyLaserFactoryResearch:
        setResearchComponent(components.HighEnergyLaserFactoryResearch);
        break;
      case BlockType.ThermobaricWarheadFactoryResearch:
        setResearchComponent(components.ThermobaricWarheadFactoryResearch);
        break;
      case BlockType.ThermobaricMissileFactoryResearch:
        setResearchComponent(components.ThermobaricMissileFactoryResearch);
        break;
      case BlockType.KimberliteCatalystFactoryResearch:
        setResearchComponent(components.KimberliteCatalystFactoryResearch);
        break;
      default:
      // Default case, when no other case matches
    }
  }, []);

  const research = useCallback(async () => {
    await execute(
      systems["system.Research"].executeTyped(BigNumber.from(data.id), {
        gasLimit: 30_000_000,
      }),
      providers
    );
  }, []);

  if (isDefaultUnlocked || isResearched?.value) {
    return (
      <div className="relative group w-64 h-64 pt-1 bg-gray-200 rounded shadow text-black mb-3 mr-3 p-3">
        <div className="mt-1 w-20 h-20 mx-auto">
          <img src={icon} className="w-20 h-20 mx-auto pixel-images"></img>
        </div>
        {/* <div className="research-tooltip group-hover:scale-100 mt-2"> */}
        <div className="mt-2 text-center font-bold text-gray-900">{name}</div>
        <div className="mt-1 text-sm grid grid-cols-3">{resourcecost}</div>
        <div className="mt-1 text-xs">{description}</div>
        {/* </div> */}
        <button className="text-white text-xs font-bold h-10 absolute inset-x-2 bottom-2 text-center bg-gray-600  py-2 rounded shadow">
          Unlocked
        </button>
      </div>
    );
  } else {
    return (
      <div className="relative group w-64 h-64 pt-1 bg-gray-200 rounded shadow text-black mb-3 mr-3 p-3">
        <div className="mt-1 w-16 h-16 mx-auto">
          <img src={icon} className="w-16 h-16 mx-auto pixel-images"></img>
        </div>
        {/* <div className="research-tooltip group-hover:scale-100 mt-2"> */}
        <div className="mt-2 text-center font-bold text-gray-900">{name}</div>
        <div className="mt-1 text-sm grid grid-cols-3 justify-center">
          {resourcecost}
        </div>
        <div className="mt-1 text-xs">{description}</div>
        {/* </div> */}
        <button
          className="text-white text-xs font-bold h-10 absolute inset-x-2 bottom-2 text-center bg-teal-600  py-2 rounded shadow"
          onClick={research}
        >
          Research
        </button>
      </div>
    );
  }
}

export default TechTreeItem;
