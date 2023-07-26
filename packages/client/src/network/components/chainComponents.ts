import { Type } from "@latticexyz/recs";
import { world } from "../world";
import newComponent, {
  newBoolComponent,
  newNumberComponent,
  newStringComponent,
} from "./customComponents/Component";

const commonIdPrefix = "component.";

export const Counter = newComponent(
  world,
  { value: Type.Number },
  { id: "Counter", metadata: { contractId: `${commonIdPrefix}Counter` } }
);

export const BuildingType = newComponent(
  world,
  { value: Type.Entity },
  {
    id: "BuildingType",
    metadata: { contractId: `${commonIdPrefix}Tile` },
    overridable: true,
  }
);

export const RawBlueprint = newComponent(
  world,
  { value: Type.NumberArray },
  { id: "RawBlueprint", metadata: { contractId: `${commonIdPrefix}Blueprint` } }
);

export const UnclaimedResource = newNumberComponent(world, {
  id: "UnclaimedResource",
  metadata: { contractId: `${commonIdPrefix}UnclaimedResource` },
});

export const SystemsRegistry = newStringComponent(world, {
  id: "SystemsRegistry",
  metadata: { contractId: "world.component.systems" },
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
    metadata: { contractId: `${commonIdPrefix}LoadingState` },
  }
);
export const Health = newNumberComponent(world, {
  id: "Health",
  metadata: { contractId: `${commonIdPrefix}Health` },
});

export const Item = newNumberComponent(world, {
  id: "Item",
  metadata: { contractId: `${commonIdPrefix}Item` },
});

export const Research = newBoolComponent(world, {
  id: "Research",
  metadata: { contractId: `${commonIdPrefix}Research` },
});

export const StarterPackInitialized = newBoolComponent(world, {
  id: "StarterPackInitialized",
  metadata: { contractId: `${commonIdPrefix}StarterPackInitialized` },
});

export const MainBase = newComponent(
  world,
  { value: Type.Entity },
  {
    id: "MainBase",
    metadata: { contractId: `${commonIdPrefix}MainBaseInitialized` },
  }
);

export const RequiredResearchComponent = newNumberComponent(world, {
  id: "RequiredResearchComponent",
  metadata: { contractId: `${commonIdPrefix}RequiredResearch` },
});

export const RequiredResourcesComponent = newComponent(
  world,
  { value: Type.EntityArray },
  {
    id: "RequiredResourcesComponent",
    metadata: { contractId: `${commonIdPrefix}RequiredResourcesComponent` },
  }
);

export const MaxLevel = newNumberComponent(world, {
  id: "MaxLevel",
  metadata: { contractId: `${commonIdPrefix}MaxLevel` },
  overridable: true,
});

export const BuildingLevel = newNumberComponent(world, {
  id: "BuildingLevel",
  metadata: { contractId: `${commonIdPrefix}BuildingLevel` },
  overridable: true,
});

export const StorageCapacity = newNumberComponent(world, {
  id: "StorageCapacity",
  metadata: { contractId: `${commonIdPrefix}StorageCapacity` },
  overridable: true,
});

export const StorageCapacityResources = newComponent(
  world,
  { value: Type.EntityArray },
  {
    id: "StorageCapacityResources",
    metadata: { contractId: `${commonIdPrefix}StorageCapacityResources` },
  }
);

export const Mine = newNumberComponent(world, {
  id: "Mine",
  metadata: { contractId: `${commonIdPrefix}Mine` },
  overridable: true,
});

export const BuildingLimit = newNumberComponent(world, {
  id: "BuildingLimit",
  metadata: { contractId: `${commonIdPrefix}BuildingLimit` },
  overridable: true,
});

export const BuildingTiles = newComponent(
  world,
  { value: Type.EntityArray },
  {
    id: "BuildingTiles",
    metadata: { contractId: `${commonIdPrefix}BuildingTiles` },
  }
);

export const Path = newStringComponent(world, {
  id: "Path",
  metadata: { contractId: `${commonIdPrefix}Path` },
  overridable: true,
});

export const OwnedBy = newComponent(
  world,
  { value: Type.Entity },
  {
    id: "OwnedBy",
    metadata: { contractId: `${commonIdPrefix}OwnedBy` },
    overridable: true,
  }
);

export const LastClaimedAt = newNumberComponent(world, {
  id: "LastClaimedAt",
  metadata: { contractId: `${commonIdPrefix}LastClaimedAt` },
  overridable: true,
});

export const IsDebug = newBoolComponent(world, {
  id: "IsDebug",
  metadata: { contractId: `${commonIdPrefix}IsDebug` },
});
export default {
  Counter,
  BuildingType,
  Path,
  OwnedBy,
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
