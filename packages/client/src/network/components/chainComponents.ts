import { Type } from "@latticexyz/recs";
import Component, {
  BoolComponent,
  NumberComponent,
  StringComponent,
} from "./customComponents/Component";
import { world } from "../world";

export const Counter = new Component(
  world,
  { value: Type.Number },
  { metadata: { contractId: "component.Counter" } }
);

export const BuildingType = new Component(
  world,
  { value: Type.Entity },
  {
    metadata: { contractId: "component.Tile" },
    overridable: true,
  }
);

export const Path = new StringComponent(world, {
  metadata: { contractId: "component.Path", overridable: true },
});

export const OwnedBy = new StringComponent(world, {
  metadata: { contractId: "component.OwnedBy" },
  overridable: true,
});

export const LastBuiltAt = new NumberComponent(world, {
  metadata: { contractId: "component.LastBuiltAt" },
  overridable: true,
});

export const LastClaimedAt = new NumberComponent(world, {
  metadata: { contractId: "component.LastClaimedAt" },
  overridable: true,
});

export const Health = new NumberComponent(world, {
  metadata: { contractId: "component.Health" },
});

export const Item = new NumberComponent(world, {
  metadata: { contractId: "component.Item" },
});

export const Research = new BoolComponent(world, {
  metadata: { contractId: "component.Research" },
});

export const StarterPackInitialized = new BoolComponent(world, {
  metadata: { contractId: "component.StarterPackInitialized" },
});

export const MainBase = new Component(
  world,
  { value: Type.Entity },
  { metadata: { contractId: "component.MainBaseInitialized" } }
);

export const RequiredResearchComponent = new NumberComponent(world, {
  metadata: { contractId: "component.RequiredResearch" },
});

export const RequiredResourcesComponent = new Component(
  world,
  { value: Type.EntityArray },
  { metadata: { contractId: "component.RequiredResourcesComponent" } }
);

export const MaxLevel = new NumberComponent(world, {
  metadata: { contractId: "component.MaxLevel" },
  overridable: true,
});

export const BuildingLevel = new NumberComponent(world, {
  metadata: { contractId: "component.BuildingLevel" },
  overridable: true,
});

export const StorageCapacity = new NumberComponent(world, {
  metadata: { contractId: "component.StorageCapacity" },
  overridable: true,
});

export const StorageCapacityResources = new Component(
  world,
  { value: Type.EntityArray },
  { metadata: { contractId: "component.StorageCapacityResources" } }
);

export const Mine = new NumberComponent(world, {
  metadata: { contractId: "component.Mine" },
  overridable: true,
});

export const BuildingLimit = new NumberComponent(world, {
  metadata: { contractId: "component.BuildingLimit" },
  overridable: true,
});

export const BuildingTiles = new Component(
  world,
  { value: Type.EntityArray },
  { metadata: { contractId: "component.BuildingTiles" } }
);

export const RawBlueprint = new Component(
  world,
  { value: Type.NumberArray },
  { metadata: { contractId: "component.Blueprint" } }
);

export const UnclaimedResource = new NumberComponent(world, {
  metadata: { contractId: "component.UnclaimedResource" },
});

export const SystemsRegistry = new StringComponent(world, {
  metadata: { contractId: "world.component.systems" },
  id: "SystemsRegistry",
});

export const ComponentsRegistry = new StringComponent(world, {
  id: "ComponentsRegistry",
  metadata: { contractId: "world.component.components" },
});

export const LoadingState = new Component(
  world,
  {
    state: Type.Number,
    msg: Type.String,
    percentage: Type.Number,
  },
  {
    id: "LoadingState",
    metadata: { contractId: "component.LoadingState" },
  }
);

export default {
  Counter,
  BuildingType,
  Path,
  OwnedBy,
  LastBuiltAt,
  LastClaimedAt,
  Health,
  Item,
  Research,
  StarterPackInitialized,
  MainBase,
  RequiredResearchComponent,
  RequiredResourcesComponent,
  MaxLevel,
  BuildingLevel,
  StorageCapacity,
  StorageCapacityResources,
  Mine,
  BuildingLimit,
  BuildingTiles,
  RawBlueprint,
  UnclaimedResource,
  SystemsRegistry,
  ComponentsRegistry,
  LoadingState,
};
