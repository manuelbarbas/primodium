import { Coord } from "engine/types";
import { PrimodiumScene } from "@/game/api/scene";
import { BaseAsteroid } from "./BaseAsteroid";
import { DepthLayers } from "@/game/lib/constants/common";
import { Entity } from "@latticexyz/recs";
import { LODs } from "@/game/lib/objects/Asteroid/helpers";
import { Animations, Assets, Sprites } from "@primodiumxyz/assets";

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
      return LODs.FullyShow;
    }
    if (zoom >= 0) {
      return LODs.ShowLabelOnly;
    }

    return 0;
  }

  explode(newPosition?: Coord) {
    const animation = Animations.ShardExplosionDefault;
    const shakeDuration = 2000;
    const shakeInterval = 100;
    const sequence = [
      // shake
      {
        at: 0,
        run: () => {
          // Create red overlay sprite with 10% opacity
          this.asteroidLabel.setVisible(false);
          const overlay = new Phaser.GameObjects.Sprite(
            this.scene,
            this.asteroidSprite.x,
            this.asteroidSprite.y,
            Assets.SpriteAtlas,
            Sprites.Shard
          );

          overlay.setTintFill(0xff0000);
          overlay.setBlendMode(Phaser.BlendModes.OVERLAY);
          overlay.setDepth(this.asteroidSprite.depth + 1);
          overlay.setAlpha(0.25);
          overlay.setScale(0.75);

          this.scene.add.existing(overlay);

          // Function to create random shake
          const shakeTween = () => {
            const timeElapsedPct = (this.scene.time.now - startTime) / shakeDuration;
            const shakeDistance = 10 * timeElapsedPct + 5;
            const shakeAngle = Math.random() * Math.PI * 2; // Random angle
            const deltaX = Math.cos(shakeAngle) * shakeDistance;
            const deltaY = Math.sin(shakeAngle) * shakeDistance;

            const duration =
              timeElapsedPct < 0.5 ? shakeInterval : timeElapsedPct < 0.8 ? shakeInterval / 2 : shakeInterval / 4;
            console.log({ timeElapsedPct, deltaX, deltaY, duration });
            this.scene.tweens.add({
              targets: [this.asteroidSprite, overlay],
              x: `+=${deltaX}`,
              y: `+=${deltaY}`,
              duration,
              yoyo: true,
              repeat: 0,
              onComplete: () => {
                if (this.scene.time.now - startTime < shakeDuration) {
                  shakeTween(); // Continue shaking until 2 seconds pass
                } else {
                  overlay.destroy(); // Remove the overlay after shaking
                }
              },
            });
          };

          const startTime = this.scene.time.now;
          shakeTween();
        },
      },
      // explode
      {
        at: shakeDuration,
        run: () => {
          this.asteroidSprite.anims.stop();
          this.asteroidSprite.play(animation);
          this.asteroidSprite.anims.currentAnim!.key = "explode";
          this.asteroidSprite.once("animationcomplete-explode", () => {
            this.asteroidSprite.setTexture(Assets.SpriteAtlas, Sprites.Shard);
            this.getFleetContainer().clearOrbit();
            if (newPosition) this.respawn(newPosition);
            else this.asteroidSprite.setTexture(Assets.SpriteAtlas, Sprites.Shard);
            this.asteroidLabel.setVisible(true);
          });
        },
      },
    ];

    this.scene.add.timeline(sequence).play();
  }

  respawn(newPosition: Coord) {
    this.getFleetContainer().clearOrbit();
    this.setTilePosition(newPosition);

    const animation = Animations.ShardExplosionDefault;
    this.asteroidSprite.playReverse(animation);
    this.asteroidSprite.anims.currentAnim!.key = "respawn";
    this.asteroidSprite.once("animationcomplete-respawn", () => {
      this.asteroidSprite.setTexture(Assets.SpriteAtlas, Sprites.Shard);
    });
  }
}
