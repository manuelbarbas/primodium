import Phaser from "phaser";
import { Coord } from "@primodiumxyz/engine/types";
import { Assets } from "@primodiumxyz/assets";
import { Entity } from "@primodiumxyz/reactive-tables";
import { Dimensions } from "@primodiumxyz/core";

import { PrimodiumScene } from "@game/types";
import { triggerPlacementAnim } from "@game/lib/objects/building/triggerPlacementAnim";
import { getAssetKeyPair, getUpgradeAnimation } from "@game/lib/objects/building/helpers";
import { DepthLayers } from "@game/lib/constants/common";
import { IPrimodiumGameObject } from "@game/lib/objects/interfaces";
import { isValidClick, isValidHover } from "@game/lib/objects/inputGuards";

export class Building extends Phaser.GameObjects.Sprite implements IPrimodiumGameObject {
  readonly id: Entity;

  private buildingType: Entity;
  private coord: Coord;
  protected _scene: PrimodiumScene;
  private level = 1n;
  private spawned = false;
  private dimensions: Dimensions = { width: 1, height: 1 };

  constructor(args: { id: Entity; scene: PrimodiumScene; buildingType: Entity; coord: Coord; dimensions: Dimensions }) {
    const { id, scene, buildingType, coord, dimensions } = args;
    const assetPair = getAssetKeyPair(1n, buildingType);
    const pixelCoord = scene.utils.tileCoordToPixelCoord(coord);
    super(
      scene.phaserScene,
      pixelCoord.x,
      -pixelCoord.y + scene.tiled.tileHeight,
      Assets.SpriteAtlas,
      assetPair.sprite
    );

    this.id = id;
    assetPair.animation && this.play(assetPair.animation);
    this.setOrigin(0, 1);
    this.setDepth(DepthLayers.Building - 5 * coord.y);
    this.setInteractive(this.scene.input.makePixelPerfect());

    this.buildingType = buildingType;

    this.dimensions = dimensions;
    this.coord = coord;
    this._scene = scene;

    //add to object pool
    this._scene.objects.building.add(id, this);
  }

  spawn() {
    //TODO: placement animation

    this.scene.add.existing(this);
    this.spawned = true;
    return this;
  }

  onClick(fn: (e: Phaser.Input.Pointer) => void) {
    this.on(Phaser.Input.Events.POINTER_UP, (e: Phaser.Input.Pointer) => {
      if (!isValidClick(e)) return;
      fn(e);
    });
    return this;
  }

  onHoverEnter(fn: (e: Phaser.Input.Pointer) => void) {
    this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, (e: Phaser.Input.Pointer) => {
      if (!isValidHover(e)) return;
      fn(e);
    });
    return this;
  }

  onHoverExit(fn: (e: Phaser.Input.Pointer) => void) {
    this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, (e: Phaser.Input.Pointer) => {
      fn(e);
    });
    return this;
  }

  isSpawned() {
    return this.spawned;
  }

  triggerPlacementAnim() {
    triggerPlacementAnim(this._scene, this.id, this.coord, this.dimensions);
  }

  getCoord() {
    return this.coord;
  }

  setCoordPosition(coord: Coord) {
    const pixelCoord = this._scene.utils.tileCoordToPixelCoord(coord);
    super.setPosition(pixelCoord.x, -pixelCoord.y + this._scene.tiled.tileHeight);
    this.coord = coord;
    return this;
  }

  override setActive(active: boolean) {
    if (active) {
      this.setTint(0xffffff);
      this.anims.resume();
      return this;
    }

    this.setTint(0x777777);
    this.anims.pause();
    return this;
  }

  setLevel(level: bigint, skipAnimation = false) {
    const oldAssetPair = getAssetKeyPair(this.level, this.buildingType);
    this.level = level;
    const newAssetPair = getAssetKeyPair(level, this.buildingType);
    const setNewAssets = () => {
      this.setTexture(Assets.SpriteAtlas, newAssetPair.sprite);
      const assetPair = getAssetKeyPair(level, this.buildingType);
      this.anims.stop();
      assetPair.animation && this.play(assetPair.animation);
    };

    //TODO: level up animation
    const animation = getUpgradeAnimation(this.dimensions);
    if (level > 1 && !skipAnimation && animation) {
      const sequence = {
        at: 0,
        run: () => {
          const overlay = new Phaser.GameObjects.Sprite(
            this.scene,
            this.x - animation.offset.x,
            this.y + animation.offset.y,
            Assets.SpriteAtlas,
            oldAssetPair.sprite
          );
          this._scene.audio.play("Upgrade", "sfx");
          overlay.setOrigin(0, 1);
          overlay.setDepth(this.depth + 1);
          if (animation.warp) overlay.setScale(animation.warp.x, animation.warp.y);
          overlay.play(animation.animation);
          this.scene.add.existing(overlay);

          const updateCallback = (
            phaserAnimation: Phaser.Animations.Animation,
            frame: Phaser.Animations.AnimationFrame
          ) => {
            if (phaserAnimation.key === animation.animation && frame.index === animation.changeFrame) setNewAssets();
          };
          overlay.on(Phaser.Animations.Events.ANIMATION_UPDATE, updateCallback);
          overlay.once(`animationcomplete-${animation.animation}`, () => {
            this.off(Phaser.Animations.Events.ANIMATION_UPDATE, updateCallback);
            overlay.destroy();
          });
        },
      };

      this.scene.add.timeline(sequence).play();
    } else setNewAssets();

    return this;
  }

  setBuildingType(buildingType: Entity) {
    this.buildingType = buildingType;
    const assetPair = getAssetKeyPair(this.level, buildingType);
    this.setTexture(Assets.SpriteAtlas, assetPair.sprite);
    this.anims.stop();
    assetPair.animation && this.play(assetPair.animation);
    return this;
  }

  setOutline = (color: number, thickness: number, knockout = false) => {
    this.postFX?.addGlow(color, thickness, undefined, knockout);

    return this;
  };

  clearOutline = () => {
    this.postFX?.clear();

    return this;
  };

  demolish() {
    //TODO: despawn animation
    this._scene.audio.play("Demolish", "sfx");
    triggerPlacementAnim(this._scene, this.id, this.coord, this.dimensions);
    this.destroy();
  }

  override destroy() {
    this._scene.objects.building.remove(this.id);
    super.destroy();
  }
}
