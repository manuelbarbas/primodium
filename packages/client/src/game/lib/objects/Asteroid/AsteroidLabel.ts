import { MainbaseLevelToEmblem } from "@/game/lib/mappings";
import { Assets } from "@primodiumxyz/assets";
import { PixelCoord, Scene } from "engine/types";

const MARGIN = 5;

type LabelArgs = {
  ownerLabel: string;
  allianceLabel: string;
  nameLabel: string;
  ownerLabelColor: number;
  nameLabelColor: number;
  allianceLabelColor: number;
};

export class AsteroidLabel extends Phaser.GameObjects.Container {
  private _scene: Scene;
  private coord: PixelCoord;
  private labelContainer: Phaser.GameObjects.Container;
  private emblemSprite: Phaser.GameObjects.Image;
  private asteroidLabel: Phaser.GameObjects.BitmapText;
  private ownerLabel: Phaser.GameObjects.BitmapText;
  private allianceLabel: Phaser.GameObjects.BitmapText;
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

    this.asteroidLabel = new Phaser.GameObjects.BitmapText(scene.phaserScene, 0, 0, "teletactile", asteroidName, 14)
      .setDepth(1000)
      .setTintFill(asteroidNameColor);

    this.ownerLabel = new Phaser.GameObjects.BitmapText(scene.phaserScene, 0, 0, "teletactile", ownerLabel, 12)
      .setDepth(1000)
      .setAlpha(0.5)
      .setTintFill(ownerLabelColor)
      .setCharacterTint(1, -1, true, 0xffffff)
      .setCharacterTint(0, 1, true, 0xffffff);

    this.allianceLabel = new Phaser.GameObjects.BitmapText(scene.phaserScene, 0, 0, "teletactile", undefined, 12)
      .setDepth(1000)
      .setAlpha(0.8)
      .setTintFill(allianceLabelColor);

    this._updatePositions();
    this.labelContainer.add([this.asteroidLabel, this.ownerLabel, this.allianceLabel]);
    this.add([this.emblemSprite, this.labelContainer]);
  }

  // [Emblem][Margin][AsteroidLabel]
  // [      ][Margin][AllianceLabel][Margin][OwnerLabel]
  private _updatePositions() {
    this.asteroidLabel.setPosition(this.emblemSprite.width + MARGIN, 0);
    this.allianceLabel.setPosition(this.emblemSprite.width + MARGIN, this.asteroidLabel.height + MARGIN);
    this.ownerLabel.setPosition(
      this.allianceLabel.text
        ? this.allianceLabel.x + this.allianceLabel.width + MARGIN
        : this.emblemSprite.width + MARGIN,
      this.allianceLabel.y
    );

    //center labels with emblem
    this.labelContainer.setY(-this.labelContainer.getBounds().height / 2);
  }

  setProperties(args: Partial<LabelArgs>) {
    args.nameLabel && this.asteroidLabel.setText(args.nameLabel);
    args.ownerLabel && this.ownerLabel.setText(args.ownerLabel);

    args.nameLabelColor && this.asteroidLabel.setTintFill(args.nameLabelColor);
    args.ownerLabelColor && this.ownerLabel.setTintFill(args.ownerLabelColor);
    args.allianceLabel && this.allianceLabel.setText(`[${args.allianceLabel}]`);
    args.allianceLabelColor && this.allianceLabel.setTintFill(args.allianceLabelColor);

    this._updatePositions();
  }

  setLevel(level: bigint) {
    this.emblemSprite.setTexture(
      Assets.SpriteAtlas,
      MainbaseLevelToEmblem[Phaser.Math.Clamp(Number(level) - 1, 0, MainbaseLevelToEmblem.length - 1)]
    );
    return this;
  }

  setBaseScale(scale: number) {
    this.baseScale = scale;
    return this;
  }

  update() {
    const zoom = this._scene.camera.phaserCamera.zoom;
    this.setScale(this.baseScale / zoom);
  }

  dispose() {
    this.destroy();
  }
}
