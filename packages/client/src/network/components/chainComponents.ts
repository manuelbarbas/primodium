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
    metadata: { contractId: `${commonIdPrefix}BuildingType` },
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

export const Item = newNumberComponent(world, {
  id: "Item",
  metadata: { contractId: `${commonIdPrefix}Item` },
});

export const HasResearched = newBoolComponent(world, {
  id: "HasResearched",
  metadata: { contractId: `${commonIdPrefix}HasResearched` },
});

export const MainBase = newComponent(
  world,
  { value: Type.Entity },
  {
    id: "MainBase",
    metadata: { contractId: `${commonIdPrefix}MainBase` },
  }
);

export const RequiredResearch = newNumberComponent(world, {
  id: "RequiredResearch",
  metadata: { contractId: `${commonIdPrefix}RequiredResearch` },
});

export const RequiredResources = newComponent(
  world,
  { resources: Type.EntityArray, values: Type.NumberArray },

  {
    id: "RequiredResources",
    metadata: { contractId: `${commonIdPrefix}RequiredResources` },
  }
);

export const MaxLevel = newNumberComponent(world, {
  id: "MaxLevel",
  metadata: { contractId: `${commonIdPrefix}MaxLevel` },
  overridable: true,
});

export const Level = newNumberComponent(world, {
  id: "Level",
  metadata: { contractId: `${commonIdPrefix}Level` },
  overridable: true,
});

export const MaxStorage = newNumberComponent(world, {
  id: "MaxStorage",
  metadata: { contractId: `${commonIdPrefix}MaxStorage` },
  overridable: true,
});

export const MineProduction = newNumberComponent(world, {
  id: "MineProduction",
  metadata: { contractId: `${commonIdPrefix}MineProduction` },
  overridable: true,
});

export const MaxBuildings = newNumberComponent(world, {
  id: "MaxBuildings",
  metadata: { contractId: `${commonIdPrefix}MaxBuildings` },
  overridable: true,
});

export const Children = newComponent(
  world,
  { value: Type.EntityArray },
  {
    id: "Children",
    metadata: { contractId: `${commonIdPrefix}Children` },
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
  IsDebug,
  Item,
  HasResearched,
  MainBase,
  RequiredResearch,
  RequiredResources,
  MaxLevel,
  Level,
  MaxStorage,
  MineProduction,
  MaxBuildings,
  Children,
  RawBlueprint,
  UnclaimedResource,
  SystemsRegistry,
  ComponentsRegistry,
  LoadingState,
};
