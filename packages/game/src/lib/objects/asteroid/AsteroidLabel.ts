import Phaser from "phaser";
import { PixelCoord } from "@primodiumxyz/engine/types";
import { Assets, Sprites } from "@primodiumxyz/assets";

import { MainbaseLevelToEmblem } from "@/lib/mappings";
import { PrimodiumScene } from "@/types";
import { DepthLayers } from "@/lib/constants/common";

const MARGIN = 2;

type LabelArgs = {
  ownerLabel: string;
  allianceLabel: string;
  emblemSprite: Sprites;
  nameLabel: string;
  ownerLabelColor: number;
  nameLabelColor: number;
  allianceLabelColor: number;
  ownerLabelOpacity: number;
};

export class AsteroidLabel extends Phaser.GameObjects.Container {
  private _scene: PrimodiumScene;
  private coord: PixelCoord;
  private labelContainer: Phaser.GameObjects.Container;
  emblemSprite: Phaser.GameObjects.Image;
  asteroidLabel: Phaser.GameObjects.BitmapText;
  ownerLabel: Phaser.GameObjects.BitmapText;
  allianceLabel: Phaser.GameObjects.BitmapText;
  private baseScale = 1;

  constructor(
    args: {
      scene: PrimodiumScene;
      coord: PixelCoord;
      asteroidLevel?: number;
    } & Partial<LabelArgs>
  ) {
    const {
      scene,
      coord,
      nameLabel: asteroidName = "Asteroid",
      asteroidLevel = 1,
      ownerLabel = "unowned",
      nameLabelColor: asteroidNameColor = 0xffffff,
      ownerLabelColor = 0xffffff,
      allianceLabelColor = 0xffffff,
    } = args;
    super(scene.phaserScene, coord.x, coord.y);

    this.coord = coord;
    this._scene = scene;

    this.emblemSprite = new Phaser.GameObjects.Image(
      scene.phaserScene,
      0,
      0,
      Assets.SpriteAtlas,
      MainbaseLevelToEmblem[asteroidLevel - 1]
    ).setScale(1.5);

    this.labelContainer = new Phaser.GameObjects.Container(
      scene.phaserScene,
      this.emblemSprite.width + MARGIN,
      -this.emblemSprite.height / 2
    );

    this.asteroidLabel = new Phaser.GameObjects.BitmapText(scene.phaserScene, 0, 0, "teletactile", asteroidName, 16)
      .setTintFill(asteroidNameColor)
      .setDropShadow(2, 2, 0x000000, 1);

    this.ownerLabel = new Phaser.GameObjects.BitmapText(scene.phaserScene, 0, 0, "teletactile", ownerLabel, 12)

      .setAlpha(0.5)
      .setTintFill(ownerLabelColor);

    this.allianceLabel = new Phaser.GameObjects.BitmapText(scene.phaserScene, 0, 0, "teletactile", undefined, 12)
      .setAlpha(0.8)
      .setTintFill(allianceLabelColor);

    this.labelContainer.add([this.asteroidLabel, this.ownerLabel, this.allianceLabel]);
    this.add([this.emblemSprite, this.labelContainer]);
    this._updatePositions();

    this.setDepth(DepthLayers.Marker);
  }

  private _updatePositions() {
    //set owner position
    this.allianceLabel.setPosition(0, this.asteroidLabel.height + MARGIN);
    this.ownerLabel.setPosition(this.allianceLabel.width, this.asteroidLabel.height + MARGIN);
  }

  setProperties(args: Partial<LabelArgs>) {
    args.nameLabel && this.asteroidLabel.setText(args.nameLabel);
    args.ownerLabel && this.ownerLabel.setText(args.ownerLabel);
    args.emblemSprite && this.emblemSprite.setTexture(Assets.SpriteAtlas, args.emblemSprite);
    args.nameLabelColor && this.asteroidLabel.setTintFill(args.nameLabelColor);
    args.ownerLabelColor && this.ownerLabel.setTintFill(args.ownerLabelColor);
    args.allianceLabel && this.allianceLabel.setText(`[${args.allianceLabel}]`);
    args.allianceLabelColor && this.allianceLabel.setTintFill(args.allianceLabelColor);
    args.ownerLabelOpacity && this.ownerLabel.setAlpha(args.ownerLabelOpacity);
    // args.textOpacity && this.labelContainer.setAlpha(args.textOpacity);

    this._updatePositions();
  }

  clearAlliance() {
    this.allianceLabel.setText("");
    this._updatePositions();
  }

  setBaseScale(scale: number) {
    this.baseScale = scale;
    return this;
  }

  override update() {
    const zoom = this._scene.camera.phaserCamera.zoom;
    this.setScale(this.baseScale / zoom);
  }
}
