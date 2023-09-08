import { BlockType } from "src/util/constants";
import { ResourceLabel } from "./ResourceLabel";

export const AllResourceLabels = () => {
  return (
    <div className="grid gap-2 min-h-fit max-h-56 overflow-y-auto">
      <ResourceLabel name={"Iron"} resourceId={BlockType.Iron} />
      <ResourceLabel name={"Copper"} resourceId={BlockType.Copper} />
      <ResourceLabel name={"Lithium"} resourceId={BlockType.Lithium} />
      <ResourceLabel name={"Sulfur"} resourceId={BlockType.Sulfur} />
      <ResourceLabel
        name={"Iron Plate"}
        resourceId={BlockType.IronPlateCrafted}
      />
      <ResourceLabel name={"Alloy"} resourceId={BlockType.Alloy} />
      <ResourceLabel
        name={"Photovoltaic Cell"}
        resourceId={BlockType.PhotovoltaicCell}
      />
      <ResourceLabel name={"Titanium"} resourceId={BlockType.Titanium} />
      <ResourceLabel name={"Platinum"} resourceId={BlockType.Platinum} />
      <ResourceLabel name={"Iridium"} resourceId={BlockType.Iridium} />
      <ResourceLabel name={"Kimberlite"} resourceId={BlockType.Kimberlite} />
      <ResourceLabel name={"Bolutite"} resourceId={BlockType.Bolutite} />
      <ResourceLabel name={"Osmium"} resourceId={BlockType.Osmium} />
      <ResourceLabel name={"Tungsten"} resourceId={BlockType.Tungsten} />
      <ResourceLabel name={"Uraninite"} resourceId={BlockType.Uraninite} />
      <ResourceLabel name={"Bullet"} resourceId={BlockType.BulletCrafted} />
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
        name={"Kimberlite Catalyst"}
        resourceId={BlockType.KimberliteCrystalCatalystCrafted}
      />
    </div>
  );
};
