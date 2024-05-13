import { Coord } from "engine/types";
import { PrimodiumScene } from "@/game/api/scene";
import { BaseAsteroid } from "./BaseAsteroid";
import { Sprites } from "@primodiumxyz/assets";
import { DepthLayers } from "@/game/lib/constants/common";
import { Entity } from "@latticexyz/recs";

export class ShardAsteroid extends BaseAsteroid {
  constructor(args: { id: Entity; scene: PrimodiumScene; coord: Coord }) {
    const { id, scene, coord } = args;
    super({ id, scene, coord, sprite: Sprites.Shard, outlineSprite: Sprites.AegisDrone });
    this.asteroidSprite.postFX?.addShine();
    this.asteroidLabel.setProperties({
      emblemSprite: Sprites.ShardIcon,
      nameLabel: "Shard",
      nameLabelColor: 0xffc0cb,
      ownerLabel: "shard",
    });
    this.setDepth(DepthLayers.Marker);
    this.setScale(0.75);
  }

  spawn() {
    super.spawn();
    return this;
  }

  getLod(zoom: number) {
    if (zoom >= 0.75) {
      return 0;
    }
    if (zoom >= 0) {
      return 1;
    }

    return 0;
  }

  // setRelationship(relationship: AsteroidRelationship) {
  //   this.outlineSprite.setTexture(getSecondaryOutlineSprite(relationship, 1n));
  // }
}
