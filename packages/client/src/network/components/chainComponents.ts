import { Type } from "@latticexyz/recs";
import Component, {
  BoolComponent,
  CoordComponent,
  NumberComponent,
  StringComponent,
} from "../Component";
import { world } from "../world";

const components = {
  Counter: new Component(
    world,
    { value: Type.Number },
    { metadata: { contractId: "component.Counter" } }
  ),
  Position: new CoordComponent(world, { overridable: true }),
  BuildingType: new StringComponent(world, {
    metadata: { contractId: "component.Tile" },
    overridable: true,
  }),
  Path: new StringComponent(world, {
    metadata: { contractId: "component.Path", overridable: true },
  }),
  OwnedBy: new StringComponent(world, {
    metadata: { contractId: "component.OwnedBy" },
    overridable: true,
  }),
  LastBuiltAt: new NumberComponent(world, {
    metadata: { contractId: "component.LastBuiltAt" },
    overridable: true,
  }),
  LastClaimedAt: new NumberComponent(world, {
    metadata: { contractId: "component.LastClaimedAt" },
    overridable: true,
  }),
  Health: new NumberComponent(world, {
    metadata: { contractId: "component.Health" },
  }),
  Item: new NumberComponent(world, {
    metadata: { contractId: "component.Item" },
  }),
  Research: new BoolComponent(world, {
    metadata: { contractId: "component.Research" },
  }),
  // starter pack initialized

  StarterPackInitialized: new BoolComponent(world, {
    metadata: { contractId: "component.StarterPackInitialized" },
  }),
  MainBaseInitialized: new Component(
    world,
    { value: Type.Entity },
    { metadata: { contractId: "component.MainBaseInitialized" } }
  ),
  RequiredResearchComponent: new NumberComponent(world, {
    metadata: { contractId: "component.RequiredResearch" },
  }),
  RequiredResourcesComponent: new Component(
    world,
    { value: Type.EntityArray },
    { metadata: { contractId: "component.RequiredResourcesComponent" } }
  ),
  MaxLevel: new NumberComponent(world, {
    metadata: { contractId: "component.MaxLevel" },
    overridable: true,
  }),
  BuildingLevel: new NumberComponent(world, {
    metadata: { contractId: "component.BuildingLevel" },
    overridable: true,
  }),
  StorageCapacity: new NumberComponent(world, {
    metadata: { contractId: "component.StorageCapacity" },
    overridable: true,
  }),
  StorageCapacityResources: new Component(
    world,
    { value: Type.EntityArray },
    { metadata: { contractId: "component.StorageCapacityResources" } }
  ),
  Mine: new NumberComponent(world, {
    metadata: { contractId: "component.Mine" },
    overridable: true,
  }),
  BuildingLimit: new NumberComponent(world, {
    metadata: { contractId: "component.BuildingLimit" },
    overridable: true,
  }),

  BuildingTiles: new Component(
    world,
    { value: Type.EntityArray },
    { metadata: { contractId: "component.BuildingTiles" } }
  ),
  RawBlueprint: new Component(
    world,
    { value: Type.NumberArray },
    { metadata: { contractId: "component.Blueprint" } }
  ),
  UnclaimedResource: new NumberComponent(world, {
    metadata: { contractId: "component.UnclaimedResource" },
  }),
};

export default components;
