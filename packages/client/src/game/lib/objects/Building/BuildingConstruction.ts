import Phaser from "phaser";
import { Coord } from "engine/types";
import { PrimodiumScene } from "@/game/api/scene";
import { BuildingDimensions, getConstructionSprite } from "./helpers";
import { IPrimodiumGameObject } from "../interfaces";
import { DepthLayers } from "../../constants/common";
import { Assets } from "@primodiumxyz/assets";
import { Entity } from "@latticexyz/recs";

export class BuildingConstruction extends Phaser.GameObjects.Container implements IPrimodiumGameObject {
  private id: Entity;
  private coord: Coord;
  private _scene: PrimodiumScene;
  private spawned = false;
  private sprite: Phaser.GameObjects.Sprite;
  private text: Phaser.GameObjects.BitmapText;

  constructor(args: {
    id: Entity;
    scene: PrimodiumScene;
    coord: Coord;
    buildingDimensions: BuildingDimensions;
    queueText?: string;
  }) {
    const { id, scene, coord, buildingDimensions, queueText } = args;
    const pixelCoord = scene.utils.tileCoordToPixelCoord(coord);
    super(scene.phaserScene, pixelCoord.x, -pixelCoord.y + scene.tiled.tileHeight);

    this.id = id;

    const spriteName = getConstructionSprite(buildingDimensions);
    if (!spriteName) console.warn("No construction sprite found for building dimensions: ", buildingDimensions);
    this.sprite = this.scene.add
      .sprite(0, 0, Assets.SpriteAtlas, spriteName)
      .setOrigin(0, 1)
      .setDepth(DepthLayers.Building - coord.y);

    this.text = this.scene.add
      .bitmapText(
        (scene.tiled.tileWidth * buildingDimensions.width) / 2,
        -(scene.tiled.tileHeight * buildingDimensions.height) / 2,
        "teletactile",
        queueText ?? undefined,
        14
      )
      .setTintFill(0x34d399)
      .setDepth(DepthLayers.Marker)
      .setOrigin(0.5);

    this.add([this.sprite, this.text]);
    this.setDepth(DepthLayers.Building - 5 * coord.y);

    this.coord = coord;
    this._scene = scene;

    this._scene.objects.constructionBuilding.add(id, this);
    this._scene.audio.play("Build", "sfx", { loop: true });
  }

  setQueueText(text: string) {
    this.text.setText(text);
    return this;
  }

  spawn() {
    //TODO: placement animation
    this.scene.add.existing(this);
    this.spawned = true;
    return this;
  }

  getCoord(): Coord {
    return this.coord;
  }

  isSpawned() {
    return this.spawned;
  }

  destroy() {
    this._scene.audio.get("Build", "sfx")?.stop();

    this._scene.objects.constructionBuilding.remove(this.id);
    super.destroy();
  }
}
