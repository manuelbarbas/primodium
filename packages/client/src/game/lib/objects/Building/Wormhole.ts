import Phaser from "phaser";
import { Entity } from "@latticexyz/recs";
import { Coord } from "engine/types";
import { PrimodiumScene } from "@/game/api/scene";
import { DepthLayers } from "../../constants/common";
import { IPrimodiumGameObject } from "../interfaces";
import { Assets } from "@primodiumxyz/assets";
import { EntityType } from "@/util/constants";
import { Building } from "@/game/lib/objects/Building";
import { EntityTypeToResourceSprites } from "@/game/lib/mappings";
import { getWormholeAssetKeyPair } from "@/game/lib/objects/Building/wormholeAnimations";
import { WormholeStates } from "@/game/lib/objects/Building/wormholeAnimations";

export class WormholeBase extends Building implements IPrimodiumGameObject {
  private resourceSprite: Phaser.GameObjects.Image;
  private resource: Entity;
  private wormholeState: WormholeStates;

  constructor(args: {
    initialState: WormholeStates;
    resource: Entity;
    id: Entity;
    scene: PrimodiumScene;
    coord: Coord;
  }) {
    const { scene, coord } = args;
    const buildingType = EntityType.WormholeBase;

    super({ ...args, buildingType });
    // this.resource = args.resource;
    const pixelCoord = scene.utils.tileCoordToPixelCoord(coord);

    this.resource = args.resource;

    this.resourceSprite = new Phaser.GameObjects.Image(
      scene.phaserScene,
      pixelCoord.x + this.width / 2,
      -pixelCoord.y + scene.tiled.tileHeight - this.height + 40,
      Assets.SpriteAtlas,
      EntityTypeToResourceSprites[args.resource]
    ).setDepth(DepthLayers.Building + 1);

    scene.phaserScene.add.existing(this.resourceSprite);
    this.wormholeState = args.initialState ?? "idle";
  }

  public setResource(resourceEntity: Entity) {
    this.resource = resourceEntity;
    this.resourceSprite.setTexture(Assets.SpriteAtlas, EntityTypeToResourceSprites[resourceEntity]);
  }

  private hideResourceAnimation() {
    this.resourceSprite.setAlpha(0);
  }

  private showResourceAnimation() {
    this._scene.phaserScene.tweens.add({
      targets: this.resourceSprite,
      alpha: 1,
      duration: 2000, // Duration of the tween in milliseconds
      ease: "Power2", // Easing function for the tween
    });
  }
  public runExplosionAnimation() {
    if (this.wormholeState === "overheating" || this.wormholeState === "cooldown") return;
    const sequence = {
      at: 0,
      run: () => {
        this.setWormholeState("overheating");
        // Listen for the animation complete event
        // Listen for the animation update event once
        const updateCallback = (animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) => {
          if (animation.key === "overheating" && frame.index === 5) {
            this._scene.fx.flashScreen();
            this.hideResourceAnimation();
          }
        };
        this.on(Phaser.Animations.Events.ANIMATION_UPDATE, updateCallback);
        this.once("animationcomplete-overheating", () => {
          this.off(Phaser.Animations.Events.ANIMATION_UPDATE, updateCallback);
          this.setWormholeState("cooldown");
        });
      },
    };
    this._scene.phaserScene.add.timeline(sequence).play();
  }

  public runPowerUpAnimation() {
    if (this.wormholeState === "powerup" || this.wormholeState === "idle") return;
    const updateCallback = (animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) => {
      if (animation.key === "powerup" && frame.index === 9) {
        this.showResourceAnimation();
      }
    };
    const sequence = {
      at: 0,
      run: () => {
        this.setWormholeState("powerup");

        this.on(Phaser.Animations.Events.ANIMATION_UPDATE, updateCallback);
        this.once("animationcomplete-powerup", () => {
          this.setWormholeState("idle");
        });
      },
    };
    this._scene.phaserScene.add.timeline(sequence).play();
  }

  public setWormholeState(state: WormholeStates) {
    if (this.wormholeState === state) return;
    this.wormholeState = state;
    const assetPair = getWormholeAssetKeyPair(state);
    this.setTexture(Assets.SpriteAtlas, assetPair.sprite);

    this.anims.stop();
    if (state == "idle") this.resourceSprite.setAlpha(1);
    else if (state == "cooldown") this.resourceSprite.setAlpha(0);
    if (assetPair.animation) {
      this.play(assetPair.animation);
      this.anims.currentAnim!.key = state;
    }
  }

  public getWormholeState() {
    return this.wormholeState;
  }
}
