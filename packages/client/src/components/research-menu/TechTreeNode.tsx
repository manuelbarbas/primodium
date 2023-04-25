import { useState, useEffect, useMemo, memo } from "react";
import { Handle, Position } from "reactflow";
import { useComponentValue } from "@latticexyz/react";

import { useMud } from "../../context/MudContext";
import { ResourceCostData } from "../../util/resource";

import {
  BlockType,
  BlockIdToKey,
  ResearchImage,
  BackgroundImage,
} from "../../util/constants";
import { EntityID } from "@latticexyz/recs";
import { useAccount } from "../../hooks/useAccount";

function TechTreeNode({ data }: { data: ResourceCostData }) {
  // fetch whether research is completed
  const { components, world, singletonIndex } = useMud();
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

  if (isDefaultUnlocked || isResearched?.value) {
    const researchImage = ResearchImage.get(data.id as EntityID);
    return (
      <div className="group w-48 px-2 py-3 shadow-md rounded-md bg-white border border-stone-400 -z-10">
        <div className="flex w-48">
          <div className="flex justify-center items-center flex-shrink-0">
            {/* thumbnail */}
            <img
              src={researchImage}
              style={{ imageRendering: "pixelated" }}
              className="w-5 h-5"
            />
          </div>
          <div className="ml-2 mr-1 my-auto text-gray-900 font-bold text-sm">
            {data.name}
          </div>
        </div>
        <div className="mt-2">
          {/* <div className="text-gray-500 text-xs">{Test Description}</div> */}
        </div>
        <div className="research-tooltip group-hover:scale-100 mt-2 text-center text-gray-900 text-sm">
          {data.resources.map((resource) => {
            const resourceImage = BackgroundImage.get(resource.id);
            return (
              <span className="mr-2" key={resource.id}>
                {BlockIdToKey[resource.id]}
                <img
                  src={resourceImage}
                  className="w-4 h-4 inline-block mr-1"
                />
                {resource.amount}
              </span>
            );
          })}
        </div>
        <button className="bg-teal-600 text-sm w-full py-2 rounded shadow mt-3 ">
          Research
        </button>
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
      </div>
    );
  } else {
    const researchImage = ResearchImage.get(data.id as EntityID);
    return (
      <div className="group w-48 px-2 py-3 shadow-md rounded-md bg-white border border-stone-400 -z-10">
        <div className="flex w-48">
          <div className="flex justify-center items-center flex-shrink-0">
            {/* thumbnail */}
            <img
              src={researchImage}
              style={{ imageRendering: "pixelated" }}
              className="w-5 h-5"
            />
          </div>
          <div className="ml-2 mr-1 my-auto text-gray-900 font-bold text-sm">
            {data.name}
          </div>
        </div>
        <div className="mt-2">
          {/* <div className="text-gray-500 text-xs">{Test Description}</div> */}
        </div>
        <div className="research-tooltip group-hover:scale-100 mt-2 text-center text-gray-900 text-sm">
          {data.resources.map((resource) => {
            const resourceImage = BackgroundImage.get(resource.id);
            return (
              <span className="mr-2" key={resource.id}>
                {BlockIdToKey[resource.id]}
                <img
                  src={resourceImage}
                  className="w-4 h-4 inline-block mr-1"
                />
                {resource.amount}
              </span>
            );
          })}
        </div>
        <button className="bg-teal-600 text-sm w-full py-2 rounded shadow mt-3 ">
          LOCKED
        </button>
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
      </div>
    );
  }
}

export default memo(TechTreeNode);
