import { Type } from "@latticexyz/recs";
import { world } from "../world";
import newComponent, {
  newBoolComponent,
  newNumberComponent,
  newStringComponent,
} from "./customComponents/Component";

export const Counter = newComponent(
  world,
  { value: Type.Number },
  { metadata: { contractId: "component.Counter" } }
);

export const BuildingType = newComponent(
  world,
  { value: Type.Entity },
  {
    metadata: { contractId: "component.Tile" },
    overridable: true,
  }
);

export const Path = newStringComponent(world, {
  metadata: { contractId: "component.Path", overridable: true },
});

export const OwnedBy = newStringComponent(world, {
  metadata: { contractId: "component.OwnedBy" },
  overridable: true,
});

export const LastBuiltAt = newNumberComponent(world, {
  metadata: { contractId: "component.LastBuiltAt" },
  overridable: true,
});

export const LastClaimedAt = newNumberComponent(world, {
  metadata: { contractId: "component.LastClaimedAt" },
  overridable: true,
});

export const Health = newNumberComponent(world, {
  metadata: { contractId: "component.Health" },
});

export const Item = newNumberComponent(world, {
  metadata: { contractId: "component.Item" },
});

export const Research = newBoolComponent(world, {
  metadata: { contractId: "component.Research" },
});

export const StarterPackInitialized = newBoolComponent(world, {
  metadata: { contractId: "component.StarterPackInitialized" },
});

export const MainBase = newComponent(
  world,
  { value: Type.Entity },
  { metadata: { contractId: "component.MainBaseInitialized" } }
);

export const RequiredResearchComponent = newNumberComponent(world, {
  metadata: { contractId: "component.RequiredResearch" },
});

export const RequiredResourcesComponent = newComponent(
  world,
  { value: Type.EntityArray },
  { metadata: { contractId: "component.RequiredResourcesComponent" } }
);

export const MaxLevel = newNumberComponent(world, {
  metadata: { contractId: "component.MaxLevel" },
  overridable: true,
});

export const BuildingLevel = newNumberComponent(world, {
  metadata: { contractId: "component.BuildingLevel" },
  overridable: true,
});

export const StorageCapacity = newNumberComponent(world, {
  metadata: { contractId: "component.StorageCapacity" },
  overridable: true,
});

export const StorageCapacityResources = newComponent(
  world,
  { value: Type.EntityArray },
  { metadata: { contractId: "component.StorageCapacityResources" } }
);

export const Mine = newNumberComponent(world, {
  metadata: { contractId: "component.Mine" },
  overridable: true,
});

export const BuildingLimit = newNumberComponent(world, {
  metadata: { contractId: "component.BuildingLimit" },
  overridable: true,
});

export const BuildingTiles = newComponent(
  world,
  { value: Type.EntityArray },
  { metadata: { contractId: "component.BuildingTiles" } }
);

export const RawBlueprint = newComponent(
  world,
  { value: Type.NumberArray },
  { metadata: { contractId: "component.Blueprint" } }
);

export const UnclaimedResource = newNumberComponent(world, {
  metadata: { contractId: "component.UnclaimedResource" },
});

export const SystemsRegistry = newStringComponent(world, {
  metadata: { contractId: "world.component.systems" },
  id: "SystemsRegistry",
});

export const ComponentsRegistry = newStringComponent(world, {
  id: "ComponentsRegistry",
  metadata: { contractId: "world.component.components" },
});

export const LoadingState = newComponent(
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
