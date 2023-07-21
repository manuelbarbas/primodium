import { Perlin } from "@latticexyz/noise";
import { addCoords } from "@latticexyz/phaserx";
import {
  EntityID,
  Has,
  HasValue,
  Metadata,
  World,
  getEntitiesWithValue,
  createEntity,
  removeComponent,
  runQuery,
  withValue,
} from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { Options, StringComponent } from "./Component";
import {
  getBuildingsOfTypeInRange,
  getTilesOfTypeInRange,
} from "src/util/tile";
import { Marker, Position } from "../clientComponents";
import { world } from "src/network/world";

class MarkerTypeComponent<M extends Metadata> extends StringComponent<M> {
  constructor(world: World, options?: Options<M>) {
    super(world, options);
  }
  public setWithCoord = (coord: Coord, type: EntityID) => {
    const entities = getEntitiesWithValue(Position, coord);

    //check if there is an entity with given coord, if not create one and add position
    if (!entities.size) {
      //create entity
      const entity = createEntity(world, [
        withValue(Position, coord),
        withValue(Marker, { value: type }),
      ]);

      return entity;
    } else {
      const entity = entities.values().next().value;
      this.set({ value: type }, entity);

      return entity;
    }
  };

  public target = async (
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
      Position.set(addCoords(tile, offset), type);
    }

    //handle buildings
    for (const building of buildings) {
      Position.set(addCoords(building, offset), type);
    }
  };

  public getByCoord = (coord: Coord) => {
    const entities = runQuery([Has(this.component), HasValue(Position, coord)]);

    return entities;
  };

  public removeAllAtCoord = (coord: Coord) => {
    const entities = runQuery([HasValue(Position, coord), Has(this.component)]);

    const entityIndex = entities.values().next().value;

    removeComponent(this.component, entityIndex);
  };
}

export default MarkerTypeComponent;
