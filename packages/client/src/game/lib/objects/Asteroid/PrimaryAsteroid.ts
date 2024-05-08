import { Coord } from "@latticexyz/utils";
import { Scene } from "engine/types";
import { BaseAsteroid } from "./BaseAsteroid";
import { getPrimaryOutlineSprite, getPrimarySprite } from "./helpers";
import { AsteroidRelationship } from "../../constants/common";
import { Assets } from "@primodiumxyz/assets";
import { Entity } from "@latticexyz/recs";

export class PrimaryAsteroid extends BaseAsteroid {
  constructor(args: { id: Entity; scene: Scene; coord: Coord; level: bigint; relationship?: AsteroidRelationship }) {
    const { id, scene, coord, level = 1n, relationship = "Enemy" } = args;
    super({
      id,
      scene,
      coord,
      sprite: getPrimarySprite(level),
      outlineSprite: getPrimaryOutlineSprite(relationship),
    });
  }
  spawn() {
    super.spawn();
    this.setLOD(1, true);
    return this;
  }

  setLevel(level: bigint) {
    this.asteroidSprite.setTexture(Assets.SpriteAtlas, getPrimarySprite(level));

    return this;
  }

  // setRelationship(relationship: AsteroidRelationship) {
  //   // this.outlineSprite.setTexture(Assets.SpriteAtlas, getPrimaryOutlineSprite(relationship));

  //   return this;
  // }

  update() {
    super.update();
    const zoom = this._scene.camera.phaserCamera.zoom;
    const minZoom = this._scene.config.camera.minZoom;
    const maxZoom = this._scene.config.camera.maxZoom;

    // return;

    // Normalize the zoom level
    const normalizedZoom = (zoom - minZoom) / (maxZoom - minZoom);

    if (normalizedZoom >= 0.1) {
      this.setLOD(0);
      return;
    }
    if (normalizedZoom >= 0) {
      this.setLOD(1);
      return;
    }
  }
}
