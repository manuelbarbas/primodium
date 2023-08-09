import { Perlin } from "@latticexyz/noise";
import { addCoords } from "@latticexyz/phaserx";
import {
  EntityID,
  Has,
  HasValue,
  Metadata,
  World,
  createEntity,
  getEntitiesWithValue,
  removeComponent,
  runQuery,
  withValue,
} from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import {
  getBuildingsOfTypeInRange,
  getTilesOfTypeInRange,
} from "src/util/tile";
import { Position } from "../chainComponents";
import { Marker } from "../clientComponents";
import { Options, newStringComponent } from "./Component";

function newMarkerComponent<Overridable extends boolean, M extends Metadata>(
  world: World,
  options?: Options<Overridable, M>
) {
  const component = newStringComponent(world, options);
  const setWithCoord = (coord: Coord, type: EntityID) => {
    const entities = getEntitiesWithValue(Position, coord);

    //check if there is an entity with given coord, if not create one and add position
    if (!entities.size) {
      //create entity
      const entity = createEntity(world, [
        withValue(Position, { ...coord, parent: "0" as EntityID }),
        withValue(Marker, { value: type }),
      ]);

      return entity;
    } else {
      const entity = entities.values().next().value;
      component.set({ value: type }, entity);

      return entity;
    }
  };

  const target = async (
    perlin: Perlin,
    tile: EntityID,
    type: EntityID,
    origin: Coord,
    range: number,
    excludeRange: number = 0,
    offset: Coord = { x: 0, y: 0 }
  ) => {
    const tiles = getTilesOfTypeInRange(
      origin,
      tile,
      range,
      excludeRange,
      perlin
    );

    const buildings = getBuildingsOfTypeInRange(origin, tile, range);

    //handle terrain
    for (const tile of tiles) {
      Position.set(
        { ...addCoords(tile, offset), parent: "0" as EntityID },
        type
      );
    }

    //handle buildings
    for (const building of buildings) {
      Position.set(
        { ...addCoords(building, offset), parent: "0" as EntityID },
        type
      );
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
