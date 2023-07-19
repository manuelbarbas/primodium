import { EntityIndex } from "@latticexyz/recs";
import { BlockType } from "../../util/constants";
import ResourceLabel from "./ResourceLabel";

export default function AllResourceLabels({
  entityIndex,
}: {
  entityIndex?: EntityIndex;
}) {
  return (
    <>
      <ResourceLabel
        name={"Iron"}
        entityIndex={entityIndex}
        resourceId={BlockType.Iron}
      />
      <ResourceLabel
        name={"Copper"}
        entityIndex={entityIndex}
        resourceId={BlockType.Copper}
      />
      <ResourceLabel
        name={"Bolutite"}
        entityIndex={entityIndex}
        resourceId={BlockType.Bolutite}
      />
      <ResourceLabel
        name={"Iridium"}
        entityIndex={entityIndex}
        resourceId={BlockType.Iridium}
      />
      <ResourceLabel
        name={"Kimberlite"}
        entityIndex={entityIndex}
        resourceId={BlockType.Kimberlite}
      />
      <ResourceLabel
        name={"Lithium"}
        entityIndex={entityIndex}
        resourceId={BlockType.Lithium}
      />
      <ResourceLabel
        name={"Osmium"}
        entityIndex={entityIndex}
        resourceId={BlockType.Osmium}
      />
      <ResourceLabel
        name={"Titanium"}
        entityIndex={entityIndex}
        resourceId={BlockType.Titanium}
      />
      <ResourceLabel
        name={"Tungsten"}
        entityIndex={entityIndex}
        resourceId={BlockType.Tungsten}
      />
      <ResourceLabel
        name={"Uraninite"}
        entityIndex={entityIndex}
        resourceId={BlockType.Uraninite}
      />
      <ResourceLabel
        name={"Bullet"}
        entityIndex={entityIndex}
        resourceId={BlockType.BulletCrafted}
      />
      <ResourceLabel
        name={"Iron Plate"}
        entityIndex={entityIndex}
        resourceId={BlockType.IronPlateCrafted}
      />
      <ResourceLabel
        name={"Basic Power Source"}
        entityIndex={entityIndex}
        resourceId={BlockType.BasicPowerSourceCrafted}
      />
      <ResourceLabel
        name={"Kinetic Missile"}
        entityIndex={entityIndex}
        resourceId={BlockType.KineticMissileCrafted}
      />
      <ResourceLabel
        name={"Refined Osmium"}
        entityIndex={entityIndex}
        resourceId={BlockType.RefinedOsmiumCrafted}
      />
      <ResourceLabel
        name={"Advanced Power Source"}
        entityIndex={entityIndex}
        resourceId={BlockType.AdvancedPowerSourceCrafted}
      />
      <ResourceLabel
        name={"Penetrating Warhead"}
        entityIndex={entityIndex}
        resourceId={BlockType.PenetratingWarheadCrafted}
      />
      <ResourceLabel
        name={"Penetrating Missile"}
        entityIndex={entityIndex}
        resourceId={BlockType.PenetratingMissileCrafted}
      />
      <ResourceLabel
        name={"Tungsten Rods"}
        entityIndex={entityIndex}
        resourceId={BlockType.TungstenRodsCrafted}
      />
      <ResourceLabel
        name={"Iridium Crystal"}
        entityIndex={entityIndex}
        resourceId={BlockType.IridiumCrystalCrafted}
      />
      <ResourceLabel
        name={"Iridium Drillbit"}
        entityIndex={entityIndex}
        resourceId={BlockType.IridiumDrillbitCrafted}
      />
      <ResourceLabel
        name={"Laser Power Source"}
        entityIndex={entityIndex}
        resourceId={BlockType.LaserPowerSourceCrafted}
      />
      <ResourceLabel
        name={"Thermobaric Warhead"}
        entityIndex={entityIndex}
        resourceId={BlockType.ThermobaricWarheadCrafted}
      />
      <ResourceLabel
        name={"Thermobaric Missile"}
        entityIndex={entityIndex}
        resourceId={BlockType.ThermobaricMissileCrafted}
      />
      <ResourceLabel
        name={"Kimberlite Catalyst"}
        entityIndex={entityIndex}
        resourceId={BlockType.KimberliteCrystalCatalystCrafted}
      />
      <ResourceLabel
        name={"Electricity"}
        entityIndex={entityIndex}
        resourceId={BlockType.ElectricityPassiveResource}
      />
    </>
  );
}
