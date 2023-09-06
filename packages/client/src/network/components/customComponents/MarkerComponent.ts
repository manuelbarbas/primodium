import { addCoords } from "@latticexyz/phaserx";
import {
  EntityID,
  Has,
  HasValue,
  Metadata,
  World,
  createEntity,
  removeComponent,
  runQuery,
  withValue,
} from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { getBuildingsOfTypeInRange, getTilesOfTypeInRange } from "src/util/tile";
import { ContractCoord } from "src/util/types";
import { Position } from "../chainComponents";
import { Marker } from "../clientComponents";
import { Options, newStringComponent } from "./ExtendedComponent";

function newMarkerComponent<Overridable extends boolean, M extends Metadata>(
  world: World,
  options?: Options<Overridable, M>
) {
  const component = newStringComponent(world, options);
  const setWithCoord = (coord: ContractCoord, type: EntityID) => {
    const entities = Position.getAllWith(coord);
    //check if there is an entity with given coord, if not create one and add position
    if (entities.length == 0) {
      //create entity
      const entity = createEntity(world, [withValue(Position, coord), withValue(Marker, { value: type })]);

      return entity;
    } else {
      const entity = entities.values().next().value;
      component.set({ value: type }, entity);

      return entity;
    }
  };

  const target = async (
    tile: EntityID,
    type: EntityID,
    origin: ContractCoord,
    range: number,
    excludeRange: number = 0,
    offset: Coord = { x: 0, y: 0 }
  ) => {
    const tiles = getTilesOfTypeInRange(origin, tile, range, excludeRange);

    const buildings = getBuildingsOfTypeInRange(origin, tile, range);

    //handle terrain
    for (const tile of tiles) {
      Position.set({ ...addCoords(tile, offset), parent: origin.parent }, type);
    }

    //handle buildings
    for (const building of buildings) {
      Position.set({ ...addCoords(building, offset), parent: origin.parent }, type);
    }
  };

  const getByCoord = (coord: Coord) => {
    const entities = runQuery([Has(component), HasValue(Position, coord)]);

    return entities;
  };

  const removeAllAtCoord = (coord: Coord) => {
    const entities = runQuery([HasValue(Position, coord), Has(component)]);

    const entityIndex = entities.values().next().value;

    removeComponent(component, entityIndex);
  };

  return { ...component, setWithCoord, target, getByCoord, removeAllAtCoord };
}

export default newMarkerComponent;
