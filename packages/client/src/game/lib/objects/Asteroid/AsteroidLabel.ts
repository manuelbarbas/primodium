import { MainbaseLevelToEmblem } from "@/game/lib/mappings";
import { FleetsContainer } from "@/game/lib/objects/Asteroid/FleetsContainer";
import { Assets, Sprites } from "@primodiumxyz/assets";
import { PixelCoord, Scene } from "engine/types";

const MARGIN = 5;

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
  private _scene: Scene;
  private coord: PixelCoord;
  private labelContainer: Phaser.GameObjects.Container;
  emblemSprite: Phaser.GameObjects.Image;
  asteroidLabel: Phaser.GameObjects.BitmapText;
  ownerLabel: Phaser.GameObjects.BitmapText;
  allianceLabel: Phaser.GameObjects.BitmapText;
  fleetsContainer: FleetsContainer | undefined;
  private baseScale = 1;

  constructor(
    args: {
      scene: Scene;
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

    this.labelContainer = new Phaser.GameObjects.Container(scene.phaserScene, 0, 0);

    this.asteroidLabel = new Phaser.GameObjects.BitmapText(scene.phaserScene, 0, 0, "teletactile", asteroidName, 16)
      .setTintFill(asteroidNameColor)
      .setDropShadow(2, 2, 0x000000, 1);

    this.ownerLabel = new Phaser.GameObjects.BitmapText(scene.phaserScene, 0, 0, "teletactile", ownerLabel, 12)

      .setAlpha(0.5)
      .setTintFill(ownerLabelColor)
      .setCharacterTint(1, -1, true, 0xffffff)
      .setCharacterTint(0, 1, true, 0xffffff);

    this.allianceLabel = new Phaser.GameObjects.BitmapText(scene.phaserScene, 0, 0, "teletactile", undefined, 12)
      .setAlpha(0.8)
      .setTintFill(allianceLabelColor);

    this._updatePositions();
    this.labelContainer.add([this.asteroidLabel, this.ownerLabel, this.allianceLabel]);
    this.add([this.emblemSprite, this.labelContainer]);
    this.setDepth(10000000);
  }

  private _updatePositions() {
    const startX = this.emblemSprite.width + MARGIN;
    this.asteroidLabel.setPosition(startX, 0);
    this.allianceLabel.setPosition(startX, this.asteroidLabel.height + MARGIN);
    this.ownerLabel.setPosition(
      this.allianceLabel.text ? startX + this.allianceLabel.width + MARGIN : startX,
      this.allianceLabel.y
    );

    //TODO: find a more reliable method of getting rendered height. Using phaser methods returns unusable values
    if (this.fleetsContainer) this.fleetsContainer.setPosition(startX, this.ownerLabel.y + 20 + MARGIN);

    //center labels with emblem
    this.labelContainer.setY(-16);
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

  setBaseScale(scale: number) {
    this.baseScale = scale;
    return this;
  }

  update() {
    const zoom = this._scene.camera.phaserCamera.zoom;
    this.setScale(this.baseScale / zoom);
  }

  attachFleetsContainer(fleetsContainer: FleetsContainer) {
    this.fleetsContainer = fleetsContainer;
    this.labelContainer.add(fleetsContainer);
    this._updatePositions();
  }

  removeFleetsContainer() {
    if (!this.fleetsContainer) return;

    this.labelContainer.remove(this.fleetsContainer);
    this._updatePositions();
    this.fleetsContainer.setPosition(0, 0);
    const fleetsContainer = this.fleetsContainer;
    this.fleetsContainer = undefined;

    return fleetsContainer;
  }
}
