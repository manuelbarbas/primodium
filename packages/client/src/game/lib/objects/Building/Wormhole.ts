import Phaser from "phaser";
import { Entity } from "@latticexyz/recs";
import { Coord } from "@primodiumxyz/engine/types";
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
  private resourceSpriteTop: Phaser.GameObjects.Image;
  private resourceSpriteBottom: Phaser.GameObjects.Image;
  private blueTintSprite: Phaser.GameObjects.Image;
  private resource: Entity;
  private wormholeState: WormholeStates;
  private bottomAlpha = 0.88;
  private topAlpha = 0.5;
  private tintAlpha = 0.15;
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
    const pixelCoord = scene.utils.tileCoordToPixelCoord(coord);

    this.resource = args.resource;

    const bob = 3;

    this.resourceSpriteBottom = new Phaser.GameObjects.Image(
      scene.phaserScene,
      pixelCoord.x + this.width / 2,
      -pixelCoord.y + scene.tiled.tileHeight - this.height + 40 + bob,
      Assets.SpriteAtlas,
      EntityTypeToResourceSprites[args.resource]
    )
      .setAlpha(this.bottomAlpha)
      .setBlendMode(Phaser.BlendModes.NORMAL)
      .setDepth(DepthLayers.Building + 2);

    this.resourceSpriteBottom.postFX?.addGlow(0x00ffff, 3, 0);
    //  Top resource art layer
    this.resourceSpriteTop = new Phaser.GameObjects.Image(
      scene.phaserScene,
      pixelCoord.x + this.width / 2,
      -pixelCoord.y + scene.tiled.tileHeight - this.height + 40 + bob,
      Assets.SpriteAtlas,
      EntityTypeToResourceSprites[args.resource]
    )
      .setAlpha(this.topAlpha)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(DepthLayers.Building + 3);

    this.blueTintSprite = new Phaser.GameObjects.Image(
      scene.phaserScene,
      pixelCoord.x + this.width / 2,
      -pixelCoord.y + scene.tiled.tileHeight - this.height + 40 + bob,
      Assets.SpriteAtlas,
      EntityTypeToResourceSprites[args.resource]
    )
      .setTint(0x00ffff)
      .setAlpha(this.tintAlpha)
      .setBlendMode(Phaser.BlendModes.OVERLAY)
      .setDepth(DepthLayers.Building + 4);

    scene.phaserScene.add.existing(this.blueTintSprite);
    scene.phaserScene.add.existing(this.resourceSpriteBottom);
    scene.phaserScene.add.existing(this.resourceSpriteTop);

    this._scene.phaserScene.tweens.add({
      targets: [this.blueTintSprite, this.resourceSpriteBottom, this.resourceSpriteTop],
      y: -pixelCoord.y + scene.tiled.tileHeight - this.height + 40 - bob,
      duration: 3000, // Duration of one bobbing cycle
      yoyo: true, // Make the tween go back to the original value
      repeat: -1, // Repeat indefinitely
      ease: "Sine.easeInOut", // Smooth easing
    });
    this.wormholeState = args.initialState ?? "idle";
  }

  public setResource(resourceEntity: Entity) {
    this.resource = resourceEntity;
    const spriteKey = EntityTypeToResourceSprites[resourceEntity];
    this.resourceSpriteBottom.setTexture(Assets.SpriteAtlas, spriteKey);
    this.resourceSpriteTop.setTexture(Assets.SpriteAtlas, spriteKey);
    this.blueTintSprite.setTexture(Assets.SpriteAtlas, spriteKey);
  }

  private showResourceAnimation(duration: number = 2000) {
    const show = (target: Phaser.GameObjects.Image, alpha: number) => {
      this._scene.phaserScene.tweens.add({
        targets: target,
        alpha: alpha,
        duration: duration,
        ease: "Power2",
      });
    };
    show(this.resourceSpriteTop, this.topAlpha);
    show(this.resourceSpriteBottom, this.bottomAlpha);
    show(this.blueTintSprite, this.tintAlpha);
  }
  private hideResourceAnimation(duration: number = 2000) {
    this._scene.phaserScene.tweens.add({
      targets: [this.resourceSpriteTop, this.resourceSpriteBottom, this.blueTintSprite],
      alpha: 0,
      duration: duration,
      ease: "Power2",
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
          if (animation.key === "overheating" && frame.index === 4) {
            this._scene.fx.flashScreen({ duration: 600 });
            this.hideResourceAnimation(0);
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
    if (this.wormholeState === "powerup") return;
    const updateCallback = (animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) => {
      if (animation.key === "powerup" && frame.index === 11) {
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

  public runChangeResourceAnimation(newResource: Entity) {
    if (this.resource === newResource) return;
    if (this.wormholeState === "overheating" || this.wormholeState === "cooldown") {
      this.setResource(newResource);
      return;
    }

    const sequence = {
      at: 0,
      run: () => {
        const assetPair = getWormholeAssetKeyPair("powerup");
        this.setTexture(Assets.SpriteAtlas, assetPair.sprite);
        this.hideResourceAnimation();

        this.playReverse(assetPair.animation);

        this.anims.currentAnim!.key = "powerdown";
        this.once("animationcomplete-powerdown", () => {
          this.setResource(newResource);
          this.runPowerUpAnimation();
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
    if (state == "idle") this.showResourceAnimation(0);
    else if (state == "cooldown") this.hideResourceAnimation(0);
    if (assetPair.animation) {
      this.play(assetPair.animation);
      this.anims.currentAnim!.key = state;
    }
  }

  public getWormholeState() {
    return this.wormholeState;
  }

  public destroy() {
    super.destroy();
    this.resourceSpriteTop.destroy();
    this.resourceSpriteBottom.destroy();
    this.blueTintSprite.destroy();
  }
}
