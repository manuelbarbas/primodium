import { Coord } from "@latticexyz/utils";
import { Scene } from "engine/types";
import { BaseAsteroid } from "./BaseAsteroid";
import { Sprites } from "@primodiumxyz/assets";
import { DepthLayers } from "@/game/lib/constants/common";
import { Entity } from "@latticexyz/recs";

export class ShardAsteroid extends BaseAsteroid {
  constructor(args: { id: Entity; scene: Scene; coord: Coord }) {
    const { id, scene, coord } = args;
    super({ id, scene, coord, sprite: Sprites.Shard, outlineSprite: Sprites.AegisDrone });
    this.asteroidSprite.preFX?.addShine();
    this.asteroidLabel.setProperties({
      emblemSprite: Sprites.ShardIcon,
      nameLabel: "Shard",
      nameLabelColor: 0xffc0cb,
      ownerLabel: "shard",
    });
    this.setDepth(DepthLayers.Marker);
  }

  spawn() {
    super.spawn();
    this.setLOD(1, true);
    return this;
  }

  update() {
    super.update();
    const zoom = this._scene.camera.phaserCamera.zoom;
    const minZoom = this._scene.config.camera.minZoom;
    const maxZoom = this._scene.config.camera.maxZoom;

    // Normalize the zoom level
    const normalizedZoom = (zoom - minZoom) / (maxZoom - minZoom);

    if (normalizedZoom >= 0.1) {
      this.setLOD(0);
      this.asteroidLabel.setProperties({
        emblemSprite: Sprites.EMPTY,
      });
      return;
    }
    if (normalizedZoom >= 0) {
      this.setLOD(1);
      this.asteroidLabel.setProperties({
        emblemSprite: Sprites.ShardIcon,
      });
      return;
    }
  }

  // setRelationship(relationship: AsteroidRelationship) {
  //   this.outlineSprite.setTexture(getSecondaryOutlineSprite(relationship, 1n));
  // }
}
