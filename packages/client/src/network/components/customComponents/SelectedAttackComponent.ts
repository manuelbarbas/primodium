import { Metadata, Type, World } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { getAttackRadius, isValidWeaponStorage } from "src/util/attack";
import { getEntityTileAtCoord } from "src/util/tile";
import Component, { Options } from "./Component";

class SelectedAttackComponent<M extends Metadata> extends Component<
  { origin: Type.OptionalString; target: Type.OptionalString },
  M
> {
  constructor(world: World, options?: Options<M>) {
    super(
      world,
      { origin: Type.OptionalString, target: Type.OptionalString },
      options
    );
  }

  public getCoords = () => {
    const value = this.get();

    return {
      origin: (JSON.parse(value?.origin ?? "null") ?? undefined) as
        | Coord
        | undefined,
      target: (JSON.parse(value?.target ?? "null") ?? undefined) as
        | Coord
        | undefined,
    };
  };

  public setOrigin = (coord: Coord) => {
    const originEntityBuilding = getEntityTileAtCoord(coord);

    //if origin entity is not a weapon storage or empty, reset selection
    if (!originEntityBuilding || !isValidWeaponStorage(originEntityBuilding)) {
      console.warn("Origin is not valid");
      this.remove();
      return;
    }

    this.update({ origin: JSON.stringify(coord) });
  };

  public setTarget = (coord: Coord) => {
    const selectedAttackTiles = this.getCoords();

    if (!selectedAttackTiles.origin) {
      console.log("origin is not set");
      return;
    }

    const targetEntityBuilding = getEntityTileAtCoord(coord);

    //check if target is valid
    if (!targetEntityBuilding) {
      console.warn("Target is not valid");
      return;
    }

    const originEntityBuilding = getEntityTileAtCoord(
      selectedAttackTiles.origin
    );

    if (!originEntityBuilding) {
      console.warn("Origin is not valid");
      return;
    }

    //check if target is in attack radius
    const attackRadius = getAttackRadius(originEntityBuilding);

    // compare x and y values of start and end
    const xDiff = Math.abs(selectedAttackTiles.origin.x - coord.x);
    const yDiff = Math.abs(selectedAttackTiles.origin.y - coord.y);

    if (xDiff > attackRadius || yDiff > attackRadius) {
      console.warn("Target is not in attack radius");
      return;
    } else if (xDiff === 0 && yDiff === 0) {
      console.warn("Target is the same as origin");
      return;
    }

    this.update({ target: JSON.stringify(coord) });
  };
}

export default SelectedAttackComponent;
