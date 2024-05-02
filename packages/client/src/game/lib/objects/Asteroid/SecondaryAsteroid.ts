import { Coord } from "@latticexyz/utils";
import { Scene } from "engine/types";
import { BaseAsteroid } from "./BaseAsteroid";
import { getSecondaryOutlineSprite, getSecondarySprite } from "./helpers";
import { Entity } from "@latticexyz/recs";
import { AsteroidRelationship } from "../../constants/common";

export class SecondaryAsteroid extends BaseAsteroid {
  private maxLevel: bigint;
  constructor(
    scene: Scene,
    coord: Coord,
    resourceType: Entity,
    maxLevel: bigint,
    relationship: AsteroidRelationship = "Neutral"
  ) {
    super({
      scene,
      coord,
      sprite: getSecondarySprite(resourceType, maxLevel),
      outlineSprite: getSecondaryOutlineSprite(relationship, maxLevel),
    });

    this._scene = scene;

    this.maxLevel = maxLevel;
    this.setLOD(2, true);
    this.getAsteroidLabel().setBaseScale(0.75);
  }

  setRelationship(relationship: AsteroidRelationship) {
    this.outlineSprite.setTexture(getSecondaryOutlineSprite(relationship, this.maxLevel));
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
      return;
    }
    if (normalizedZoom >= 0.05) {
      this.setLOD(1);
      return;
    }
    if (normalizedZoom >= 0) {
      this.setLOD(2);
      return;
    }
  }
}
